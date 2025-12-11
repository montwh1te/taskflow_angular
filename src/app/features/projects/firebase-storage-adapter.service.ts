import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { Storage, ref, uploadBytes, deleteObject, listAll, getBytes, getDownloadURL, UploadMetadata } from '@angular/fire/storage';
import { FirebaseAuthService } from '../auth/firebase-auth.service';

export interface StorageFile {
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageAdapterService {
  private storage: Storage = inject(Storage);
  private authService: FirebaseAuthService = inject(FirebaseAuthService);

  /**
   * Faz upload de um arquivo para Firebase Storage
   * Retorna URL de download direto do arquivo
   * Caminho: attachments/{userId}/{taskId}/{timestamp}_{filename}
   */
  uploadFile(file: File, taskId: string): Observable<string> {
    console.log('📤🔥 FirebaseStorageAdapterService.uploadFile()', file.name, taskId);

    return this.authService.userId$.pipe(
      switchMap((userId: any) => {
        if (!userId) {
          console.error('❌ Usuário não autenticado');
          return throwError(() => new Error('Usuário não autenticado'));
        }

        const timestamp = Date.now();
        const filePath = `attachments/${userId}/${taskId}/${timestamp}_${file.name}`;
        const fileRef = ref(this.storage, filePath);

        const metadata: UploadMetadata = {
          contentType: file.type,
          customMetadata: {
            taskId: taskId,
            userId: userId,
            uploadedAt: new Date().toISOString(),
            originalName: file.name
          }
        };

        return from(uploadBytes(fileRef, file, metadata)).pipe(
          tap(() => console.log('📤 Arquivo carregado em Storage:', file.name)),
          switchMap(() => {
            // Obter URL de download após upload bem-sucedido
            return from(getDownloadURL(fileRef)).pipe(
              tap(url => console.log('🔗 URL de download obtida:', url))
            );
          }),
          catchError(error => {
            console.error('❌ Erro ao fazer upload ou obter URL:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Deleta um arquivo do Firebase Storage
   */
  deleteFile(filePath: string): Observable<void> {
    console.log('🗑️🔥 FirebaseStorageAdapterService.deleteFile()', filePath);

    const fileRef = ref(this.storage, filePath);
    return from(deleteObject(fileRef)).pipe(
      catchError(error => {
        console.error('❌ Erro ao deletar arquivo:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Lista todos os anexos de uma tarefa
   */
  listTaskAttachments(taskId: string): Observable<StorageFile[]> {
    console.log('📋🔥 FirebaseStorageAdapterService.listTaskAttachments()', taskId);

    return this.authService.userId$.pipe(
      switchMap((userId: any) => {
        if (!userId) {
          console.error('❌ Usuário não autenticado');
          return of([]);
        }

        const folderPath = `attachments/${userId}/${taskId}`;
        const folderRef = ref(this.storage, folderPath);

        return from(listAll(folderRef)).pipe(
          switchMap(result => {
            if (result.items.length === 0) {
              return of([]);
            }

            // Obter URLs para todos os arquivos
            const filePromises = result.items.map(async itemRef => {
              const url = await getDownloadURL(itemRef);
              return {
                name: itemRef.name,
                url: url,
                size: 0,
                createdAt: new Date().toISOString()
              };
            });

            return from(Promise.all(filePromises));
          }),
          catchError(error => {
            console.error('❌ Erro ao listar anexos:', error);
            return of([]);
          })
        );
      })
    );
  }

  /**
   * Baixa um arquivo do Firebase Storage
   */
  downloadFile(filePath: string): Observable<Blob> {
    console.log('⬇️🔥 FirebaseStorageAdapterService.downloadFile()', filePath);

    const fileRef = ref(this.storage, filePath);
    return from(getBytes(fileRef)).pipe(
      map(buffer => new Blob([buffer])),
      catchError(error => {
        console.error('❌ Erro ao baixar arquivo:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtém URL de download direto de um arquivo
   */
  getDownloadUrl(filePath: string): Observable<string> {
    console.log('🔗🔥 FirebaseStorageAdapterService.getDownloadUrl()', filePath);

    const fileRef = ref(this.storage, filePath);
    return from(getDownloadURL(fileRef)).pipe(
      catchError(error => {
        console.error('❌ Erro ao obter URL:', error);
        return throwError(() => error);
      })
    );
  }
}
