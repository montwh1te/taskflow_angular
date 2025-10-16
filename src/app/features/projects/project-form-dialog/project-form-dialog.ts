import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialImportsModule } from '../../../material-imports.module';
import { DatePipe } from '@angular/common';

export interface ProjectFormData {
  title: string;
  description: string;
}

@Component({
  selector: 'app-project-form-dialog',
  templateUrl: './project-form-dialog.html',
  styleUrls: ['./project-form-dialog.scss'],
  imports: [ MaterialImportsModule, DatePipe, ReactiveFormsModule ]
})
export class ProjectFormDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProjectFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProjectFormData
  ) {
    this.form = this.fb.group({
      title: [data.title || '', Validators.required],
      description: [data.description || '', Validators.required],
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
