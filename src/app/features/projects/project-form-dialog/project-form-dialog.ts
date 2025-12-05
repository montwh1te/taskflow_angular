import { Component, Inject, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialImportsModule } from '../../../material-imports.module';

export interface ProjectFormData {
  id?: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-project-form-dialog',
  standalone: true,
  templateUrl: './project-form-dialog.html',
  styleUrls: ['./project-form-dialog.scss'],
  imports: [CommonModule, MaterialImportsModule, ReactiveFormsModule]
})
export class ProjectFormDialogComponent {
  private fb = inject(FormBuilder);

  form: FormGroup;
  isNew: boolean;

  constructor(
    public dialogRef: MatDialogRef<ProjectFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProjectFormData
  ) {
    this.isNew = !data.id;

    this.form = this.fb.group({
      title: [
        data.title || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100)
        ]
      ],
      description: [
        data.description || '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500)
        ]
      ]
    });
  }

  get title() {
    return this.form.get('title');
  }

  get description() {
    return this.form.get('description');
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
