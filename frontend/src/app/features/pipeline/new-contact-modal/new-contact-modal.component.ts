import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactoRequest, SETOR_LABELS, enumOptions } from '../../../core/models/models';

const SETORES = enumOptions(SETOR_LABELS);

@Component({
  selector: 'app-new-contact-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="anim-overlay" (click)="close.emit()"
         style="position:fixed;inset:0;background:rgba(0,0,0,0.32);z-index:60;"></div>
    <div class="anim-fade" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:560px;max-width:95vw;background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,0.15);z-index:70;max-height:90vh;display:flex;flex-direction:column;">
      <div style="padding:20px 22px 14px;border-bottom:1px solid #E2E2DC;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
        <h3 style="font-size:17px;font-weight:700;">Novo Contacto</h3>
        <button (click)="close.emit()" style="background:none;border:none;cursor:pointer;color:#9CA3AF;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <form (ngSubmit)="submit()" style="padding:18px 22px;overflow:auto;">
        <div class="fg"><label>Empresa *</label><input type="text" [(ngModel)]="form.empresa" name="empresa" placeholder="Nome da empresa" required /></div>
        <div class="fr">
          <div class="fg"><label>Nome do Decisor *</label><input type="text" [(ngModel)]="form.nomeDecisor" name="nomeDecisor" placeholder="Nome completo" required /></div>
          <div class="fg"><label>Cargo</label><input type="text" [(ngModel)]="form.cargo" name="cargo" placeholder="ex: CMO, Head of Marketing" /></div>
        </div>
        <div class="fr">
          <div class="fg">
            <label>Setor</label>
            <select [(ngModel)]="form.setor" name="setor">
              @for (s of setores; track s.k) { <option [value]="s.k">{{ s.v }}</option> }
            </select>
          </div>
          <div class="fg"><label>Score Potencial (1–10)</label><input type="number" min="1" max="10" [(ngModel)]="form.scorePotencial" name="scorePotencial" /></div>
        </div>
        <div class="fr">
          <div class="fg"><label>Telefone</label><input type="tel" [(ngModel)]="form.telefone" name="telefone" placeholder="+351 9xx xxx xxx" /></div>
          <div class="fg"><label>Email</label><input type="email" [(ngModel)]="form.email" name="email" placeholder="email@empresa.pt" /></div>
        </div>
        <div class="fg"><label>LinkedIn URL</label><input type="text" [(ngModel)]="form.linkedinUrl" name="linkedinUrl" placeholder="linkedin.com/in/..." /></div>
        <div class="fg"><label>Notas</label><textarea [(ngModel)]="form.notas" name="notas" placeholder="Contexto, como foi encontrado, referências..."></textarea></div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:4px;">
          <button type="button" class="btn btn-ghost" (click)="close.emit()">Cancelar</button>
          <button type="submit" class="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Criar Contacto
          </button>
        </div>
      </form>
    </div>
  `
})
export class NewContactModalComponent {
  readonly close = output<void>();
  readonly saved = output<ContactoRequest>();

  readonly setores = SETORES;

  form: ContactoRequest = {
    empresa: '', setor: 'OUTRO', nomeDecisor: '', cargo: '',
    telefone: '', email: '', linkedinUrl: '', scorePotencial: 5, notas: ''
  };

  submit(): void {
    this.saved.emit({ ...this.form, notas: this.form.notas || undefined });
  }
}
