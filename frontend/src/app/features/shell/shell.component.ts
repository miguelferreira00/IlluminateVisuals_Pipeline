import { Component, OnInit, signal, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/auth/auth.service';
import { ContactoService } from '../../core/services/contacto.service';
import { ContactoResumo } from '../../core/models/models';

type NavView = 'pipeline' | 'agenda' | 'dashboard';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div style="display:flex;height:100vh;overflow:hidden;">
      <app-sidebar
        [view]="activeView()"
        [user]="auth.user()"
        [contacts]="contacts()"
        (setView)="navigate($event)"
        (logout)="auth.logout()" />
      <main style="flex:1;overflow:hidden;display:flex;flex-direction:column;">
        <router-outlet />
      </main>
    </div>
  `
})
export class ShellComponent implements OnInit {
  contacts = signal<ContactoResumo[]>([]);
  activeView = signal<NavView>('pipeline');

  constructor(
    public auth: AuthService,
    private router: Router,
    private contactoService: ContactoService
  ) {}

  ngOnInit(): void {
    this.loadContacts();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const path = e.urlAfterRedirects.split('/')[1] as NavView;
      if (['pipeline','agenda','dashboard'].includes(path)) this.activeView.set(path);
    });
    const path = this.router.url.split('/')[1] as NavView;
    if (['pipeline','agenda','dashboard'].includes(path)) this.activeView.set(path);
  }

  navigate(view: NavView): void {
    this.activeView.set(view);
    this.router.navigate(['/' + view]);
  }

  loadContacts(): void {
    this.contactoService.listar(undefined, undefined, undefined, 0, 200).subscribe({
      next: page => this.contacts.set(page.content),
      error: () => {}
    });
  }
}
