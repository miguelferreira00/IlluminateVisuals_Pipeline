import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactoResumo, CallRequest, RESULTADO_LABELS, PROXIMO_PASSO_LABELS, CallResultado, CallProximoPasso, enumOptions } from '../../../core/models/models';

const RESULTADOS      = enumOptions(RESULTADO_LABELS);
const PROXIMOS_PASSOS = enumOptions(PROXIMO_PASSO_LABELS);

@Component({
  selector: 'app-new-call-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="anim-overlay" (click)="close.emit()"
         style="position:fixed;inset:0;background:rgba(0,0,0,0.32);z-index:60;"></div>
    <div class="anim-fade" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:520px;max-width:95vw;background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,0.15);z-index:70;">
      <div style="padding:20px 22px 14px;border-bottom:1px solid #E2E2DC;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <h3 style="font-size:17px;font-weight:700;">Registar Cold Call</h3>
          <p style="font-size:12px;color:#6B6960;margin-top:2px;">{{ contact().nomeDecisor }} · {{ contact().empresa }}</p>
        </div>
        <button (click)="close.emit()" style="background:none;border:none;cursor:pointer;color:#9CA3AF;padding:4px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <form (ngSubmit)="submit()" style="padding:18px 22px;">
        <div class="fr">
          <div class="fg"><label>Data e Hora</label><input type="datetime-local" [(ngModel)]="form.dataCall" name="dataCall" required /></div>
          <div class="fg">
            <label>Resultado</label>
            <select [(ngModel)]="form.resultado" name="resultado">
              @for (r of resultados; track r.k) { <option [value]="r.k">{{ r.v }}</option> }
            </select>
          </div>
        </div>
        <div class="fr">
          <div class="fg">
            <label>Próximo Passo</label>
            <select [(ngModel)]="form.proximoPasso" name="proximoPasso">
              @for (r of proximosPassos; track r.k) { <option [value]="r.k">{{ r.v }}</option> }
            </select>
          </div>
          <div class="fg"><label>Data de Follow-up</label><input type="date" [(ngModel)]="form.dataFollowUp" name="dataFollowUp" /></div>
        </div>
        <div class="fg">
          <label>Notas da Conversa</label>
          <textarea [(ngModel)]="form.notas" name="notas" style="min-height:90px;"
                    placeholder="O que foi discutido? Interesse, objeções, próximos passos..."></textarea>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:4px;">
          <button type="button" class="btn btn-ghost" (click)="close.emit()">Cancelar</button>
          <button type="submit" class="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Guardar Call
          </button>
        </div>
      </form>
    </div>
  `
})
export class NewCallModalComponent {
  readonly contact = input.required<ContactoResumo>();
  readonly close   = output<void>();
  readonly saved   = output<CallRequest>();

  readonly resultados      = RESULTADOS;
  readonly proximosPassos  = PROXIMOS_PASSOS;

  form = {
    dataCall:      new Date().toISOString().slice(0, 16),
    resultado:     'NAO_ATENDEU' as CallResultado,
    proximoPasso:  'NENHUM' as CallProximoPasso,
    dataFollowUp:  '',
    notas:         ''
  };

  submit(): void {
    this.saved.emit({
      contactoId:   this.contact().id,
      dataCall:     this.form.dataCall,
      resultado:    this.form.resultado,
      proximoPasso: this.form.proximoPasso,
      dataFollowUp: this.form.dataFollowUp || undefined,
      notas:        this.form.notas || undefined,
    });
  }
}
