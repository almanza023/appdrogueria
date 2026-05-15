import { Component, ViewChild } from '@angular/core';
import { finalize } from 'rxjs';

import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';




import { Router } from '@angular/router';
import { VentaService } from 'src/app/core/services/venta.service';


@Component({
    selector: 'app-ventas',
    templateUrl: './ventas.component.html',
    providers: [MessageService],
})
export class VentasComponent {
    clienteDialog: boolean = false;
    deleteProductDialog: boolean = false;
    deleteProductsDialog: boolean = false;

    data: any[] = [];
    venta: any = {};
    selectedProducts: any[] = [];
    submitted: boolean = false;
    cols: any[] = [];
    statuses: any[] = [];
    seleccionado: any = {};
    item: any = {};
    rowsPerPageOptions = [5, 10, 20];
    posiciones:any[]=[];
    posicion:any={};
    detalles: any = [];
    totalpedido:any=0;
    totalcantidad:any=0;
    nombreModulo: string = 'Módulo de Ventas';

    fechaInicial:any;
    fechaFinal:any;
    filtroUser:string;
    rol:string;
    observaciones:string;
    filtroEstado:number=-1;
    estados:any=[
        {id:-1 , nombre:"TODOS"},
        {id:0 , nombre:"PENDIENTE"},
        {id:1 , nombre:"FACTURADA"},
        {id:2 , nombre:"ANULADA"},
    ]
    loading: boolean = false;



    constructor(
        private service: VentaService,
        private router: Router,
        private messageService: MessageService
    ) {}



    ngOnInit() {
        this.rol = localStorage.getItem('rol');

        this.cols = [ ];
        this.statuses = [];

        this.fechaInicial = this.formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); // fecha inicial del mes actual
        this.fechaFinal = this.formatDate(new Date()); // fecha actual

        this.buscar();
    }

    formatDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }

    buscar(){
        let rol = localStorage.getItem('rol');
        if (this.fechaInicial && !this.fechaFinal) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Si ingresa Fecha Inicial debe ingresar también Fecha Final',
                life: 3000
            });
            return;
        }
        let data:any = {
            fecha_inicio: this.fechaInicial,
            fecha_fin: this.fechaFinal,
            estado: this.filtroEstado,
            rol:localStorage.getItem('rol'),
            user_id:localStorage.getItem('user_id'),
        };

        if(rol != "1") {
            data.user_id = localStorage.getItem('user_id');
        }else{
            data.user_id = this.filtroUser;

        }

        this.data=[];
        this.loading = true;
        setTimeout(() => {

     this.service.postFilter(data)
        .subscribe(
            (response) => {
                this.data = response.data;
                if(this.data.length==0){
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: "No existen ventas Pendientes",
                        life: 3000,
                    });
                }
                this.loading = false;
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Advertencia',
                    detail: "Error al Consultar datos",
                    life: 3000,
                });
                this.loading = false;
            }

        );
        }, 1000);
    }

    openNew(id:any) {
        this.router.navigate(['/ventas/registro/'+id]); // Redirigir a la lista de pedidos
    }

    deleteSelectedProducts() {
        this.deleteProductsDialog = true;
    }


    anularVenta(cliente: any) {
        this.deleteProductDialog = true;
        this.venta = { ...cliente };
        this.venta.cambio_estado = true;
        this.venta.user_id=localStorage.getItem('user_id');
        this.venta.observaciones='';
    }

    confirmDelete() {

        if(this.venta.observaciones==undefined || this.venta.observaciones==''){
            this.messageService.add({
                severity: 'error',
                summary: 'Advertencia',
                detail: "Debe ingresar el motivo de anulación",
                life: 3000,
            });
            return;
        }

        this.venta = {
            id: this.venta.id,
            user_id: this.venta.user_id,
            observaciones: this.venta.observaciones
        };

        this.deleteProductDialog = false;
        this.service
            .postEstado(this.venta)
            .pipe(finalize(() => this.buscar()))
            .subscribe(
                (response) => {
                    let severity = '';
                    let summary = '';
                    if (response.isSuccess == true) {
                        severity = 'success';
                        summary = 'Exitoso';
                    } else {
                        severity = 'warn';
                        summary = 'Advertencia';
                    }
                    this.messageService.add({
                        severity: severity,
                        summary: summary,
                        detail: response.message,
                        life: 3000,
                    });
                },
                (error) => {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: error.error.data,
                        life: 3000,
                    });
                }
            );
        this.venta = {};
    }

    hideDialog() {
        this.clienteDialog = false;
        this.submitted = false;
    }

    getVenta(venta_id:any, observacion:string) {
        this.observaciones = observacion;
        this.service.getById(venta_id)
        .subscribe(
            (response) => {
                //console.log(response.data);
                this.clienteDialog=true;
                this.detalles = response.data.detalles;
            },
            (error) => {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: error.error.data,
                    life: 3000,
                });
            }
        );
    }

    calcularTotal() {
        this.totalpedido=this.detalles.reduce(
            (total, detalle) => Number(total) + Number(detalle.total_subtotal),
            0
        );
        this.totalcantidad=this.detalles.reduce(
            (total, detalle) => Number(total) + Number(detalle.total_cantidad),
            0
        );
        return this.totalpedido;
    }




    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    calcularTotalGeneral() {
        return this.data.reduce(
            (total, venta) => Number(total) + Number(venta.total),
            0
        );
    }

    exportarExcel() {
        import("xlsx").then(xlsx => {
            const mappedData = this.data.map(venta => ({
            id: venta.id,
            fecha: venta.fecha,
            total: venta.total,
        estado: venta.estado == 0 ? 'PENDIENTE' :
                venta.estado == 1 ? 'FACTURADA' :
                venta.estado == 2 ? 'ANULADA' : 'DESCONOCIDO',
            }));
            const worksheet = xlsx.utils.json_to_sheet(mappedData);
            worksheet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }]; // Set column width
            xlsx.utils.sheet_add_aoa(worksheet, [['ID', 'Fecha', 'Total', 'Estado']], { origin: 'A1' }); // Add headers
            const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.saveAsExcelFile(excelBuffer, "ventas");
        });
    }

    saveAsExcelFile(buffer: any, fileName: string): void {
        const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}_export_${new Date().getTime()}${EXCEL_EXTENSION}`;
        link.click();
        window.URL.revokeObjectURL(url);
    }




}
