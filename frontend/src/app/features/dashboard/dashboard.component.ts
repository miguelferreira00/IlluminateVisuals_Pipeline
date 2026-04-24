import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DashboardKpis, CallsPorDia, ESTADO_COLORS } from '../../core/models/models';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div style="height:100%;overflow:auto;padding:22px 28px;">
      <div style="margin-bottom:22px;">
        <h1>Dashboard</h1>
        <p style="font-size:13px;color:#6B6960;margin-top:2px;">Métricas em tempo real</p>
      </div>

      @if (kpis()) {
        <!-- KPI Cards -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px;">
          <div class="card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
              <div style="font-size:30px;font-weight:700;letter-spacing:-0.03em;line-height:1;">{{ kpis()!.totalContactos }}</div>
              <div class="icon-box"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            </div>
            <div style="font-size:14px;font-weight:600;">Total de Contactos</div>
          </div>
          <div class="card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
              <div style="font-size:30px;font-weight:700;letter-spacing:-0.03em;line-height:1;color:#7E22CE;">{{ kpis()!.reunioesSemanaAtual }}</div>
              <div class="icon-box"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            </div>
            <div style="font-size:14px;font-weight:600;">Reuniões Esta Semana</div>
            <div style="font-size:12px;color:#9CA3AF;margin-top:3px;">{{ kpis()!.reunioesTotal }} total</div>
          </div>
          <div class="card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
              <div style="font-size:30px;font-weight:700;letter-spacing:-0.03em;line-height:1;" [style.color]="kpis()!.followUpsPendentesVencidos > 2 ? '#C2410C' : '#D97706'">{{ kpis()!.followUpsPendentesVencidos }}</div>
              <div class="icon-box"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            </div>
            <div style="font-size:14px;font-weight:600;">Follow-ups Pendentes</div>
          </div>
          <div class="card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
              <div style="font-size:30px;font-weight:700;letter-spacing:-0.03em;line-height:1;color:#059669;">{{ kpis()!.taxaConversao | number:'1.0-1' }}%</div>
              <div class="icon-box"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
            </div>
            <div style="font-size:14px;font-weight:600;">Taxa de Conversão</div>
          </div>
        </div>

        <!-- Charts row -->
        <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:16px;margin-bottom:20px;">
          <!-- Bar chart: contactos por estado -->
          <div class="card">
            <h3 style="margin-bottom:16px;">Contactos por Estado</h3>
            @for (row of barData(); track row.label) {
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:9px;">
                <div style="font-size:12px;color:#6B6960;width:120px;flex-shrink:0;">{{ row.label }}</div>
                <div style="flex:1;height:18px;background:#F5F5F2;border-radius:4px;overflow:hidden;">
                  <div [style.width]="row.pct + '%'" [style.background]="row.color" style="height:100%;border-radius:4px;transition:width 0.6s ease;min-width:4px;"></div>
                </div>
                <div style="font-size:13px;font-weight:700;width:20px;text-align:right;">{{ row.value }}</div>
              </div>
            }
          </div>

          <!-- Line chart: calls por dia -->
          <div class="card">
            <h3 style="margin-bottom:4px;">Calls por Dia <span style="font-weight:400;color:#9CA3AF;font-size:12px;">(últimos 30 dias)</span></h3>
            <div style="font-size:28px;font-weight:700;letter-spacing:-0.03em;margin-bottom:14px;">
              {{ totalCalls() }} <span style="font-size:13px;color:#9CA3AF;font-weight:500;">calls no total</span>
            </div>
            @if (callsData().length > 1) {
              <svg width="100%" viewBox="0 0 340 72" style="overflow:visible;display:block;">
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#E8D400" stop-opacity=".25"/>
                    <stop offset="100%" stop-color="#E8D400" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <polygon [attr.points]="areaPoints()" fill="url(#grad)"/>
                <polyline [attr.points]="linePoints()" fill="none" stroke="#C8B800" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
                @for (pt of dotPoints(); track pt.x) {
                  @if (pt.v > 0) { <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3" fill="#C8B800"/> }
                }
              </svg>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#9CA3AF;margin-top:6px;">
                <span>{{ callsData()[0]?.data }}</span>
                <span>{{ callsData()[callsData().length-1]?.data }}</span>
              </div>
            }
          </div>
        </div>
      } @else {
        <p style="color:#9CA3AF;">A carregar dados...</p>
      }
    </div>
  `,
  styles: [`
    .card { background:#fff;border-radius:12px;padding:18px 20px;border:1px solid #E2E2DC; }
    .icon-box { width:36px;height:36px;border-radius:9px;background:#F5F5F2;display:flex;align-items:center;justify-content:center; }
  `]
})
export class DashboardComponent implements OnInit {
  kpis      = signal<DashboardKpis | null>(null);
  callsData = signal<CallsPorDia[]>([]);

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.kpis().subscribe({ next: k => this.kpis.set(k), error: () => {} });
    this.dashboardService.callsPorDia().subscribe({ next: c => this.callsData.set(c), error: () => {} });
  }

  barData() {
    const k = this.kpis();
    if (!k) return [];
    const max = Math.max(...Object.values(k.contactosPorEstado), 1);
    return Object.entries(k.contactosPorEstado)
      .map(([estado, value]) => ({
        label: (ESTADO_COLORS as any)[estado] ? estado.replace('_', ' ') : estado,
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
    return data.map((d, i) => ({ x: (i / (data.length - 1)) * W, y: H - (d.total / max) * H, v: d.total }));
  }

  linePoints() { return this.pts().map(p => `${p.x},${p.y}`).join(' '); }
  areaPoints() {
    const ps = this.pts();
    if (!ps.length) return '';
    const inner = ps.map(p => p.x + ',' + p.y).join(' ');
    return '0,72 ' + inner + ' 340,72';
  }
  dotPoints() { return this.pts(); }
}
