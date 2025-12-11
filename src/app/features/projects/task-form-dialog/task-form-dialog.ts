import { Component, Inject, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialImportsModule } from '../../../material-imports.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { FirebaseStorageAdapterService } from '../firebase-storage-adapter.service';
import { TaskService } from '../task.service';
import { TaskAttachment } from '../../../core/models/task.model';
import { finalize } from 'rxjs/operators';

export interface TaskFormData {
  id?: string;
  title: string;
  description: string;
  status: string;
  dueDate?: Date | string | any;
  attachments?: TaskAttachment[];
}

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  templateUrl: './task-form-dialog.html',
  styleUrls: ['./task-form-dialog.scss'],
  imports: [CommonModule, MaterialImportsModule, ReactiveFormsModule, MatProgressSpinnerModule, MatListModule]
})
export class TaskFormDialogComponent {
  private fb = inject(FormBuilder);
  private storageService = inject(FirebaseStorageAdapterService);
  private taskService = inject(TaskService);

  form: FormGroup;
  statusOptions = ['A Fazer', 'Em Andamento', 'Concluído'];
  uploadingFile = false;
  selectedFiles: File[] = [];
  attachments: TaskAttachment[] = [];

  constructor(
    public dialogRef: MatDialogRef<TaskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskFormData
  ) {
    // Converter dueDate para formato ISO se for Date
    let dueDateValue: string = '';
    if (data.dueDate instanceof Date) {
      dueDateValue = data.dueDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    } else if (typeof data.dueDate === 'string') {
      // Se já é string, tenta extrair só a data
      dueDateValue = data.dueDate.split('T')[0];
    } else if (data.dueDate && typeof data.dueDate === 'object' && 'toDate' in data.dueDate) {
      // Firestore Timestamp
      dueDateValue = data.dueDate.toDate().toISOString().split('T')[0];
    }

    this.form = this.fb.group({
      title: [data.title || '', Validators.required],
      description: [data.description || '', Validators.required],
      status: [data.status || 'A Fazer', Validators.required],
      dueDate: [dueDateValue || '', Validators.required],
    });

    this.attachments = data.attachments || [];
  }

  /**
   * Manipula seleção de arquivos
   */
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
    }
  }

  /**
   * Faz upload dos arquivos selecionados
   */
  uploadFiles() {
    if (this.selectedFiles.length === 0) {
      console.warn('⚠️ Nenhum arquivo selecionado');
      return;
    }

    // Se não tem ID (tarefa nova), gerar ID temporário
    const taskId = this.data.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('📤 Iniciando upload para tarefa:', taskId, 'Arquivos:', this.selectedFiles.length);

    this.uploadingFile = true;
    let uploadedCount = 0;

    this.selectedFiles.forEach((file, index) => {
      console.log(`📁 Upload ${index + 1}/${this.selectedFiles.length}:`, file.name);
      this.storageService.uploadFile(file, taskId)
        .pipe(finalize(() => {
          uploadedCount++;
          console.log(`✅ Upload concluído: ${uploadedCount}/${this.selectedFiles.length}`);
          if (uploadedCount === this.selectedFiles.length) {
            this.uploadingFile = false;
            console.log('🎉 Todos os arquivos uploadados');
            this.selectedFiles = [];
          }
        }))
        .subscribe(
          (fileUrl) => {
            console.log('🔗 URL recebida:', fileUrl.substring(0, 80) + '...');
            const attachment: TaskAttachment = {
              id: `${Date.now()}-${file.name}`,
              fileName: file.name,
              fileUrl: fileUrl, // URL completa de download
              fileSize: file.size,
              uploadedAt: new Date()
            };
            this.attachments.push(attachment);
            console.log('✅ Anexo adicionado à lista:', file.name);
          },
          (error) => {
            console.error('❌ Erro ao fazer upload:', file.name, error);
          }
        );
    });
  }

  /**
   * Remove um anexo
   */
  removeAttachment(attachment: TaskAttachment) {
    console.log('🗑️ Removendo anexo:', attachment.fileName);
    // Apenas remove da lista local - o arquivo no Storage pode ser deletado depois se necessário
    this.attachments = this.attachments.filter(a => a.id !== attachment.id);
    console.log('✅ Anexo removido da lista');
  }

  /**
   * Salva a tarefa com os anexos
   */
  onSave() {
    if (this.form.valid) {
      this.dialogRef.close({
        ...this.form.value,
        attachments: this.attachments
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
