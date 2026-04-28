import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactoResumo, Contacto, CallRequest, ContactoRequest, ContactoEstado, Setor, ESTADO_LABELS, ESTADO_COLORS, SETOR_LABELS, AVATAR_COLORS, RESULTADO_TO_ESTADO } from '../../core/models/models';
import { ContactoService } from '../../core/services/contacto.service';
import { CallService } from '../../core/services/call.service';
import { EstadoBadgeComponent } from '../../shared/components/estado-badge/estado-badge.component';
import { ContactDrawerComponent } from './contact-drawer/contact-drawer.component';
import { NewCallModalComponent } from './new-call-modal/new-call-modal.component';
import { NewContactModalComponent } from './new-contact-modal/new-contact-modal.component';

function fd(d: string) { return d ? new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }) : '—'; }
function initials(n: string) { return n ? n.split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase() : '??'; }
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function scoreColor(s: number) { return s >= 8 ? '#059669' : s >= 5 ? '#D97706' : '#DC2626'; }

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [FormsModule, EstadoBadgeComponent, ContactDrawerComponent, NewCallModalComponent, NewContactModalComponent],
  styles: [`:host { display:contents; } .pipeline-row { border-bottom:1px solid #F0F0EC;cursor:pointer; } .pipeline-row:hover { background:#FAFAF8; }`],
  template: `
    <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;">

      <!-- Header -->
      <div style="padding:22px 28px 16px;background:#fff;border-bottom:1px solid #E2E2DC;flex-shrink:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div>
            <h1>Pipeline</h1>
            <p style="font-size:13px;color:#6B6960;margin-top:2px;">{{ contacts().length }} contactos · {{ reunioesCount() }} reuniões agendadas</p>
          </div>
          <button class="btn btn-primary" (click)="showNewContact.set(true)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Contacto
          </button>
        </div>

        <!-- Estado filters -->
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
          <button (click)="filterEstado.set('')"
            [style.background]="!filterEstado() ? '#1A1A18' : 'transparent'"
            [style.color]="!filterEstado() ? '#fff' : '#6B6960'"
            [style.border-color]="!filterEstado() ? '#1A1A18' : '#E2E2DC'"
            style="padding:4px 12px;border-radius:20px;border:1.5px solid;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.1s;">
            Todos ({{ contacts().length }})
          </button>
          @for (e of estados; track e.k) {
            <button (click)="filterEstado.set(filterEstado() === e.k ? '' : e.k)"
              [style.background]="filterEstado() === e.k ? estadoColors[e.k].bg : 'transparent'"
              [style.color]="filterEstado() === e.k ? estadoColors[e.k].t : '#6B6960'"
              [style.border-color]="filterEstado() === e.k ? estadoColors[e.k].d + '80' : '#E2E2DC'"
              style="padding:4px 12px;border-radius:20px;border:1.5px solid;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.1s;">
              {{ e.v }} ({{ countByEstado(e.k) }})
            </button>
          }
        </div>

        <!-- Search + setor -->
        <div style="display:flex;gap:10px;">
          <div style="position:relative;flex:1;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 style="position:absolute;left:11px;top:50%;transform:translateY(-50%);">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" [(ngModel)]="search" placeholder="Pesquisar empresa, nome, cargo..."
                   style="padding-left:34px;" (ngModelChange)="onSearch($event)" />
          </div>
          <select [(ngModel)]="filterSetorValue" (ngModelChange)="filterSetor.set($event)" style="width:auto;min-width:160px;">
            <option value="">Todos os setores</option>
            @for (s of setores; track s.k) { <option [value]="s.k">{{ s.v }}</option> }
          </select>
        </div>
      </div>

      <!-- Table -->
      <div style="flex:1;overflow:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              @for (h of ['Empresa / Decisor','Setor','Estado','Score','Follow-up','']; track h) {
                <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:#6B6960;text-transform:uppercase;letter-spacing:0.06em;position:sticky;top:0;background:#F5F5F2;border-bottom:1px solid #E2E2DC;white-space:nowrap;">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (c of filtered(); track c.id) {
              <tr (click)="openDrawer(c)" class="pipeline-row">
                <td style="padding:11px 14px;">
                  <div style="display:flex;align-items:center;gap:11px;">
                    <div [style.background]="avatarColor(c.id)"
                         style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0;">
                      {{ initials(c.nomeDecisor) }}
                    </div>
                    <div>
                      <div style="font-weight:600;font-size:14px;">{{ c.empresa }}</div>
                      <div style="font-size:12px;color:#6B6960;margin-top:1px;">{{ c.nomeDecisor }} · {{ c.cargo }}</div>
                    </div>
                  </div>
                </td>
                <td style="padding:11px 14px;">
                  <span style="font-size:12px;color:#6B6960;background:#F5F5F2;padding:3px 8px;border-radius:6px;">{{ setor(c.setor) }}</span>
                </td>
                <td style="padding:11px 14px;"><app-estado-badge [estado]="c.estado" /></td>
                <td style="padding:11px 14px;">
                  <span [style.color]="scoreColor(c.scorePotencial)" style="font-weight:700;font-size:13px;">
                    {{ c.scorePotencial }}<span style="font-size:10px;font-weight:500;opacity:.7;">/10</span>
                  </span>
                </td>
                <td style="padding:11px 14px;font-size:12px;color:#6B6960;">{{ fd(c.atualizadoEm) }}</td>
                <td style="padding:11px 14px;text-align:right;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D0D0CA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (filtered().length === 0 && !loading()) {
          <div style="padding:60px;text-align:center;color:#9CA3AF;">
            <p style="font-size:14px;">Nenhum contacto encontrado</p>
          </div>
        }
      </div>
    </div>

    <!-- Drawer -->
    @if (selectedContact()) {
      <app-contact-drawer
        [contact]="selectedContact()!"
        (close)="selectedContact.set(null)"
        (newCall)="showNewCall.set(true)"
        (openAgenda)="goAgenda()"
        (estadoChanged)="onEstadoChanged($event)"
        (deleted)="onContactDeleted($event)" />
    }

    <!-- New Call Modal -->
    @if (showNewCall() && selectedContact()) {
      <app-new-call-modal
        [contact]="selectedContact()!"
        (close)="showNewCall.set(false)"
        (saved)="onCallSaved($event)" />
    }

    <!-- New Contact Modal -->
    @if (showNewContact()) {
      <app-new-contact-modal
        (close)="showNewContact.set(false)"
        (saved)="onContactSaved($event)" />
    }
  `
})
export class PipelineComponent implements OnInit {
  contacts       = signal<ContactoResumo[]>([]);
  loading        = signal(false);
  selectedContact = signal<Contacto | null>(null);
  showNewCall    = signal(false);
  showNewContact = signal(false);

  filterEstado   = signal<string>('');
  filterSetor    = signal<string>('');
  filterSetorValue = '';
  search         = '';

  readonly estados = Object.entries(ESTADO_LABELS).map(([k, v]) => ({ k: k as ContactoEstado, v }));
  readonly setores = Object.entries(SETOR_LABELS).map(([k, v]) => ({ k: k as Setor, v }));
  readonly estadoColors = ESTADO_COLORS;

  readonly reunioesCount = computed(() => this.contacts().filter(c => c.estado === 'REUNIAO_AGENDADA').length);

  readonly filtered = computed(() => {
    const q = this.search.toLowerCase();
    return this.contacts().filter(c =>
      (!q || c.empresa.toLowerCase().includes(q) || c.nomeDecisor.toLowerCase().includes(q) || c.cargo.toLowerCase().includes(q)) &&
      (!this.filterEstado() || c.estado === this.filterEstado()) &&
      (!this.filterSetor() || c.setor === this.filterSetor())
    );
  });

  constructor(
    private contactoService: ContactoService,
    private callService: CallService,
    private router: Router
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.contactoService.listar(undefined, undefined, undefined, 0, 200).subscribe({
      next: p => { this.contacts.set(p.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openDrawer(resumo: ContactoResumo): void {
    this.contactoService.buscarPorId(resumo.id).subscribe(c => this.selectedContact.set(c));
  }

  onEstadoChanged(estado: ContactoEstado): void {
    const c = this.selectedContact();
    if (!c) return;
    this.contactoService.atualizarEstado(c.id, estado, c).subscribe(updated => {
      this.selectedContact.set(updated);
      this.contacts.update(list => list.map(x => x.id === updated.id ? { ...x, estado: updated.estado } : x));
    });
  }

  onCallSaved(req: CallRequest): void {
    this.callService.registar(req).subscribe(() => {
      const novoEstado = RESULTADO_TO_ESTADO[req.resultado];
      if (novoEstado) {
        this.contacts.update(list => list.map(x => x.id === req.contactoId ? { ...x, estado: novoEstado } : x));
        const sel = this.selectedContact();
        if (sel?.id === req.contactoId) this.selectedContact.set({ ...sel, estado: novoEstado });
      }
      this.showNewCall.set(false);
    });
  }

  onContactSaved(req: ContactoRequest): void {
    this.contactoService.criar(req).subscribe(() => { this.showNewContact.set(false); this.load(); });
  }

  onContactDeleted(id: number): void {
    this.contacts.update(list => list.filter(c => c.id !== id));
    this.selectedContact.set(null);
  }

  goAgenda(): void { this.selectedContact.set(null); this.router.navigate(['/agenda']); }
  onSearch(v: string): void { this.search = v; }
  countByEstado(e: ContactoEstado) { return this.contacts().filter(c => c.estado === e).length; }
  setor(s: Setor) { return SETOR_LABELS[s] ?? s; }
  avatarColor = avatarColor;
  initials    = initials;
  scoreColor  = scoreColor;
  fd          = fd;
}
