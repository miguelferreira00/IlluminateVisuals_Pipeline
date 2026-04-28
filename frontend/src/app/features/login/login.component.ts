import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-bg">
      <div class="login-wrap">

        <!-- Brand -->
        <div class="brand-block">
          <div class="brand-icon">
            <img src="logo.svg" alt="IV" style="width:40px;height:40px;object-fit:contain;" />
          </div>
          <h1 style="font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#1A1A18;margin-bottom:4px;">Illuminate Visuals</h1>
          <p style="font-size:13px;color:#9CA3AF;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;">Pipeline</p>
        </div>

        <!-- Card -->
        <div class="login-card">
          <h2 style="font-size:16px;font-weight:700;margin-bottom:6px;">Bem-vindo de volta</h2>
          <p style="font-size:13px;color:#6B6960;margin-bottom:22px;">Seleciona o teu perfil para entrar.</p>

          <!-- Role selector -->
          <div class="role-grid">
            @for (r of roles; track r.id) {
              <button type="button" (click)="selectRole(r.id)"
                class="role-card" [class.active]="role() === r.id">
                <div class="role-icon" [class.active]="role() === r.id">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                       [attr.stroke]="role() === r.id ? '#1A1A18' : '#9CA3AF'"
                       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                       [innerHTML]="r.icon"></svg>
                </div>
                <div style="font-size:14px;font-weight:700;color:#1A1A18;margin-bottom:3px;">{{ r.label }}</div>
                <div style="font-size:11px;color:#6B6960;line-height:1.4;">{{ r.desc }}</div>
              </button>
            }
          </div>

          <!-- Campos CALLER: username + password -->
          <div class="fields-wrap" [style.max-height]="role() === 'CALLER' ? '200px' : '0'"
               [style.opacity]="role() === 'CALLER' ? '1' : '0'"
               [style.margin-bottom]="role() === 'CALLER' ? '16px' : '0'">
            <div class="fg">
              <label>Username</label>
              <input type="text" [(ngModel)]="username" placeholder="caller"
                     autocomplete="username" (keydown.enter)="submit()" />
            </div>
            <div class="fg" style="margin-bottom:0;">
              <label>Password</label>
              <input type="password" [(ngModel)]="password" placeholder="············"
                     autocomplete="current-password" (keydown.enter)="submit()" />
            </div>
            @if (error() && role() === 'CALLER') {
              <p style="font-size:12px;color:#DC2626;margin-top:6px;font-weight:500;">{{ error() }}</p>
            }
          </div>

          <!-- Campos ADMIN: só password -->
          <div class="fields-wrap" [style.max-height]="role() === 'ADMIN' ? '110px' : '0'"
               [style.opacity]="role() === 'ADMIN' ? '1' : '0'"
               [style.margin-bottom]="role() === 'ADMIN' ? '16px' : '0'">
            <div class="fg" style="margin-bottom:0;">
              <label>Palavra-passe</label>
              <input type="password" [(ngModel)]="password" placeholder="············"
                     autocomplete="current-password" (keydown.enter)="submit()" />
            </div>
            @if (error() && role() === 'ADMIN') {
              <p style="font-size:12px;color:#DC2626;margin-top:6px;font-weight:500;">{{ error() }}</p>
            }
          </div>

          <!-- Submit -->
          <button class="btn btn-primary" [disabled]="loading()" (click)="submit()"
                  style="width:100%;justify-content:center;font-size:15px;padding:10px 16px;">
            @if (loading()) {
              <span style="display:inline-flex;align-items:center;gap:8px;">
                <span class="spinner"></span> A entrar…
              </span>
            } @else {
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              {{ role() === 'CALLER' ? 'Entrar como Caller' : 'Entrar como Admin' }}
            }
          </button>
        </div>

        <p style="text-align:center;margin-top:18px;font-size:12px;color:#9CA3AF;">
          Illuminate Visuals · Ferramenta interna
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-bg { min-height:100vh;background:#F5F5F2;display:flex;align-items:center;justify-content:center;padding:20px; }
    .login-wrap { width:100%;max-width:420px; }
    .brand-block { display:flex;flex-direction:column;align-items:center;margin-bottom:36px; }
    .brand-icon { width:56px;height:56px;background:#111110;border-radius:14px;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:14px; }
    .login-card { background:#fff;border-radius:16px;border:1px solid #E2E2DC;padding:28px 28px 24px;box-shadow:0 4px 24px rgba(0,0,0,0.06); }
    .role-grid { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:22px; }
    .role-card { padding:14px;border-radius:10px;border:2px solid #E2E2DC;background:#FAFAF8;cursor:pointer;text-align:left;transition:all 0.12s;font-family:inherit; }
    .role-card.active { border-color:#E8D400;background:#FFFDE7; }
    .role-icon { width:28px;height:28px;border-radius:7px;background:#F0F0EC;display:flex;align-items:center;justify-content:center;margin-bottom:8px;transition:background 0.12s; }
    .role-icon.active { background:#E8D400; }
    .fields-wrap { overflow:hidden;transition:max-height 0.25s ease,opacity 0.2s ease; }
    .spinner { width:14px;height:14px;border:2px solid #1A1A18;border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin 0.6s linear infinite; }
  `]
})
export class LoginComponent implements OnInit {
  role    = signal<'CALLER' | 'ADMIN'>('CALLER');
  loading = signal(false);
  error   = signal('');
  username = '';
  password = '';

  roles = [
    { id: 'CALLER' as const, label: 'Caller', desc: 'Acesso ao pipeline, agenda e registo de calls', icon: '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.45 2 2 0 013.59 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.69a16 16 0 006 6l.86-.86a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>' },
    { id: 'ADMIN'  as const, label: 'Admin',  desc: 'Acesso total + gestão de utilizadores',         icon: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {}
    });
  }

  selectRole(r: 'CALLER' | 'ADMIN'): void {
    this.role.set(r);
    this.error.set('');
    this.username = '';
    this.password = '';
  }

  submit(): void {
    this.error.set('');
    this.loading.set(true);

    const req = this.role() === 'CALLER'
      ? { role: this.role(), username: this.username, password: this.password }
      : { role: this.role(), password: this.password };

    this.auth.login(req).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.error;
        this.error.set(msg ?? (err.status === 401 ? 'Credenciais incorretas.' : 'Erro ao entrar. Tenta novamente.'));
      }
    });
  }
}
