
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MesasService } from 'src/app/core/services/mesas.service';

@Component({
  selector: 'app-selector-ubicacion',
  templateUrl: './selector-ubicacion.component.html',
})
export class SelectorUbicacionComponent {

  items: any = [];
  seleccionado: any = null;
  arraySeleccionado: any = [];
  valorPendiente: any = null;
  seleccionarPrimeroPendiente: boolean = true;
  @Input() valor: any = {};
  @Input() disabled: boolean = false;
  @Input() lider: string;

  @Output() itemSeleccionado: EventEmitter<any> = new EventEmitter<any>();
  selectedCliente: string = '';
  constructor(private service: MesasService) { }

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
    this.seleccionarPrimeroPendiente = false;
    this.itemSeleccionado.emit(event.value);
  }

  reiniciarComponente(): void {
    this.valorPendiente = null;
    this.seleccionarPrimeroPendiente = false;
    this.seleccionado = null; // Reiniciar el estado del componente hijo
  }

  seleccionarPrimero(): void {
    this.valorPendiente = null;
    this.seleccionarPrimeroPendiente = true;
    this.aplicarSeleccionPendiente();
  }

  filtrar(valor: any) {
    this.valorPendiente = valor;
    this.seleccionarPrimeroPendiente = true;
    this.aplicarSeleccionPendiente();
  }

  private aplicarSeleccionPendiente() {
    if (!this.items || this.items.length === 0) {
      return;
    }

    if (this.valorPendiente !== null && this.valorPendiente !== undefined && this.valorPendiente !== '') {
      const encontrado = this.items.find((objeto: any) => objeto['id'] == this.valorPendiente);
      if (encontrado) {
        this.seleccionado = encontrado;
        this.itemSeleccionado.emit(encontrado);
        return;
      }
    }

    if (this.seleccionarPrimeroPendiente) {
      this.seleccionado = this.items[0];
      this.itemSeleccionado.emit(this.seleccionado);
    }
  }




}
