import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportsModule } from '../../../material-imports.module';
import { MatListModule } from '@angular/material/list';
import { TaskAttachment } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-attachments',
  standalone: true,
  imports: [CommonModule, MaterialImportsModule, MatListModule],
  template: `
    <div class="attachments-container" *ngIf="attachments && attachments.length > 0">
      <h4 class="attachments-title">
        <mat-icon>attachment</mat-icon>
        Anexos ({{ attachments.length }})
      </h4>
      <mat-list class="attachments-list">
        <mat-list-item *ngFor="let attachment of attachments" class="attachment-item">
          <mat-icon matListItemIcon>
            {{ getFileIcon(attachment.fileName) }}
          </mat-icon>
          <div matListItemTitle class="file-name">{{ attachment.fileName }}</div>
          <div matListItemLine class="file-info">
            {{ (attachment.fileSize / 1024).toFixed(2) }} KB
            •
            {{ formatDate(attachment.uploadedAt) }}
          </div>
          <a
            matListItemMeta
            [href]="attachment.fileUrl"
            target="_blank"
            rel="noopener noreferrer"
            matTooltip="Fazer download">
            <mat-icon>download</mat-icon>
          </a>
        </mat-list-item>
      </mat-list>
    </div>
  `,
  styles: [`
    .attachments-container {
      margin-top: 16px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .attachments-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      color: #424242;
      margin: 0 0 8px 0;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .attachments-list {
      max-height: 200px;
      overflow-y: auto;
      background-color: white;
      border-radius: 4px;
    }

    .attachment-item {
      border-bottom: 1px solid #e0e0e0;

      &:last-child {
        border-bottom: none;
      }
    }

    .file-name {
      word-break: break-all;
    }

    .file-info {
      font-size: 0.75rem;
      color: #9e9e9e;
    }
  `]
})
export class TaskAttachmentsComponent {
  @Input() attachments: TaskAttachment[] | undefined;

  /**
   * Retorna um ícone apropriado baseado na extensão do arquivo
   */
  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'xls':
      case 'xlsx':
        return 'table_chart';
      case 'ppt':
      case 'pptx':
        return 'slideshow';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'image';
      case 'zip':
      case 'rar':
      case '7z':
        return 'folder_zip';
      default:
        return 'attachment';
    }
  }

  /**
   * Formata a data de upload
   */
  formatDate(date: any): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
