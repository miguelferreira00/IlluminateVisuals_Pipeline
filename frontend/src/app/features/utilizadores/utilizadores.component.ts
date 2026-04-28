import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserResumo } from '../../core/models/models';
import { UserService, CreateCallerRequest } from '../../core/services/user.service';

@Component({
  selector: 'app-utilizadores',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;">

      <!-- Header -->
      <div style="padding:22px 28px 16px;background:#fff;border-bottom:1px solid #E2E2DC;flex-shrink:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h1>Utilizadores</h1>
            <p style="font-size:13px;color:#6B6960;margin-top:2px;">Gerir contas e passwords</p>
          </div>
          <button class="btn btn-primary" (click)="showNovoModal.set(true)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Caller
          </button>
        </div>
      </div>

      <!-- Tabela -->
      <div style="flex:1;overflow:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              @for (h of ['Nome','Role','Username','Estado','Ações']; track h) {
                <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:#6B6960;text-transform:uppercase;letter-spacing:0.06em;position:sticky;top:0;background:#F5F5F2;border-bottom:1px solid #E2E2DC;">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr style="border-bottom:1px solid #F0F0EC;">
                <td style="padding:12px 14px;">
                  <div style="font-weight:600;font-size:14px;">{{ u.nome }}</div>
                  <div style="font-size:12px;color:#6B6960;">{{ u.email }}</div>
                </td>
                <td style="padding:12px 14px;">
                  <span [style.background]="u.role === 'ADMIN' ? '#EFF6FF' : '#F0FDF4'"
                        [style.color]="u.role === 'ADMIN' ? '#1D4ED8' : '#15803D'"
                        style="padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700;">
                    {{ u.role }}
                  </span>
                </td>
                <td style="padding:12px 14px;font-size:13px;color:#6B6960;">{{ u.username ?? '—' }}</td>
                <td style="padding:12px 14px;">
                  <span [style.background]="u.ativo ? '#F0FDF4' : '#FEF2F2'"
                        [style.color]="u.ativo ? '#15803D' : '#DC2626'"
                        style="padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700;">
                    {{ u.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td style="padding:12px 14px;">
                  <div style="display:flex;gap:8px;align-items:center;">
                    <!-- Alterar password -->
                    @if (editandoPasswordId() === u.id) {
                      <div style="display:flex;gap:6px;align-items:center;">
                        <input type="password" [(ngModel)]="novaPassword" placeholder="Nova password"
                               style="width:150px;padding:5px 10px;font-size:13px;border:1.5px solid #E2E2DC;border-radius:6px;font-family:inherit;" />
                        <button class="btn btn-primary btn-sm" (click)="guardarPassword(u.id)" [disabled]="!novaPassword">Guardar</button>
                        <button class="btn btn-ghost btn-sm" (click)="editandoPasswordId.set(null);novaPassword=''">Cancelar</button>
                      </div>
                    } @else {
                      <button class="btn btn-ghost btn-sm" (click)="editandoPasswordId.set(u.id);novaPassword=''">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Password
                      </button>
                      @if (u.role === 'CALLER' && u.ativo) {
                        <button (click)="desativar(u)"
                          style="background:none;border:1.5px solid #FCA5A5;color:#DC2626;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">
                          Desativar
                        </button>
                      }
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (users().length === 0 && !loading()) {
          <div style="padding:60px;text-align:center;color:#9CA3AF;font-size:14px;">Nenhum utilizador encontrado</div>
        }
      </div>
    </div>

    <!-- Modal novo caller -->
    @if (showNovoModal()) {
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:50;display:flex;align-items:center;justify-content:center;" (click)="fecharModal()">
        <div style="background:#fff;border-radius:14px;padding:28px;width:400px;max-width:90vw;" (click)="$event.stopPropagation()">
          <h2 style="margin-bottom:20px;">Novo Caller</h2>
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div>
              <label>Nome *</label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Nome completo" />
            </div>
            <div>
              <label>Username *</label>
              <input type="text" [(ngModel)]="form.username" placeholder="username (para login)" />
            </div>
            <div>
              <label>Password *</label>
              <input type="password" [(ngModel)]="form.password" placeholder="Password inicial" />
            </div>
            <div>
              <label>Email (opcional)</label>
              <input type="email" [(ngModel)]="form.email" placeholder="email@exemplo.com" />
            </div>
            @if (erroModal()) {
              <p style="color:#DC2626;font-size:13px;">{{ erroModal() }}</p>
            }
          </div>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:22px;">
            <button class="btn btn-ghost" (click)="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="criarCaller()" [disabled]="!form.nome || !form.username || !form.password">Criar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class UtilizadoresComponent implements OnInit {
  users          = signal<UserResumo[]>([]);
  loading        = signal(false);
  showNovoModal  = signal(false);
  editandoPasswordId = signal<number | null>(null);
  erroModal      = signal('');
  novaPassword   = '';

  form: CreateCallerRequest & { email: string } = { nome: '', username: '', password: '', email: '' };

  constructor(private userService: UserService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.userService.listar().subscribe({
      next: u => { this.users.set(u); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  criarCaller(): void {
    this.erroModal.set('');
    const req: CreateCallerRequest = {
      nome: this.form.nome,
      username: this.form.username,
      password: this.form.password,
      ...(this.form.email ? { email: this.form.email } : {})
    };
    this.userService.criarCaller(req).subscribe({
      next: u => { this.users.update(list => [...list, u]); this.fecharModal(); },
      error: (err) => {
        const msg = err?.error?.error;
        this.erroModal.set(msg ?? 'Erro ao criar utilizador.');
      }
    });
  }

  guardarPassword(id: number): void {
    this.userService.alterarPassword(id, this.novaPassword).subscribe(() => {
      this.editandoPasswordId.set(null);
      this.novaPassword = '';
    });
  }

  desativar(u: UserResumo): void {
    if (!confirm(`Desativar ${u.nome}?`)) return;
    this.userService.desativar(u.id).subscribe(() => {
      this.users.update(list => list.map(x => x.id === u.id ? { ...x, ativo: false } : x));
    });
  }

  fecharModal(): void {
    this.showNovoModal.set(false);
    this.erroModal.set('');
    this.form = { nome: '', username: '', password: '', email: '' };
  }
}
