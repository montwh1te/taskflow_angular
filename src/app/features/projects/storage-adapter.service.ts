import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getBytes, deleteObject, list, ListResult } from '@angular/fire/storage';
import { AuthAdapterService } from '../auth/auth-adapter.service';
import { Observable, from, of } from 'rxjs';
import { map, delay, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StorageAdapterService {
  private storage = inject(Storage);
  private authAdapter = inject(AuthAdapterService);

  // localStorage key para arquivos
  private readonly STORAGE_KEY = 'taskflow_attachments';

  /**
   * Upload de um arquivo para o Storage (com fallback para localStorage)
   */
  uploadFile(file: File, taskId: string): Observable<string> {
    console.log('📤 StorageAdapterService.uploadFile() - taskId:', taskId, '- file:', file.name);
    
    // Usar localStorage para armazenar arquivos localmente
    return new Observable<string>(obs => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          // Salvar em localStorage como fallback
          const files = this.getStoredFiles(taskId);
          files.push({
            name: file.name,
            content: reader.result as string
          });
          
          this.saveFilesToStorage(taskId, files);
          
          console.log('✅ Arquivo enviado (localStorage):', file.name);
          obs.next(`local://attachments/${taskId}/${file.name}`);
          obs.complete();
        } catch (error) {
          console.error('❌ Erro ao enviar arquivo:', error);
          obs.error(error);
        }
      };
      reader.onerror = () => {
        console.error('❌ Erro ao ler arquivo');
        obs.error(new Error('Erro ao ler arquivo'));
      };
      reader.readAsDataURL(file);
    }).pipe(delay(500));
  }

  /**
   * Obtém os arquivos armazenados de uma tarefa do localStorage
   */
  private getStoredFiles(taskId: string): { name: string; content: string; }[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const allFiles = stored ? JSON.parse(stored) : {};
      return allFiles[taskId] || [];
    } catch (error) {
      console.error('❌ Erro ao ler arquivos do localStorage:', error);
      return [];
    }
  }

  /**
   * Salva arquivos no localStorage
   */
  private saveFilesToStorage(taskId: string, files: { name: string; content: string; }[]): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const allFiles = stored ? JSON.parse(stored) : {};
      allFiles[taskId] = files;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allFiles));
      console.log('💾 Arquivos salvos em localStorage:', taskId);
    } catch (error) {
      console.error('❌ Erro ao salvar arquivos no localStorage:', error);
    }
  }

  /**
   * Obtém a URL de download de um arquivo
   */
  getFileUrl(taskId: string, fileName: string): Observable<string> {
    console.log('🔗 StorageAdapterService.getFileUrl() - taskId:', taskId, '- fileName:', fileName);
    return of(`local://attachments/${taskId}/${fileName}`).pipe(delay(300));
  }

  /**
   * Deleta um arquivo do Storage
   */
  deleteFile(taskId: string, fileName: string): Observable<void> {
    console.log('🗑️  StorageAdapterService.deleteFile() - taskId:', taskId, '- fileName:', fileName);
    
    try {
      const files = this.getStoredFiles(taskId);
      const filtered = files.filter(f => f.name !== fileName);
      this.saveFilesToStorage(taskId, filtered);
      
      console.log('✅ Arquivo deletado:', fileName);
      return of(void 0).pipe(delay(300));
    } catch (error) {
      console.error('❌ Erro ao deletar arquivo:', error);
      return of(void 0);
    }
  }

  /**
   * Lista todos os arquivos de uma tarefa
   */
  listTaskAttachments(taskId: string): Observable<any[]> {
    console.log('📋 StorageAdapterService.listTaskAttachments() - taskId:', taskId);
    
    try {
      const files = this.getStoredFiles(taskId);
      const result = files.map(f => ({
        name: f.name,
        fullPath: `attachments/${taskId}/${f.name}`
      }));
      
      console.log('📋 Arquivos encontrados:', result.length);
      return of(result).pipe(delay(300));
    } catch (error) {
      console.error('❌ Erro ao listar arquivos:', error);
      return of([]);
    }
  }

  /**
   * Download de um arquivo
   */
  downloadFile(taskId: string, fileName: string): Observable<Uint8Array> {
    console.log('⬇️  StorageAdapterService.downloadFile() - taskId:', taskId, '- fileName:', fileName);
    
    try {
      const files = this.getStoredFiles(taskId);
      const file = files.find(f => f.name === fileName);
      
      if (file) {
        const encoder = new TextEncoder();
        return of(encoder.encode(file.content)).pipe(delay(300));
      }
      
      console.warn('⚠️  Arquivo não encontrado:', fileName);
      return of(new Uint8Array()).pipe(delay(300));
    } catch (error) {
      console.error('❌ Erro ao fazer download:', error);
      return of(new Uint8Array());
    }
  }
}
