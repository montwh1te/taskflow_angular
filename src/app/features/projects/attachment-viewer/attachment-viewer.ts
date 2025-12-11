import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskAttachment } from '../../../core/models/task.model';
import { AttachmentPreviewDialogComponent } from './attachment-preview-dialog.component';

@Component({
  selector: 'app-attachment-viewer',
  standalone: true,
  template: `
    <div class="attachments-container" *ngIf="attachments && attachments.length > 0">
      <div class="attachment-thumbnails">
        <div *ngFor="let attachment of attachments" class="attachment-thumbnail">
          <!-- Thumbnail da imagem -->
          <div class="thumbnail-wrapper" (click)="openPreview(attachment)" matTooltip="Clique para ampliar">
            <img 
              *ngIf="isImage(attachment.fileName)"
              [src]="attachment.fileUrl"
              [alt]="attachment.fileName"
              class="thumbnail-image"
            />
            <mat-icon *ngIf="!isImage(attachment.fileName)" class="file-icon">
              {{ getFileIcon(attachment.fileName) }}
            </mat-icon>
          </div>
          
          <!-- Botão de delete -->
          <button
            mat-icon-button
            color="warn"
            class="delete-btn"
            matTooltip="Excluir anexo"
            (click)="onDeleteAttachment(attachment)"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .attachments-container {
      margin-top: 12px;
      margin-bottom: 12px;
    }

    .attachment-thumbnails {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .attachment-thumbnail {
      position: relative;
      display: inline-block;
    }

    .thumbnail-wrapper {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .thumbnail-wrapper:hover {
      border-color: #1976d2;
      box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
      transform: scale(1.05);
    }

    .thumbnail-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .file-icon {
      font-size: 28px;
      color: #666;
    }

    .delete-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 28px;
      height: 28px;
      background-color: white;
      border: 1px solid #e0e0e0;
      border-radius: 50%;
      padding: 0;
    }

    .delete-btn:hover {
      background-color: #ffebee;
    }

    .delete-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      line-height: 16px;
    }
  `],
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule, MatTooltipModule]
})
export class AttachmentViewerComponent {
  @Input() attachments: TaskAttachment[] | undefined;
  @Output() deleteAttachmentEvent = new EventEmitter<TaskAttachment>();

  private dialog = inject(MatDialog);

  isImage(fileName: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return imageExtensions.includes(ext);
  }

  getFileIcon(fileName: string): string {
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
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

  openPreview(attachment: TaskAttachment): void {
    this.dialog.open(AttachmentPreviewDialogComponent, {
      data: attachment,
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }

  onDeleteAttachment(attachment: TaskAttachment): void {
    console.log('🗑️ Deletar anexo:', attachment.fileName);
    this.deleteAttachmentEvent.emit(attachment);
  }
}
