import { Component, OnInit, signal, computed, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactoResumo, CurrentUser, Reuniao, ReuniaoRequest, SlotDisponivel } from '../../core/models/models';
import { AgendaService } from '../../core/services/agenda.service';
import { ReuniaoService } from '../../core/services/reuniao.service';
import { ContactoService } from '../../core/services/contacto.service';
import { UserService } from '../../core/services/user.service';
import { DisponibilidadeService } from '../../core/services/disponibilidade.service';
import { AuthService } from '../../core/auth/auth.service';
import { BookMeetingModalComponent, BookingSlot } from './book-meeting-modal/book-meeting-modal.component';

const HORAS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
               '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [BookMeetingModalComponent, FormsModule],
  styles: [`
    .slot-btn { padding:6px 10px;border-radius:7px;background:#ECFDF5;border:1px solid #A7F3D0;font-size:12px;color:#047857;font-weight:600;cursor:pointer;text-align:left;width:100%;font-family:inherit;transition:all 0.12s; }
    .slot-btn:hover { background:#D1FAE5; }
    .cell-avail { background:#ECFDF5;border:1px solid #A7F3D0;cursor:pointer;transition:background 0.1s; }
    .cell-avail:hover { background:#BBF7D0; }
    .cell-unavail { background:#FEE2E2;border:1px solid #FCA5A5;cursor:pointer; }
    .cell-unavail:hover { background:#FECACA; }
    .view-btn { padding:5px 14px;border-radius:6px;border:1.5px solid #E2E2DC;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;background:transparent;color:#6B6960;transition:all 0.1s; }
    .view-btn.active { background:#1A1A18;color:#fff;border-color:#1A1A18; }
  `],
  template: `
    <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;">

      <!-- Header -->
      <div style="padding:18px 28px 14px;background:#fff;border-bottom:1px solid #E2E2DC;flex-shrink:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:10px;">
          <div>
            <h1>Agenda</h1>
            <p style="font-size:13px;color:#6B6960;margin-top:2px;">{{ reunioes().length }} reuniões marcadas</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <!-- View toggle -->
            <div style="display:flex;gap:4px;">
              <button class="view-btn" [class.active]="viewMode() === 'week'" (click)="viewMode.set('week')">Semana</button>
              <button class="view-btn" [class.active]="viewMode() === 'month'" (click)="viewMode.set('month')">Mês</button>
            </div>
            <!-- Navigation -->
            <button (click)="prev()" class="btn btn-ghost btn-sm" [disabled]="offset() === 0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span style="font-size:13px;font-weight:600;min-width:160px;text-align:center;">{{ periodLabel() }}</span>
            <button (click)="next()" class="btn btn-ghost btn-sm" [disabled]="offset() >= maxOffset()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <!-- Admin: gerir disponibilidade -->
            @if (auth.isAdmin()) {
              <button class="btn btn-ghost btn-sm" (click)="openDisponibilidade()" style="gap:5px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Disponibilidade
              </button>
            }
          </div>
        </div>
        <div style="display:flex;gap:16px;font-size:12px;color:#6B6960;flex-wrap:wrap;">
          <span style="display:flex;align-items:center;gap:5px;"><span style="width:10px;height:10px;border-radius:3px;background:#ECFDF5;border:1px solid #6EE7B7;display:inline-block;"></span>Livre</span>
          <span style="display:flex;align-items:center;gap:5px;"><span style="width:10px;height:10px;border-radius:3px;background:#F3E8FF;border:1px solid #DDD6FE;display:inline-block;"></span>Reunião marcada</span>
          <span style="display:flex;align-items:center;gap:5px;"><span style="width:10px;height:10px;border-radius:3px;background:#FEE2E2;border:1px solid #FCA5A5;display:inline-block;"></span>Ocupado</span>
        </div>
      </div>

      <!-- Content -->
      <div style="flex:1;overflow:auto;padding:20px 28px;">
        @if (loading()) {
          <p style="color:#9CA3AF;font-size:14px;">A carregar...</p>
        } @else if (viewMode() === 'week') {
          <!-- WEEK VIEW -->
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;min-width:700px;">
            @for (day of currentDays(); track day) {
              <div>
                <div style="padding:9px 11px;background:#F5F5F2;border-radius:9px 9px 0 0;border-bottom:2px solid #E8D400;margin-bottom:4px;">
                  <div style="font-size:12px;font-weight:700;color:#1A1A18;text-transform:capitalize;">{{ dayLabel(day) }}</div>
                  <div style="font-size:11px;margin-top:2px;color:#059669;">{{ freeCount(day) }} livres</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;">
                  @for (slot of allSlotsForDay(day); track slot.inicio) {
                    @let hora = timeOf(slot.inicio);
                    @let meeting = meetingAtSlot(day, hora);
                    @let indisponivel = getSlotIndisponivel(day, hora);
                    @if (meeting) {
                      <div style="padding:7px 10px;border-radius:7px;background:#F3E8FF;border:1px solid #DDD6FE;font-size:12px;color:#7E22CE;">
                        <div style="font-weight:700;">{{ hora }} · {{ meeting.responsavel?.nome ?? '—' }}</div>
                        <div style="font-size:11px;opacity:.8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ meeting.contacto.empresa }}</div>
                        @if (meeting.criadoPor) {
                          <div style="font-size:10px;opacity:.65;margin-top:2px;">por {{ meeting.criadoPor.nome }}</div>
                        }
                      </div>
                    } @else if (indisponivel.length > 0) {
                      <div style="padding:6px 10px;border-radius:7px;background:#FEE2E2;border:1px solid #FCA5A5;font-size:12px;color:#DC2626;">
                        <span style="font-weight:700;">{{ hora }}</span>
                        <span style="font-size:11px;margin-left:5px;">
                          {{ indisponivel.length === 1 ? indisponivel[0].nome + ' ocupado' : indisponivel.length + ' pessoas indisponíveis' }}
                        </span>
                      </div>
                    } @else {
                      <button (click)="book({ data: day, hora })" class="slot-btn">
                        {{ hora }} <span style="opacity:.6;font-size:11px;">livre</span>
                      </button>
                    }
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- MONTH VIEW -->
          <div style="min-width:600px;">
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:6px;">
              @for (d of ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']; track d) {
                <div style="text-align:center;font-size:11px;font-weight:700;color:#6B6960;padding:4px;">{{ d }}</div>
              }
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;">
              @for (cell of monthCells(); track cell.date ?? cell.empty) {
                @if (cell.empty) {
                  <div style="min-height:80px;background:#FAFAF8;border-radius:6px;"></div>
                } @else {
                  <div (click)="goToDay(cell.date!)"
                    style="min-height:80px;background:#fff;border:1px solid #E2E2DC;border-radius:6px;padding:6px;cursor:pointer;transition:background 0.1s;"
                    [style.background]="isToday(cell.date!) ? '#FFFBEB' : '#fff'"
                    [style.border-color]="isToday(cell.date!) ? '#E8D400' : '#E2E2DC'">
                    <div style="font-size:12px;font-weight:700;margin-bottom:4px;" [style.color]="isToday(cell.date!) ? '#92610A' : '#1A1A18'">
                      {{ cell.day }}
                    </div>
                    @for (r of meetingsForDay(cell.date!); track r.id) {
                      <div style="background:#F3E8FF;border-radius:4px;padding:2px 5px;font-size:10px;color:#7E22CE;font-weight:600;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        {{ timeOf(r.dataReuniao) }} {{ r.contacto.empresa }}
                      </div>
                    }
                    @if (freeCount(cell.date!) > 0) {
                      <div style="font-size:10px;color:#059669;margin-top:2px;">{{ freeCount(cell.date!) }} livres</div>
                    }
                  </div>
                }
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Book modal -->
    @if (bookingSlot()) {
      <app-book-meeting-modal
        [slot]="bookingSlot()!"
        [contacts]="contacts()"
        [socios]="socios()"
        [unavailableAdminIds]="unavailableForSlot()"
        (close)="bookingSlot.set(null)"
        (confirm)="onConfirm($event)" />
    }

    <!-- When2Meet modal -->
    @if (showDisponibilidade()) {
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:60;display:flex;align-items:center;justify-content:center;" (click)="showDisponibilidade.set(false)">
        <div style="background:#fff;border-radius:16px;padding:24px;max-width:95vw;max-height:90vh;overflow:auto;width:720px;" (click)="$event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <div>
              <h2 style="font-size:17px;">Minha Disponibilidade</h2>
              <p style="font-size:13px;color:#6B6960;margin-top:2px;">Clica ou arrasta para marcar os horários em que estás <strong>indisponível</strong></p>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <button (click)="prevDispWeek()" class="btn btn-ghost btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span style="font-size:13px;font-weight:600;min-width:140px;text-align:center;">{{ dispWeekLabel() }}</span>
              <button (click)="nextDispWeek()" class="btn btn-ghost btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button (click)="showDisponibilidade.set(false)" style="background:none;border:none;cursor:pointer;color:#9CA3AF;padding:4px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          <!-- Legend -->
          <div style="display:flex;gap:16px;font-size:12px;color:#6B6960;margin-bottom:12px;">
            <span style="display:flex;align-items:center;gap:5px;"><span style="width:12px;height:12px;border-radius:3px;background:#ECFDF5;border:1px solid #6EE7B7;display:inline-block;"></span>Disponível</span>
            <span style="display:flex;align-items:center;gap:5px;"><span style="width:12px;height:12px;border-radius:3px;background:#FEE2E2;border:1px solid #FCA5A5;display:inline-block;"></span>Indisponível</span>
          </div>
          <!-- Grid -->
          @if (dispLoading()) {
            <p style="color:#9CA3AF;font-size:13px;">A carregar...</p>
          } @else {
            <div style="overflow-x:auto;">
              <table style="border-collapse:collapse;width:100%;">
                <thead>
                  <tr>
                    <th style="width:60px;"></th>
                    @for (day of dispWeekDays(); track day) {
                      <th style="padding:4px 8px;font-size:12px;font-weight:700;color:#1A1A18;text-align:center;white-space:nowrap;">{{ dayLabel(day) }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (hora of horas; track hora) {
                    <tr>
                      <td style="padding:0 8px 0 0;font-size:11px;color:#6B6960;text-align:right;white-space:nowrap;vertical-align:middle;">{{ hora }}</td>
                      @for (day of dispWeekDays(); track day) {
                        <td style="padding:1px;">
                          <div
                            [class]="isIndisponivel(day, hora) ? 'cell-unavail' : 'cell-avail'"
                            style="height:24px;border-radius:4px;"
                            (mousedown)="onCellMouseDown(day, hora)"
                            (mouseenter)="onCellMouseEnter(day, hora)">
                          </div>
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class AgendaComponent implements OnInit {
  readonly horas = HORAS;

  slots       = signal<SlotDisponivel[]>([]);
  reunioes    = signal<Reuniao[]>([]);
  contacts    = signal<ContactoResumo[]>([]);
  socios      = signal<CurrentUser[]>([]);
  loading     = signal(false);
  bookingSlot = signal<BookingSlot | null>(null);

  viewMode = signal<'week' | 'month'>('week');
  offset   = signal(0); // week offset for week view, month offset for month view

  showDisponibilidade = signal(false);
  dispWeekOffset      = signal(0);
  dispIndisponivel    = signal<Set<string>>(new Set());
  dispLoading         = signal(false);
  allIndisponivel     = signal<Record<string, {id: number, nome: string}[]>>({});

  readonly unavailableForSlot = computed(() => {
    const slot = this.bookingSlot();
    if (!slot) return [];
    const key = `${slot.data}T${slot.hora}`;
    return (this.allIndisponivel()[key] ?? []).map(a => a.id);
  });

  private dragging    = false;
  private dragValue   = false; // true = mark unavailable, false = remove

  constructor(
    private agendaService: AgendaService,
    private reuniaoService: ReuniaoService,
    private contactoService: ContactoService,
    private userService: UserService,
    private dispService: DisponibilidadeService,
    readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSlots();
    this.loadTodos();
    this.reuniaoService.listar().subscribe({ next: r => this.reunioes.set(r), error: () => {} });
    this.contactoService.listar(undefined, undefined, undefined, 0, 200).subscribe({ next: p => this.contacts.set(p.content), error: () => {} });
    this.userService.admins().subscribe({ next: a => this.socios.set(a), error: () => {} });
  }

  loadSlots(): void {
    this.loading.set(true);
    this.agendaService.slots(180, 30).subscribe({
      next: s => { this.slots.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadTodos(): void {
    const days = this.currentDays();
    if (!days.length) return;
    this.dispService.todos(days[0], days[4]).subscribe({
      next: m => this.allIndisponivel.set(m),
      error: () => {}
    });
  }

  // ── Week view ──────────────────────────────────────────────────

  maxOffset() { return this.viewMode() === 'week' ? 25 : 5; }

  prev() { this.offset.update(o => Math.max(0, o - 1)); if (this.viewMode() === 'week') this.loadTodos(); }
  next() { this.offset.update(o => Math.min(this.maxOffset(), o + 1)); if (this.viewMode() === 'week') this.loadTodos(); }

  currentDays(): string[] {
    const days: string[] = [];
    const base = new Date();
    base.setDate(base.getDate() + this.offset() * 7);
    for (let i = 0; days.length < 5; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() - base.getDay() + 1 + i);
      if (d.getDay() >= 1 && d.getDay() <= 5) days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }

  periodLabel(): string {
    if (this.viewMode() === 'week') {
      const w = this.currentDays();
      const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
      return `${fmt(w[0])} — ${fmt(w[4])}`;
    }
    const d = new Date();
    d.setMonth(d.getMonth() + this.offset());
    return d.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
  }

  // ── Month view ─────────────────────────────────────────────────

  monthCells(): { date?: string; day?: number; empty?: boolean }[] {
    const today = new Date();
    today.setMonth(today.getMonth() + this.offset());
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const cells: { date?: string; day?: number; empty?: boolean }[] = [];
    // Mon=0..Sun=6 offset
    const startDow = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < startDow; i++) cells.push({ empty: true });
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ date, day: d });
    }
    const rem = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < rem; i++) cells.push({ empty: true });
    return cells;
  }

  isToday(date: string): boolean { return date === new Date().toISOString().slice(0, 10); }

  goToDay(date: string): void {
    this.viewMode.set('week');
    const today = new Date();
    const target = new Date(date + 'T12:00:00');
    const diffDays = Math.floor((target.getTime() - today.getTime()) / 86400000);
    this.offset.set(Math.max(0, Math.floor(diffDays / 7)));
  }

  // ── Helpers ────────────────────────────────────────────────────

  dayLabel(d: string) { return new Date(d + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' }); }
  timeOf(dt: string)  { return dt.includes('T') ? dt.slice(11, 16) : dt.slice(0, 5); }
  allSlotsForDay(day: string)  { return this.slots().filter(s => s.inicio.startsWith(day)); }
  freeSlots(day: string)       { return this.slots().filter(s => s.inicio.startsWith(day) && s.livre); }
  freeCount(day: string)       { return this.freeSlots(day).length; }
  meetingsForDay(day: string)  { return this.reunioes().filter(r => r.dataReuniao.startsWith(day)); }
  meetingAtSlot(day: string, hora: string) {
    return this.reunioes().find(r => r.dataReuniao.startsWith(day) && r.dataReuniao.slice(11, 16) === hora);
  }
  getSlotIndisponivel(day: string, hora: string): {id: number, nome: string}[] {
    return this.allIndisponivel()[`${day}T${hora}`] ?? [];
  }

  book(slot: BookingSlot) { this.bookingSlot.set(slot); }

  onConfirm(req: ReuniaoRequest): void {
    this.reuniaoService.criar(req).subscribe({
      next: r => { this.reunioes.update(list => [r, ...list]); this.bookingSlot.set(null); },
      error: () => {}
    });
  }

  // ── When2Meet (disponibilidade) ────────────────────────────────

  dispWeekDays(): string[] {
    const days: string[] = [];
    const base = new Date();
    base.setDate(base.getDate() + this.dispWeekOffset() * 7);
    for (let i = 0; days.length < 5; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() - base.getDay() + 1 + i);
      if (d.getDay() >= 1 && d.getDay() <= 5) days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }

  dispWeekLabel(): string {
    const w = this.dispWeekDays();
    const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
    return `${fmt(w[0])} — ${fmt(w[4])}`;
  }

  prevDispWeek(): void { this.dispWeekOffset.update(o => o - 1); this.loadDisponibilidade(); }
  nextDispWeek(): void { this.dispWeekOffset.update(o => o + 1); this.loadDisponibilidade(); }

  loadDisponibilidade(): void {
    const user = this.auth.user();
    if (!user) return;
    const days = this.dispWeekDays();
    this.dispLoading.set(true);
    this.dispService.get(user.id, days[0], days[4]).subscribe({
      next: list => { this.dispIndisponivel.set(new Set(list.map(d => d.slice(0, 16)))); this.dispLoading.set(false); },
      error: () => this.dispLoading.set(false)
    });
  }

  isIndisponivel(day: string, hora: string): boolean {
    return this.dispIndisponivel().has(`${day}T${hora}`);
  }

  onCellMouseDown(day: string, hora: string): void {
    this.dragging = true;
    const key = `${day}T${hora}`;
    this.dragValue = !this.dispIndisponivel().has(key);
    this.toggleCell(day, hora);
  }

  onCellMouseEnter(day: string, hora: string): void {
    if (!this.dragging) return;
    const key = `${day}T${hora}`;
    const isUnavail = this.dispIndisponivel().has(key);
    if (this.dragValue && !isUnavail) this.toggleCell(day, hora);
    if (!this.dragValue && isUnavail) this.toggleCell(day, hora);
  }

  @HostListener('document:mouseup')
  onMouseUp(): void { this.dragging = false; }

  private toggleCell(day: string, hora: string): void {
    const dataHora = `${day}T${hora}:00`;
    const key = `${day}T${hora}`;
    this.dispService.toggle(dataHora).subscribe();
    this.dispIndisponivel.update(s => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  openDisponibilidade(): void {
    this.showDisponibilidade.set(true);
    this.loadDisponibilidade();
  }
}
