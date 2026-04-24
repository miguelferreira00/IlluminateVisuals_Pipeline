import { Component, OnInit, signal } from '@angular/core';
import { ContactoResumo, Reuniao, ReuniaoRequest, SlotDisponivel } from '../../core/models/models';
import { AgendaService } from '../../core/services/agenda.service';
import { ReuniaoService } from '../../core/services/reuniao.service';
import { ContactoService } from '../../core/services/contacto.service';
import { AuthService } from '../../core/auth/auth.service';
import { BookMeetingModalComponent, BookingSlot } from './book-meeting-modal/book-meeting-modal.component';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [BookMeetingModalComponent],
  styles: [`.slot-btn { padding:7px 10px;border-radius:7px;background:#ECFDF5;border:1px solid #A7F3D0;font-size:12px;color:#047857;font-weight:600;cursor:pointer;text-align:left;width:100%;font-family:inherit;transition:all 0.12s; } .slot-btn:hover { background:#D1FAE5;border-color:#059669; }`],
  template: `
    <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;">
      <div style="padding:22px 28px 16px;background:#fff;border-bottom:1px solid #E2E2DC;flex-shrink:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <div>
            <h1>Agenda</h1>
            <p style="font-size:13px;color:#6B6960;margin-top:2px;">Disponibilidade via Google Calendar · {{ reunioes().length }} reuniões marcadas</p>
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <button (click)="prevWeek()" class="btn btn-ghost btn-sm" [disabled]="weekOffset() === 0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span style="font-size:13px;font-weight:600;min-width:150px;text-align:center;">{{ weekLabel() }}</span>
            <button (click)="nextWeek()" class="btn btn-ghost btn-sm" [disabled]="weekOffset() === 2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
        <div style="display:flex;gap:16px;font-size:12px;color:#6B6960;">
          <span style="display:flex;align-items:center;gap:5px;"><span style="width:10px;height:10px;border-radius:3px;background:#ECFDF5;border:1px solid #6EE7B7;display:inline-block;"></span>Livre — clique para marcar</span>
          <span style="display:flex;align-items:center;gap:5px;"><span style="width:10px;height:10px;border-radius:3px;background:#F3E8FF;border:1px solid #DDD6FE;display:inline-block;"></span>Reunião marcada</span>
        </div>
      </div>

      <div style="flex:1;overflow:auto;padding:20px 28px;">
        @if (loading()) {
          <p style="color:#9CA3AF;font-size:14px;">A carregar slots...</p>
        } @else {
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;min-width:700px;">
            @for (day of currentWeek(); track day) {
              <div>
                <div style="padding:9px 11px;background:#F5F5F2;border-radius:9px 9px 0 0;border-bottom:2px solid #E8D400;margin-bottom:2px;">
                  <div style="font-size:12px;font-weight:700;color:#1A1A18;text-transform:capitalize;">{{ dayLabel(day) }}</div>
                  <div style="font-size:11px;margin-top:2px;color:#059669;">{{ freeCount(day) }} slots livres</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;padding-top:6px;">
                  @for (r of meetingsForDay(day); track r.id) {
                    <div style="padding:7px 10px;border-radius:7px;background:#F3E8FF;border:1px solid #DDD6FE;font-size:12px;color:#7E22CE;font-weight:600;">
                      <div>{{ timeOf(r.dataReuniao) }} · {{ r.responsavel?.nome ?? '—' }}</div>
                      <div style="font-size:11px;font-weight:500;opacity:.8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ r.contacto?.empresa }}</div>
                    </div>
                  }
                  @for (slot of freeSlots(day); track slot.inicio) {
                    <button (click)="book({ data: day, hora: timeOf(slot.inicio) })" class="slot-btn">
                      {{ timeOf(slot.inicio) }} <span style="opacity:.6;font-size:11px;">livre</span>
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    @if (bookingSlot()) {
      <app-book-meeting-modal
        [slot]="bookingSlot()!"
        [contacts]="contacts()"
        [socios]="socios()"
        (close)="bookingSlot.set(null)"
        (confirm)="onConfirm($event)" />
    }
  `
})
export class AgendaComponent implements OnInit {
  slots     = signal<SlotDisponivel[]>([]);
  reunioes  = signal<Reuniao[]>([]);
  contacts  = signal<ContactoResumo[]>([]);
  socios    = signal<{ id: number; nome: string }[]>([]);
  weekOffset = signal(0);
  loading   = signal(false);
  bookingSlot = signal<BookingSlot | null>(null);

  constructor(
    private agendaService: AgendaService,
    private reuniaoService: ReuniaoService,
    private contactoService: ContactoService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.agendaService.slots(14, 30).subscribe({ next: s => { this.slots.set(s); this.loading.set(false); }, error: () => this.loading.set(false) });
    this.reuniaoService.listar().subscribe({ next: r => this.reunioes.set(r), error: () => {} });
    this.contactoService.listar(undefined, undefined, undefined, 0, 200).subscribe({ next: p => this.contacts.set(p.content), error: () => {} });
    const user = this.auth.user();
    if (user) this.socios.set([{ id: user.id, nome: user.nome }]);
  }

  currentWeek() {
    const days: string[] = [];
    const now = new Date();
    now.setDate(now.getDate() + this.weekOffset() * 5);
    for (let i = 0; days.length < 5; i++) {
      const d = new Date(now); d.setDate(now.getDate() - now.getDay() + 1 + i);
      const dow = d.getDay();
      if (dow >= 1 && dow <= 5) days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }

  weekLabel() {
    const w = this.currentWeek();
    const fmt = (d: string) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
    return `${fmt(w[0])} — ${fmt(w[4])}`;
  }

  dayLabel(d: string) { return new Date(d).toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' }); }
  timeOf(dt: string)  { return dt.includes('T') ? dt.slice(11, 16) : dt.slice(0, 5); }

  freeSlots(day: string)  { return this.slots().filter(s => s.inicio.startsWith(day) && s.livre); }
  freeCount(day: string)  { return this.freeSlots(day).length; }
  meetingsForDay(day: string) { return this.reunioes().filter(r => r.dataReuniao.startsWith(day)); }

  prevWeek() { this.weekOffset.update(o => Math.max(0, o - 1)); }
  nextWeek() { this.weekOffset.update(o => Math.min(2, o + 1)); }

  book(slot: BookingSlot) { this.bookingSlot.set(slot); }

  onConfirm(req: ReuniaoRequest): void {
    this.reuniaoService.criar(req).subscribe({
      next: r => { this.reunioes.update(list => [r, ...list]); this.bookingSlot.set(null); },
      error: () => {}
    });
  }
}
