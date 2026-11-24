
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProveedorService } from 'src/app/core/services/proveedor.service';



@Component({
  selector: 'app-selector-proveedor',
  templateUrl: './selector-proveedor.component.html',
})
export class SelectorProveedorComponent {

  items: any = [];
  seleccionado: any = null;
  arraySeleccionado: any = [];
  valorPendiente: any = null;
  @Input() valor: any = {};
  @Input() disabled: boolean = false;
  @Input() lider: string;

  @Output() itemSeleccionado: EventEmitter<any> = new EventEmitter<any>();
  selectedCliente: string = '';
  constructor(private service: ProveedorService) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.service.getActive()
    .subscribe(response => {
      this.items = response.data || [];
      if (this.valorPendiente !== null && this.valorPendiente !== undefined && this.valorPendiente !== '') {
        this.seleccionado = this.items.find((objeto: any) => objeto['id'] == this.valorPendiente) || null;
      }
    }, error => {
      //console.log( error.error)
    });
  }

  onChange(event) {
    this.itemSeleccionado.emit(event.value);
  }

  reiniciarComponente(): void {
    this.valorPendiente = null;
    this.seleccionado = null; // Reiniciar el estado del componente hijo
  }

  filtrar(valor: any) {
    this.valorPendiente = valor;
    if (valor !== null && valor !== undefined && valor !== '') {
      if (this.items && this.items.length > 0) {
        this.seleccionado = this.items.find((objeto: any) => objeto['id'] == valor) || null;
      }
    } else {
      this.seleccionado = null;
    }
  }




}
