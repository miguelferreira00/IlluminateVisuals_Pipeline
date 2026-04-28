import { Component, input, output, computed } from '@angular/core';
import { CurrentUser, ContactoResumo } from '../../../core/models/models';
import { buildApiUrl } from '../../../core/config/api.config';

export type NavView = 'pipeline' | 'agenda' | 'dashboard' | 'utilizadores';

const NAV_ITEMS: { id: NavView; label: string; icon: string; adminOnly?: boolean }[] = [
  { id: 'pipeline',  label: 'Pipeline',  icon: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>' },
  { id: 'agenda',    label: 'Agenda',    icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
  { id: 'dashboard', label: 'Dashboard', icon: '<rect x="2" y="3" width="9" height="9" rx="1"/><rect x="13" y="3" width="9" height="9" rx="1"/><rect x="2" y="14" width="9" height="7" rx="1"/><rect x="13" y="14" width="9" height="7" rx="1"/>' },
  { id: 'utilizadores', label: 'Utilizadores', adminOnly: true, icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  template: `
    <div class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <img src="assets/logo.svg" alt="IV" style="width:26px;height:26px;object-fit:contain;" />
        </div>
        <div>
          <div style="font-size:13px;font-weight:700;color:#1A1A18;line-height:1.2;">Illuminate</div>
          <div style="font-size:10px;color:#9CA3AF;font-weight:600;letter-spacing:0.08em;">PIPELINE</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        @for (item of visibleItems(); track item.id) {
          <button (click)="setView.emit(item.id)" [class.active]="view() === item.id" class="nav-item">
            <svg [innerHTML]="item.icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                 [attr.stroke]="view() === item.id ? '#C8B800' : 'currentColor'"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
            {{ item.label }}
            @if (item.id === 'pipeline' && followUpCount() > 0) {
              <span class="follow-up-badge">{{ followUpCount() }}</span>
            }
          </button>
        }
      </nav>

      <div style="padding:10px 8px;border-top:1px solid #E2E2DC;">
        <button class="btn btn-ghost" style="width:100%;justify-content:center;font-size:13px;" (click)="exportExcel()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exportar Excel
        </button>
      </div>

      <div class="sidebar-user">
        <div class="user-avatar">{{ initial() }}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ user()?.nome }}</div>
          <div style="font-size:11px;color:#6B6960;">{{ user()?.role === 'ADMIN' ? 'Admin' : 'Caller' }}</div>
        </div>
        <button (click)="logout.emit()" class="logout-btn" title="Sair">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar { width:220px;min-width:220px;background:#fff;border-right:1px solid #E2E2DC;display:flex;flex-direction:column;height:100vh;flex-shrink:0; }
    .sidebar-brand { padding:18px 16px 14px;border-bottom:1px solid #E2E2DC;display:flex;align-items:center;gap:10px; }
    .brand-icon { width:36px;height:36px;background:#111110;border-radius:9px;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0; }
    .sidebar-nav { flex:1;padding:10px 8px;display:flex;flex-direction:column;gap:2px; }
    .nav-item { display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;border:none;cursor:pointer;width:100%;text-align:left;background:transparent;color:#6B6960;font-weight:500;font-size:14px;font-family:inherit;transition:all 0.1s; }
    .nav-item.active { background:#F5F5F2;color:#1A1A18;font-weight:600; }
    .follow-up-badge { margin-left:auto;background:#FFF9E0;color:#92610A;border-radius:20px;padding:1px 7px;font-size:11px;font-weight:700; }
    .sidebar-user { padding:12px 14px;border-top:1px solid #E2E2DC;display:flex;align-items:center;gap:10px; }
    .user-avatar { width:30px;height:30px;border-radius:50%;background:#E8D400;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#1A1A18;flex-shrink:0; }
    .logout-btn { background:none;border:none;cursor:pointer;color:#9CA3AF;padding:4px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;transition:color 0.1s; }
    .logout-btn:hover { color:#DC2626; }
  `]
})
export class SidebarComponent {
  readonly view     = input.required<NavView>();
  readonly user     = input.required<CurrentUser | null>();
  readonly contacts = input<ContactoResumo[]>([]);
  readonly setView  = output<NavView>();
  readonly logout   = output<void>();

  readonly isAdmin       = computed(() => this.user()?.role === 'ADMIN');
  readonly visibleItems  = computed(() => NAV_ITEMS.filter(i => !i.adminOnly || this.isAdmin()));
  readonly followUpCount = computed(() => this.contacts().filter(c => c.estado === 'FOLLOW_UP').length);
  readonly initial       = computed(() => this.user()?.nome?.[0]?.toUpperCase() ?? '?');

  exportExcel(): void { window.open(buildApiUrl('/api/export/excel'), '_blank'); }
}
