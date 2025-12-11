import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TaskAttachment } from '../../../core/models/task.model';

@Component({
  selector: 'app-attachment-preview-dialog',
  standalone: true,
  template: `
    <div class="preview-container">
      <!-- Imagem -->
      <img 
        *ngIf="isImage()"
        [src]="attachment.fileUrl"
        [alt]="attachment.fileName"
        class="preview-image"
      />
      
      <!-- Arquivo não é imagem -->
      <div *ngIf="!isImage()" class="preview-file">
        <mat-icon class="large-icon">{{ getFileIcon() }}</mat-icon>
        <p class="file-name">{{ attachment.fileName }}</p>
        <p class="file-size">{{ (attachment.fileSize / 1024).toFixed(2) }} KB</p>
        <a [href]="attachment.fileUrl" target="_blank" download class="download-link">
          <mat-icon>download</mat-icon>
          Download
        </a>
      </div>

      <!-- Informações -->
      <div class="file-info">
        <p><strong>{{ attachment.fileName }}</strong></p>
        <p class="secondary">{{ (attachment.fileSize / 1024).toFixed(2) }} KB</p>
      </div>
    </div>
  `,
  styles: [`
    .preview-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .preview-image {
      max-width: 100%;
      max-height: 60vh;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .preview-file {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 32px;
      background-color: #f5f5f5;
      border-radius: 8px;
      min-height: 300px;
      justify-content: center;
    }

    .large-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #999;
    }

    .file-name {
      font-size: 16px;
      font-weight: 500;
      word-break: break-word;
      text-align: center;
    }

    .file-size {
      font-size: 14px;
      color: #666;
    }

    .download-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1976d2;
      text-decoration: none;
      padding: 8px 16px;
      border: 1px solid #1976d2;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .download-link:hover {
      background-color: #e3f2fd;
    }

    .file-info {
      text-align: center;
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      width: 100%;
    }

    .file-info p {
      margin: 4px 0;
    }

    .secondary {
      color: #999;
      font-size: 12px;
    }
  `],
  imports: [CommonModule, MatIconModule, MatDialogModule]
})
export class AttachmentPreviewDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public attachment: TaskAttachment) {}

  isImage(): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const ext = this.attachment.fileName.toLowerCase().substring(this.attachment.fileName.lastIndexOf('.'));
    return imageExtensions.includes(ext);
  }

  getFileIcon(): string {
    const ext = this.attachment.fileName.toLowerCase().substring(this.attachment.fileName.lastIndexOf('.'));
    const iconMap: { [key: string]: string } = {
      '.pdf': 'picture_as_pdf',
      '.doc': 'description',
      '.docx': 'description',
      '.xls': 'table_chart',
      '.xlsx': 'table_chart',
      '.ppt': 'slideshow',
      '.pptx': 'slideshow',
      '.txt': 'text_snippet',
      '.zip': 'folder_zip',
      '.md': 'article'
    };
    return iconMap[ext] || 'attach_file';
  }
}
