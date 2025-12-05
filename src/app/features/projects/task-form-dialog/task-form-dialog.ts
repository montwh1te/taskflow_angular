import { Component, Inject, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialImportsModule } from '../../../material-imports.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { StorageAdapterService } from '../storage-adapter.service';
import { TaskAttachment } from '../../../core/models/task.model';
import { finalize } from 'rxjs/operators';

export interface TaskFormData {
  id?: string;
  title: string;
  description: string;
  status: string;
  dueDate: Date;
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
  private storageService = inject(StorageAdapterService);

  form: FormGroup;
  statusOptions = ['A Fazer', 'Em Andamento', 'Concluído'];
  uploadingFile = false;
  selectedFiles: File[] = [];
  attachments: TaskAttachment[] = [];

  constructor(
    public dialogRef: MatDialogRef<TaskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskFormData
  ) {
    this.form = this.fb.group({
      title: [data.title || '', Validators.required],
      description: [data.description || '', Validators.required],
      status: [data.status || 'A Fazer', Validators.required],
      dueDate: [data.dueDate || '', Validators.required],
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
    if (this.selectedFiles.length === 0 || !this.data.id) {
      return;
    }

    this.uploadingFile = true;
    let uploadedCount = 0;

    this.selectedFiles.forEach(file => {
      this.storageService.uploadFile(file, this.data.id!)
        .pipe(finalize(() => {
          uploadedCount++;
          if (uploadedCount === this.selectedFiles.length) {
            this.uploadingFile = false;
            this.selectedFiles = [];
          }
        }))
        .subscribe(
          (fileUrl) => {
            const attachment: TaskAttachment = {
              id: `${Date.now()}-${file.name}`,
              fileName: file.name,
              fileUrl: fileUrl,
              fileSize: file.size,
              uploadedAt: new Date()
            };
            this.attachments.push(attachment);
          },
          (error) => {
            console.error('Erro ao fazer upload:', error);
          }
        );
    });
  }

  /**
   * Remove um anexo
   */
  removeAttachment(attachment: TaskAttachment) {
    this.storageService.deleteFile(this.data.id!, attachment.fileName)
      .subscribe(
        () => {
          this.attachments = this.attachments.filter(a => a.id !== attachment.id);
        },
        (error: any) => {
          console.error('Erro ao deletar arquivo:', error);
        }
      );
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
