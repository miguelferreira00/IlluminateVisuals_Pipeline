import { Component, input } from '@angular/core';
import { ContactoEstado, ESTADO_COLORS, ESTADO_LABELS } from '../../../core/models/models';

@Component({
  selector: 'app-estado-badge',
  standalone: true,
  template: `
    <span [style.background]="color().bg" [style.color]="color().t"
          style="padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap;display:inline-flex;align-items:center;gap:5px;">
      <span [style.background]="color().d"
            style="width:6px;height:6px;border-radius:50%;display:inline-block;flex-shrink:0;"></span>
      {{ label() }}
    </span>
  `
})
export class EstadoBadgeComponent {
  readonly estado = input.required<ContactoEstado>();
  color() { return ESTADO_COLORS[this.estado()] ?? { bg:'#F3F4F6', t:'#6B7280', d:'#9CA3AF' }; }
  label() { return ESTADO_LABELS[this.estado()] ?? this.estado(); }
}
