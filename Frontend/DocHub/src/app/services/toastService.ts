import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast } from '../models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSubject = new BehaviorSubject<Toast | null>(null);
  toast$ = this.toastSubject.asObservable();

  private timeoutId?: number;
  private currentToastId?: string;

  /* ---------------- CORE ---------------- */

  show(
    message: string,
    type: Toast['type'] = 'info',
    duration = 4000
  ): string {
    // Clear previous toast
    this.clear();

    const id = crypto.randomUUID();
    this.currentToastId = id;

    this.toastSubject.next({ id, message, type });

    if (duration > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.clear();
      }, duration);
    }

    return id;
  }

  update(
    id: string | undefined,
    message: string,
    type: Toast['type'],
    duration = 4000
  ): void {
    // Ignore if toast was replaced
    if (!id || id !== this.currentToastId) return;

    this.clearTimeoutOnly();

    this.toastSubject.next({ id, message, type });

    if (duration > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.clear();
      }, duration);
    }
  }

  /* ---------------- SHORTCUTS ---------------- */

  success(message: string, id?: string, duration = 3000): void {
    id
      ? this.update(id, message, 'success', duration)
      : this.show(message, 'success', duration);
  }

  error(message: string, id?: string, duration = 4000): void {
    id
      ? this.update(id, message, 'error', duration)
      : this.show(message, 'error', duration);
  }

  info(message: string, duration = 4000): void {
    this.show(message, 'info', duration);
  }

  loading(message: string): string {
    // duration = 0 → persistent
    return this.show(message, 'loading', 0);
  }

  /* ---------------- CLEANUP ---------------- */

  clear(): void {
    this.clearTimeoutOnly();
    this.currentToastId = undefined;
    this.toastSubject.next(null);
  }

  private clearTimeoutOnly() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}
