import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getBytes, deleteObject, list, ListResult } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage = inject(Storage);

  /**
   * Upload de um arquivo para o Storage
   */
  uploadFile(file: File, taskId: string): Observable<string> {
    const storageRef = ref(this.storage, `attachments/${taskId}/${file.name}`);

    return from(uploadBytes(storageRef, file)).pipe(
      switchMap(() => this.getFileUrl(taskId, file.name))
    );
  }

  /**
   * Obtém a URL de download de um arquivo
   */
  private getFileUrl(taskId: string, fileName: string): Observable<string> {
    const fileRef = ref(this.storage, `attachments/${taskId}/${fileName}`);
    // Para obter a URL, você precisaria usar getDownloadURL do Firebase Admin SDK
    // Aqui vamos usar um formato padrão
    return from(Promise.resolve(`gs://your-bucket/attachments/${taskId}/${fileName}`));
  }

  /**
   * Deleta um arquivo do Storage
   */
  deleteFile(taskId: string, fileName: string): Observable<void> {
    const fileRef = ref(this.storage, `attachments/${taskId}/${fileName}`);
    return from(deleteObject(fileRef));
  }

  /**
   * Lista todos os arquivos de uma tarefa
   */
  listTaskAttachments(taskId: string): Observable<ListResult> {
    const dirRef = ref(this.storage, `attachments/${taskId}`);
    return from(list(dirRef));
  }

  /**
   * Download de um arquivo
   */
  downloadFile(taskId: string, fileName: string): Observable<Uint8Array> {
    const fileRef = ref(this.storage, `attachments/${taskId}/${fileName}`);
    return from(getBytes(fileRef)).pipe(
      map(arrayBuffer => new Uint8Array(arrayBuffer))
    );
  }
}
