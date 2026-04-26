import { Component, OnInit, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  DashboardKpis, CallsPorDia, ContactoResumo,
  ESTADO_LABELS, ESTADO_COLORS, AVATAR_COLORS
} from '../../core/models/models';
import { DashboardService } from '../../core/services/dashboard.service';
import { ContactoService } from '../../core/services/contacto.service';
import { EstadoBadgeComponent } from '../../shared/components/estado-badge/estado-badge.component';

function initials(n: string) { return n ? n.split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase() : '??'; }
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function fd(d: string) { return d ? new Date(d).toLocaleDateString('pt-PT', { day:'2-digit', month:'short' }) : '—'; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, EstadoBadgeComponent],
  template: `
    <div style="height:100%;overflow:auto;padding:22px 28px;">

      <!-- Header -->
      <div style="margin-bottom:22px;">
        <h1>Dashboard</h1>
        <p style="font-size:13px;color:#6B6960;margin-top:2px;">Métricas em tempo real</p>
      </div>

      @if (kpis()) {
        <!-- KPI Cards -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px;">

          <div class="card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
              <div style="font-size:30px;font-weight:700;letter-spacing:-0.03em;line-height:1;color:#1A1A18;">{{ kpis()!.totalContactos }}</div>
              <div class="icon-box">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
            <div style="font-size:14px;font-weight:600;">Total de Contactos</div>
            <div style="font-size:12px;color:#9CA3AF;margin-top:3px;">{{ clientesAtivos() }} clientes ativos</div>
          </div>

          <div class="card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
              <div style="font-size:30px;font-weight:700;letter-spacing:-0.03em;line-height:1;color:#7E22CE;">{{ kpis()!.reunioesSemanaAtual }}</div>
              <div class="icon-box">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
            </div>
            <div style="font-size:14px;font-weight:600;">Reuniões Esta Semana</div>
            <div style="font-size:12px;color:#9CA3AF;margin-top:3px;">{{ kpis()!.reunioesTotal }} total marcadas</div>
          </div>

          <div class="card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
              <div style="font-size:30px;font-weight:700;letter-spacing:-0.03em;line-height:1;"
                   [style.color]="kpis()!.followUpsPendentesVencidos > 2 ? '#C2410C' : '#D97706'">
                {{ kpis()!.followUpsPendentesVencidos }}
              </div>
              <div class="icon-box">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
            </div>
            <div style="font-size:14px;font-weight:600;">Follow-ups Pendentes</div>
            <div style="font-size:12px;color:#9CA3AF;margin-top:3px;">{{ kpis()!.followUpsSemanaAtual }} esta semana</div>
          </div>

          <div class="card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
              <div style="font-size:30px;font-weight:700;letter-spacing:-0.03em;line-height:1;color:#059669;">{{ kpis()!.taxaConversao | number:'1.0-1' }}%</div>
              <div class="icon-box">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
            </div>
            <div style="font-size:14px;font-weight:600;">Taxa de Conversão</div>
            <div style="font-size:12px;color:#9CA3AF;margin-top:3px;">calls → reuniões</div>
          </div>
        </div>

        <!-- Charts -->
        <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:16px;margin-bottom:20px;">

          <!-- Bar chart: contactos por estado -->
          <div class="card">
            <h3 style="margin-bottom:16px;">Contactos por Estado</h3>
            @for (row of barData(); track row.label) {
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:9px;">
                <div style="font-size:12px;color:#6B6960;width:120px;flex-shrink:0;">{{ row.label }}</div>
                <div style="flex:1;height:18px;background:#F5F5F2;border-radius:4px;overflow:hidden;">
                  <div [style.width]="row.pct + '%'" [style.background]="row.color"
                       style="height:100%;border-radius:4px;transition:width 0.6s ease;"></div>
                </div>
                <div style="font-size:13px;font-weight:700;color:#1A1A18;width:20px;text-align:right;">{{ row.value }}</div>
              </div>
            }
          </div>

          <!-- Line chart: calls por dia -->
          <div class="card">
            <h3 style="margin-bottom:4px;">
              Calls por Dia
              <span style="font-weight:400;color:#9CA3AF;font-size:12px;"> (últimos 30 dias)</span>
            </h3>
            <div style="font-size:28px;font-weight:700;letter-spacing:-0.03em;color:#1A1A18;margin-bottom:14px;">
              {{ totalCalls() }}
              <span style="font-size:13px;color:#9CA3AF;font-weight:500;"> calls no total</span>
            </div>
            @if (callsData().length > 1) {
              <svg width="100%" viewBox="0 0 340 80" style="overflow:visible;display:block;">
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#E8D400" stop-opacity=".25"/>
                    <stop offset="100%" stop-color="#E8D400" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <polygon [attr.points]="areaPoints()" fill="url(#grad)"/>
                <polyline [attr.points]="linePoints()" fill="none" stroke="#C8B800" stroke-width="2"
                          stroke-linejoin="round" stroke-linecap="round"/>
                @for (pt of dotPoints(); track pt.x) {
                  @if (pt.v > 0) { <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3" fill="#C8B800"/> }
                }
              </svg>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#9CA3AF;margin-top:6px;">
                <span>{{ callsData()[0].data }}</span>
                <span>{{ callsData()[callsData().length-1].data }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Follow-ups pendentes list -->
        @if (followUps().length > 0) {
          <div class="card">
            <h3 style="margin-bottom:14px;">Follow-ups Pendentes ({{ followUps().length }})</h3>
            <div style="display:flex;flex-direction:column;gap:8px;">
              @for (c of followUps().slice(0,6); track c.id) {
                <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:#FAFAF8;border-radius:8px;border:1px solid #F0F0EC;">
                  <div [style.background]="avatarColor(c.id)"
                       style="width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0;">
                    {{ initials(c.nomeDecisor) }}
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-weight:600;font-size:13px;">{{ c.nomeDecisor }}</div>
                    <div style="font-size:12px;color:#6B6960;">{{ c.empresa }}</div>
                  </div>
                  @if (c.atualizadoEm) {
                    <span style="font-size:12px;color:#C2410C;font-weight:600;display:flex;align-items:center;gap:4px;flex-shrink:0;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {{ fd(c.atualizadoEm) }}
                    </span>
                  }
                  <app-estado-badge [estado]="c.estado" />
                </div>
              }
            </div>
          </div>
        }

      } @else {
        <!-- Skeleton enquanto carrega -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px;">
          @for (i of [1,2,3,4]; track i) {
            <div class="card" style="min-height:96px;">
              <div style="width:60px;height:30px;background:#F5F5F2;border-radius:6px;margin-bottom:10px;"></div>
              <div style="width:120px;height:14px;background:#F5F5F2;border-radius:4px;"></div>
            </div>
          }
        </div>
        <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:16px;">
          <div class="card" style="min-height:200px;"></div>
          <div class="card" style="min-height:200px;"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .card { background:#fff;border-radius:12px;padding:18px 20px;border:1px solid #E2E2DC; }
    .icon-box { width:36px;height:36px;border-radius:9px;background:#F5F5F2;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
  `]
})
export class DashboardComponent implements OnInit {
  kpis      = signal<DashboardKpis | null>(null);
  callsData = signal<CallsPorDia[]>([]);
  followUps = signal<ContactoResumo[]>([]);

  readonly clientesAtivos = () =>
    this.kpis()?.contactosPorEstado?.['CLIENTE'] ?? 0;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly contactoService: ContactoService,
  ) {}

  ngOnInit(): void {
    this.dashboardService.kpis().subscribe({ next: k => this.kpis.set(k), error: () => {} });
    this.dashboardService.callsPorDia().subscribe({ next: c => this.callsData.set(c), error: () => {} });
    this.contactoService.listar('FOLLOW_UP', undefined, undefined, 0, 10).subscribe({
      next: p => this.followUps.set(p.content),
      error: () => {}
    });
  }

  barData() {
    const k = this.kpis();
    if (!k) return [];
    const max = Math.max(...Object.values(k.contactosPorEstado), 1);
    return Object.entries(k.contactosPorEstado)
      .map(([estado, value]) => ({
        label: (ESTADO_LABELS as any)[estado] ?? estado,
        value,
        color: (ESTADO_COLORS as any)[estado]?.d ?? '#9CA3AF',
        pct: (value / max) * 100
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }

  totalCalls() { return this.callsData().reduce((s, d) => s + d.total, 0); }

  private pts() {
    const W = 340, H = 64;
    const data = this.callsData();
    if (!data.length) return [];
    const max = Math.max(...data.map(d => d.total), 1);
    return data.map((d, i) => ({
      x: (i / Math.max(data.length - 1, 1)) * W,
      y: H - (d.total / max) * H,
      v: d.total
    }));
  }

  linePoints() { return this.pts().map(p => `${p.x},${p.y}`).join(' '); }
  areaPoints() {
    const ps = this.pts();
    if (!ps.length) return '';
    return '0,72 ' + ps.map(p => p.x + ',' + p.y).join(' ') + ' 340,72';
  }
  dotPoints() { return this.pts(); }

  readonly avatarColor = avatarColor;
  readonly initials    = initials;
  readonly fd          = fd;
}
