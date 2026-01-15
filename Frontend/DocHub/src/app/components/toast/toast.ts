import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toastService';
import { Observable } from 'rxjs';
import { Toast } from '../../models/toast.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss']
})
export class ToastComponent {

  private toastService = inject(ToastService);
  toastClass(type: string): string {
  switch (type) {
    case 'success':
      return 'bg-gradient-to-r from-green-500 to-emerald-600';
    case 'error':
      return 'bg-gradient-to-r from-red-500 to-rose-600';
    case 'info':
      return 'bg-gradient-to-r from-blue-500 to-indigo-600';
    default:
      return 'bg-gray-700';
  }
}


  toast$: Observable<Toast | null> = this.toastService.toast$;

  closeToast(): void {
    this.toastService.clear();
  }
}
