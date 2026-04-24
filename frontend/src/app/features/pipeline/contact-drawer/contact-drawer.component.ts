import { Component, input, output, signal, OnChanges } from '@angular/core';
import { Contacto, Call, ContactoEstado, ESTADO_LABELS, ESTADO_COLORS, SETOR_LABELS, RESULTADO_LABELS, RESULTADO_COLORS, PROXIMO_PASSO_LABELS, AVATAR_COLORS } from '../../../core/models/models';
import { EstadoBadgeComponent } from '../../../shared/components/estado-badge/estado-badge.component';
import { CallService } from '../../../core/services/call.service';

function fd(d: string) { return d ? new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }) : '—'; }
function fdt(d: string) { return d ? fd(d) + ' · ' + new Date(d).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '—'; }
function initials(n: string) { return n ? n.split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase() : '??'; }
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function scoreColor(s: number) { return s >= 8 ? '#059669' : s >= 5 ? '#D97706' : '#DC2626'; }

@Component({
  selector: 'app-contact-drawer',
  standalone: true,
  imports: [EstadoBadgeComponent],
  template: `
    <div class="anim-overlay" (click)="close.emit()"
         style="position:fixed;inset:0;background:rgba(0,0,0,0.18);z-index:40;"></div>
    <div class="anim-slide" style="position:fixed;top:0;right:0;height:100%;width:500px;max-width:90vw;background:#fff;border-left:1px solid #E2E2DC;z-index:50;display:flex;flex-direction:column;overflow:hidden;">

      <!-- Header -->
      <div style="padding:20px 22px 0;border-bottom:1px solid #E2E2DC;flex-shrink:0;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;">
          <div style="display:flex;gap:12px;align-items:center;">
            <div [style.background]="avatarBg()" style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff;flex-shrink:0;">
              {{ initials(contact().nomeDecisor) }}
            </div>
            <div>
              <h2>{{ contact().nomeDecisor }}</h2>
              <p style="font-size:13px;color:#6B6960;">{{ contact().cargo }} · {{ contact().empresa }}</p>
            </div>
          </div>
          <button (click)="close.emit()" style="background:none;border:none;padding:6px;cursor:pointer;color:#9CA3AF;border-radius:6px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
          <app-estado-badge [estado]="contact().estado" />
          <span [style.color]="scoreColor(contact().scorePotencial)" style="font-weight:700;font-size:13px;">
            {{ contact().scorePotencial }}<span style="font-size:10px;font-weight:500;opacity:.7;">/10</span>
          </span>
          <span style="font-size:12px;color:#9CA3AF;">{{ setor() }}</span>
          <div style="margin-left:auto;display:flex;gap:8px;">
            <button class="btn btn-ghost btn-sm" (click)="openAgenda.emit()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Marcar Reunião
            </button>
            <button class="btn btn-primary btn-sm" (click)="newCall.emit()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.45 2 2 0 013.59 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.69a16 16 0 006 6l.86-.86a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              Registar Call
            </button>
          </div>
        </div>
        <div style="display:flex;margin-bottom:-1px;">
          @for (t of tabs; track t.id) {
            <button (click)="tab.set(t.id)"
              [style.font-weight]="tab() === t.id ? '700' : '500'"
              [style.color]="tab() === t.id ? '#1A1A18' : '#6B6960'"
              [style.border-bottom]="tab() === t.id ? '2px solid #E8D400' : '2px solid transparent'"
              style="padding:8px 16px;border:none;background:none;cursor:pointer;font-size:13px;font-family:inherit;transition:all 0.1s;">
              {{ t.label }}{{ t.id === 'calls' ? ' (' + calls().length + ')' : '' }}
            </button>
          }
        </div>
      </div>

      <!-- Content -->
      <div style="flex:1;overflow:auto;padding:18px 22px;">
        @if (tab() === 'info') {
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px;">
            @if (contact().telefone) {
              <div style="margin-bottom:14px;">
                <label>Telefone</label>
                <a [href]="'tel:' + contact().telefone" style="font-size:14px;color:#4F46E5;font-weight:500;text-decoration:none;display:flex;align-items:center;gap:6px;">{{ contact().telefone }}</a>
              </div>
            }
            @if (contact().email) {
              <div style="margin-bottom:14px;">
                <label>Email</label>
                <a [href]="'mailto:' + contact().email" style="font-size:14px;color:#4F46E5;font-weight:500;text-decoration:none;display:flex;align-items:center;gap:6px;">{{ contact().email }}</a>
              </div>
            }
          </div>
          @if (contact().notas) {
            <div style="background:#FAFAF8;border-radius:10px;padding:12px 14px;margin-bottom:16px;border:1px solid #E2E2DC;">
              <label style="margin-bottom:6px;">Notas</label>
              <p style="font-size:13px;line-height:1.6;color:#3A3A38;">{{ contact().notas }}</p>
            </div>
          }
          <div style="margin-bottom:16px;">
            <label style="margin-bottom:8px;">Alterar Estado</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              @for (e of estados; track e.k) {
                <button (click)="changeEstado(e.k)"
                  [style.background]="contact().estado === e.k ? estadoColors[e.k].bg : 'transparent'"
                  [style.color]="contact().estado === e.k ? estadoColors[e.k].t : '#6B6960'"
                  [style.border-color]="contact().estado === e.k ? estadoColors[e.k].d + '60' : '#E2E2DC'"
                  style="padding:3px 10px;border-radius:20px;border:1.5px solid;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.1s;">
                  {{ e.v }}
                </button>
              }
            </div>
          </div>
          <div style="border-top:1px solid #E2E2DC;padding-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;color:#6B6960;">
            <div>Criado em: <strong style="color:#1A1A18;">{{ fd(contact().criadoEm) }}</strong></div>
            <div>Atualizado: <strong style="color:#1A1A18;">{{ fd(contact().atualizadoEm) }}</strong></div>
          </div>
        }
        @if (tab() === 'calls') {
          @if (calls().length === 0) {
            <div style="text-align:center;padding:40px 0;color:#9CA3AF;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D0D0CA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.45 2 2 0 013.59 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.69a16 16 0 006 6l.86-.86a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              <p style="margin-top:10px;font-size:14px;">Ainda não há calls registadas</p>
              <button class="btn btn-primary" style="margin-top:16px;" (click)="newCall.emit()">Registar primeira call</button>
            </div>
          } @else {
            @for (c of calls(); track c.id) {
              <div style="border:1px solid #E2E2DC;border-radius:10px;padding:12px 14px;background:#FAFAF8;margin-bottom:10px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                  <span style="font-size:12px;color:#6B6960;">{{ fdt(c.dataCall) }} · <strong style="color:#1A1A18;">{{ c.callerUser?.nome }}</strong></span>
                  <span [style.background]="resultadoColor(c.resultado).bg" [style.color]="resultadoColor(c.resultado).t"
                        style="padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;">{{ resultadoLabel(c.resultado) }}</span>
                </div>
                @if (c.notas) { <p style="font-size:13px;color:#3A3A38;line-height:1.55;margin-bottom:8px;">{{ c.notas }}</p> }
                <div style="display:flex;gap:14px;font-size:12px;color:#6B6960;flex-wrap:wrap;">
                  <span>{{ proximoPasso(c.proximoPasso) }}</span>
                  @if (c.dataFollowUp) { <span>Follow-up: {{ fd(c.dataFollowUp) }}</span> }
                </div>
              </div>
            }
          }
        }
      </div>
    </div>
  `
})
export class ContactDrawerComponent implements OnChanges {
  readonly contact    = input.required<Contacto>();
  readonly close      = output<void>();
  readonly newCall    = output<void>();
  readonly openAgenda = output<void>();
  readonly estadoChanged = output<ContactoEstado>();

  tab    = signal<'info' | 'calls'>('info');
  calls  = signal<Call[]>([]);

  readonly tabs  = [{ id: 'info' as const, label: 'Informação' }, { id: 'calls' as const, label: 'Calls' }];
  readonly estados = Object.entries(ESTADO_LABELS).map(([k, v]) => ({ k: k as ContactoEstado, v }));
  readonly estadoColors = ESTADO_COLORS;

  constructor(private callService: CallService) {}

  ngOnChanges(): void { this.loadCalls(); }

  loadCalls(): void {
    this.callService.buscarPorContacto(this.contact().id).subscribe({
      next: c => this.calls.set(c),
      error: () => {}
    });
  }

  changeEstado(e: ContactoEstado): void { this.estadoChanged.emit(e); }
  avatarBg()  { return avatarColor(this.contact().id); }
  setor()     { return SETOR_LABELS[this.contact().setor] ?? this.contact().setor; }
  scoreColor  = scoreColor;
  initials    = initials;
  fd          = fd;
  fdt         = fdt;
  resultadoColor(r: string) { return (RESULTADO_COLORS as any)[r] ?? { bg: '#F3F4F6', t: '#6B7280' }; }
  resultadoLabel(r: string) { return (RESULTADO_LABELS as any)[r] ?? r; }
  proximoPasso(p: string)   { return (PROXIMO_PASSO_LABELS as any)[p] ?? p; }
}
