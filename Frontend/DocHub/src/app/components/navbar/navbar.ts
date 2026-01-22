import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { FileUploadComponent } from "../file-upload/file-upload";
import { RouterLink, RouterModule } from "@angular/router";
import { UserService } from '../../services/user.service';
import { SpinnerComponent } from "../spinner/spinner";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  imports: [FileUploadComponent, RouterLink, RouterModule, SpinnerComponent],
})
export class Navbar {
  authService = inject(AuthService)
    private userService = inject(UserService);
    private cdr = inject(ChangeDetectorRef
    )
  @Input() isMobile = false;
  @Output() menuClick = new EventEmitter<void>();
   isProfileOpen = false;
  username = 'Pranav';
    loading =false;

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  closeProfile() {
    this.isProfileOpen = false;
  }

  logout() {
    this.closeProfile();
    this.authService.logout();
  }

  ngOnInit() {
    this.loadUser();
  }

  private loadUser() {
    this.loading = true;
    this.userService.getUser().subscribe({
      next: (user) => {

        this.username = user.data.user_name; // or user.name / user.fullName
        this.loading=false;
        this.cdr.detectChanges()
      },
      error: () => {
        console.log("error");

        this.username = '';

        this.loading = false;
        this.cdr.detectChanges()
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu')) {
      this.closeProfile();
    }
  }
}
