import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({
  name: 'timestampToDate',
  standalone: true
})
export class TimestampToDatePipe implements PipeTransform {
  transform(value: Date | Timestamp | any): Date | null {
    if (value == null) {
      return null;
    }
    
    if (value instanceof Date) {
      return value;
    }
    
    if (value && typeof value.toDate === 'function') {
      return value.toDate();
    }
    
    try {
      return new Date(value);
    } catch {
      return null;
    }
  }
}
