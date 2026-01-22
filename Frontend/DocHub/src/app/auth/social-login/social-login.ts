import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-social-login',
  standalone: true,
  template: ``
})
export class SocialLoginComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get("token");
    if (token) {
      localStorage.setItem("token", token);
      this.router.navigate(['/dashboard']); // redirect to your main app
    } else {
      this.router.navigate(['/login']); // fallback
    }
  }
}
