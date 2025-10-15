import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface TaskFormData {
  title: string;
  description: string;
  status: string;
  dueDate: Date;
}

@Component({
  selector: 'app-task-form-dialog',
  templateUrl: './task-form-dialog.html',
})
export class TaskFormDialogComponent {
  form: FormGroup;
  statusOptions = ['A Fazer', 'Em Andamento', 'Concluído'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TaskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskFormData
  ) {
    this.form = this.fb.group({
      title: [data.title || '', Validators.required],
      description: [data.description || '', Validators.required],
      status: [data.status || 'A Fazer', Validators.required],
      dueDate: [data.dueDate || '', Validators.required],
    });
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
