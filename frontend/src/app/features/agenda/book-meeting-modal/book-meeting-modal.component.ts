import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactoResumo, CurrentUser, ReuniaoRequest } from '../../../core/models/models';

export interface BookingSlot { data: string; hora: string; }

@Component({
  selector: 'app-book-meeting-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="anim-overlay" (click)="close.emit()"
         style="position:fixed;inset:0;background:rgba(0,0,0,0.32);z-index:80;"></div>
    <div class="anim-fade" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:460px;max-width:95vw;background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,0.15);z-index:90;">
      <div style="padding:20px 22px 14px;border-bottom:1px solid #E2E2DC;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h3 style="font-size:17px;font-weight:700;">Marcar Reunião</h3>
          <p style="font-size:13px;color:#6B6960;margin-top:3px;">{{ slot().data }} às {{ slot().hora }}</p>
        </div>
        <button (click)="close.emit()" style="background:none;border:none;cursor:pointer;color:#9CA3AF;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <form (ngSubmit)="submit()" style="padding:18px 22px;">
        <div class="fg">
          <label>Contacto / Empresa *</label>
          <select [(ngModel)]="contactoId" name="contactoId" required>
            <option value="">Selecionar contacto...</option>
            @for (c of contacts(); track c.id) { <option [value]="c.id">{{ c.empresa }} — {{ c.nomeDecisor }}</option> }
          </select>
        </div>
        <div class="fr">
          <div class="fg">
            <label>Diretor Responsável</label>
            <select [(ngModel)]="responsavelId" name="responsavelId">
              <option value="">Selecionar diretor...</option>
              @for (s of socios(); track s.id) { <option [value]="s.id">{{ s.nome }}</option> }
            </select>
          </div>
          <div class="fg">
            <label>Duração</label>
            <select [(ngModel)]="duracao" name="duracao">
              <option [value]="30">30 minutos</option>
              <option [value]="60">60 minutos</option>
              <option [value]="90">90 minutos</option>
            </select>
          </div>
        </div>
        <div class="fg"><label>Notas para o convite</label><textarea [(ngModel)]="notas" name="notas" placeholder="Agenda, objetivos, contexto da reunião..." style="min-height:70px;"></textarea></div>
        <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:10px 12px;margin-bottom:14px;font-size:12px;color:#92610A;line-height:1.5;">
          Em produção: cria evento Google Calendar com os convidados selecionados.
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;">
          <button type="button" class="btn btn-ghost" (click)="close.emit()">Cancelar</button>
          <button type="submit" class="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Criar Reunião
          </button>
        </div>
      </form>
    </div>
  `
})
export class BookMeetingModalComponent {
  readonly slot     = input.required<BookingSlot>();
  readonly contacts = input<ContactoResumo[]>([]);
  readonly socios   = input<CurrentUser[]>([]);
  readonly close    = output<void>();
  readonly confirm  = output<ReuniaoRequest>();

  contactoId  = '';
  responsavelId = '';
  duracao     = 60;
  notas       = '';

  submit(): void {
    if (!this.contactoId) return;
    this.confirm.emit({
      contactoId:        Number(this.contactoId),
      dataReuniao:       `${this.slot().data}T${this.slot().hora}:00`,
      duracaoMinutos:    this.duracao,
      responsavelUserId: this.responsavelId ? Number(this.responsavelId) : undefined,
      notas:             this.notas || undefined,
    });
  }
}
