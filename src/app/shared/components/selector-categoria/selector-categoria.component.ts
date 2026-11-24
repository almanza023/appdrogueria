
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoriaService } from 'src/app/core/services/categoria.service';
import { TipoGastosService } from 'src/app/core/services/tipo-gastos.service';

@Component({
  selector: 'app-selector-categoria',
  templateUrl: './selector-categoria.component.html',
})
export class SelectorCategoriaComponent {

  items: any = [];
  seleccionado: any = null;
  arraySeleccionado: any = [];
  valorPendiente: any = null;
  nombrePendiente: string | null = null;
  @Input() valor: any = {};
  @Input() lider: string;

  @Output() itemSeleccionado: EventEmitter<any> = new EventEmitter<any>();
  selectedCliente: string = '';
  constructor(private service: CategoriaService) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.service.getActive()
    .subscribe(response => {
      this.items = response.data || [];
      this.aplicarSeleccionPendiente();
    }, error => {
      //console.log( error.error)
    });
  }

  onChange(event) {
    this.valorPendiente = null;
    this.nombrePendiente = null;
    this.itemSeleccionado.emit(event.value);
  }

  reiniciarComponente(): void {
    this.valorPendiente = null;
    this.nombrePendiente = null;
    this.seleccionado = null; // Reiniciar el estado del componente hijo
  }

  filtrar(valor: any) {
    this.nombrePendiente = null;
    this.valorPendiente = valor;
    if (valor !== null && valor !== undefined && valor !== '') {
      this.aplicarSeleccionPendiente();
    } else {
      this.seleccionado = null;
    }
  }

  seleccionarPorNombre(nombre: string) {
    this.valorPendiente = null;
    this.nombrePendiente = nombre;
    this.aplicarSeleccionPendiente();
  }

  private aplicarSeleccionPendiente() {
    if (!this.items || this.items.length === 0) {
      return;
    }

    if (this.nombrePendiente) {
      const objetivo = this.nombrePendiente.trim().toUpperCase();
      const encontrado =
        this.items.find(
          (objeto: any) => String(objeto?.nombre || '').trim().toUpperCase() === objetivo
        ) ||
        this.items.find(
          (objeto: any) => String(objeto?.nombre || '').trim().toUpperCase().includes(objetivo)
        ) ||
        null;

      this.seleccionado = encontrado;
      if (encontrado) {
        this.itemSeleccionado.emit(encontrado);
      }
      return;
    }

    if (this.valorPendiente !== null && this.valorPendiente !== undefined && this.valorPendiente !== '') {
      this.seleccionado = this.items.find((objeto: any) => objeto['id'] == this.valorPendiente) || null;
    }
  }




}
