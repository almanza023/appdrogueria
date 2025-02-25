import { Component, ViewChild } from '@angular/core';
import { finalize } from 'rxjs';
import * as XLSX from 'xlsx'; // Asegúrate de importar la biblioteca

import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { ProductosService } from 'src/app/core/services/productos.service';
import { SelectorCategoriaComponent } from 'src/app/shared/components/selector-categoria/selector-categoria.component';
import { SelectorUbicacionComponent } from 'src/app/shared/components/selector-ubicacion/selector-ubicacion.component';
import { SelectorProveedorComponent } from 'src/app/shared/components/selector-proveedor/selector-proveedor.component';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BodegaService } from 'src/app/core/services/bodega.service';

@Component({
    selector: 'app-productos',
    templateUrl: './productos.component.html',
    providers: [MessageService],
})
export class ProductosComponent {
    clienteDialog: boolean = false;
    deleteProductDialog: boolean = false;
    deleteProductsDialog: boolean = false;

    data: any[] = [];
    producto: any = {};
    cols: any[] = [];
    statuses: any[] = [];
    rowsPerPageOptions = [5, 10, 20];
    selectedFile: File | null = null;
    movimientos: any = [];
    displayMovimientosDialog: boolean = false;
    nombreProducto: string;
    categorias: any[] = []; // Lista de categorías
    proveedores: any[] = []; // Lista de proveedores
    nombreModulo: string = 'Módulo de Productos';
    @ViewChild(SelectorCategoriaComponent)
    categoriaComponent: SelectorCategoriaComponent;
    @ViewChild(SelectorUbicacionComponent)
    ubicacionComponent: SelectorUbicacionComponent;
    @ViewChild(SelectorProveedorComponent)
    proveedorComponent: SelectorProveedorComponent;

    productoForm: FormGroup;
    trasladoForm: FormGroup;
    filteredLaboratorios: any = [];
    bodegas: any = [];
    trasladoDialog:boolean=false;
    loading:boolean=true;

    constructor(
        private service: ProductosService,
        private bodegasService: BodegaService,
        private messageService: MessageService,
        private fb: FormBuilder
    ) {}

    ngOnInit() {

        this.getDataAll();
        this.getLaboratorios();
        this.cols = [];
        this.statuses = [];
        this.productoForm = this.fb.group({
            categoria_id: ['', Validators.required],
            proveedor_id: ['', Validators.required],
            ubicacion_id: ['', Validators.required],
            user_id: ['', Validators.required],
            nombre: ['', [Validators.required]],
            codigo: [''],
            descripcion: [''],
            laboratorio: ['OTRO'],
            lote: [''],
            fecha_vencimiento: [''],
            precio: ['0'],
            stock_actual: ['', [Validators.required]],
            detalles: this.fb.array([], Validators.required),
        });

        this.trasladoForm = this.fb.group({
            nombre: ['', [Validators.required]],
            producto_id: ['', [Validators.required]],
            user_id: ['', [Validators.required]],
            stock_general: ['', [Validators.required]],
            detalles: this.fb.array([], Validators.required),
        });


    }

    get detalles(): FormArray {
        return this.productoForm.get('detalles') as FormArray;
    }
    get detalle(): FormArray {
        return this.trasladoForm.get('detalles') as FormArray;
    }

    getDataAll() {
        this.loading=true;
        setTimeout(() => {
            this.service.getAll().subscribe(
                (response) => {
                    //console.log(response.data);
                    this.data = response.data;
                    this.loading=false;
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
        }, 2000);
    }

    getBodegas() {
        this.bodegas=[];
        this.bodegasService
            .getActive()
            .pipe(finalize(() => this.cargarInputs()))
            .subscribe(
                (response) => {
                    //console.log(response.data);
                    this.bodegas = response.data;
                },
                (error) => {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'Error al cargar bodegas',
                        life: 3000,
                    });
                }
            );
    }


    getLaboratorios() {
        this.service.getLaboratorio().subscribe(
            (response) => {
                //console.log(response.data);
                this.filteredLaboratorios = response.data;
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

    openNew() {
        this.producto = {};
        this.producto.editar = false;
        this.clienteDialog = true;
        this.reiniciarFormulario();
        this.getBodegas();
    }

    deleteSelectedProducts() {
        this.deleteProductsDialog = true;
    }

    filterLaboratorios(event: any) {
        const query = event.query.toLowerCase();
        this.filteredLaboratorios = this.filteredLaboratorios.filter(
            (laboratorio) => laboratorio.nombre.toLowerCase().includes(query)
        );
    }

    editProduct(item: any) {
        this.producto = { ...item };
        this.clienteDialog = true;
        this.producto.editar = true;
        this.categoriaComponent.filtrar(this.producto.categoria_id);
        this.proveedorComponent.filtrar(this.producto.proveedor_id);
        this.ubicacionComponent.filtrar(this.producto.ubicacion_id);
        this.productoForm
            .get('categoria_id')
            .setValue(this.producto.categoria_id);
        this.productoForm
            .get('ubicacion_id')
            .setValue(this.producto.ubicacion_id);
        this.productoForm
            .get('proveedor_id')
            .setValue(this.producto.proveedor_id);
        this.productoForm.get('nombre').setValue(this.producto.nombre);
        this.productoForm.get('codigo').setValue(this.producto.codigo);
        this.productoForm
            .get('descripcion')
            .setValue(this.producto.descripcion);
        this.productoForm
            .get('laboratorio')
            .setValue(this.producto.laboratorio);
        this.productoForm.get('lote').setValue(this.producto.lote);
        this.productoForm.get('precio').setValue(this.producto.precio);
        this.productoForm
            .get('stock_actual')
            .setValue(this.producto.stock_actual);
        this.productoForm
            .get('fecha_vencimiento')
            .setValue(this.producto.fecha_vencimiento);

            this.productoForm.removeControl('detalles');
    }

    bloqueoCliente(cliente: any) {
        this.deleteProductDialog = true;
        this.producto = { ...cliente };
        this.producto.cambio_estado = true;
        //this.jugadorModel=this.mapearDatos(this.proveedor, true);
    }

    confirmDelete() {
        this.deleteProductDialog = false;
        this.service
            .postEstado(this.producto.id)
            .pipe(finalize(() => this.getDataAll()))
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
        this.producto = {};
    }

    hideDialog() {
        this.clienteDialog = false;
    }

    saveProduct() {
        this.producto.user_id = localStorage.getItem('user_id');
        this.productoForm.get('user_id').setValue(this.producto.user_id);
        this.productoForm.get('lote').setValue(1);
        this.productoForm.get('laboratorio').setValue('OTROS');
        console.log(this.productoForm.value)
        if (this.producto.id == undefined) {
            if (this.productoForm.valid) {
                let data = this.productoForm.value;
                this.crear(data);
            } else {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'Formulario inválido. Verifique los campos.',
                    life: 3000,
                });
            }
        } else {
            if (this.productoForm.valid) {
                let data = this.productoForm.value;
                this.actualizar(this.producto.id, data);
            } else {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'Formulario inválido. Verifique los campos.',
                    life: 3000,
                });
            }
        }
        this.clienteDialog = false;
        this.reiniciarFormulario();
    }

    crear(item: any) {
        this.service
            .postData(item)
            .pipe(finalize(() => this.getDataAll()))
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
                        severity: 'error',
                        summary: 'Advertencia',
                        detail: 'Error al enviar datos',
                        life: 3000,
                    });
                }
            );
        this.producto = {};
        this.selectedFile = null;
    }

    actualizar(id: number, item: any) {
        this.service
            .putData(id, item)
            .pipe(finalize(() => this.getDataAll()))
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
                        severity: 'error',
                        summary: 'Advertencia',
                        detail: 'Error al enviar datos',
                        life: 3000,
                    });
                }
            );
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    onImageSelected(event: any) {
        this.selectedFile = event.target.files[0];
        if (this.selectedFile) {
            const fileType = this.selectedFile.type.split('/')[0];
            const fileSize = this.selectedFile.size / 1024 / 1024; // Convertir a MB

            if (fileType !== 'image' || fileSize > 5) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'Por favor, selecciona una imagen de menos de 5MB.',
                    life: 3000,
                });
                return;
            }
        }
    }

    verHistorialMovimiento(producto_id: any, nombre: string) {
        let item = {
            producto_id,
        };
        this.nombreProducto = nombre;

        this.service.postMovimientos(item).subscribe(
            (response) => {
                this.displayMovimientosDialog = true;
                this.movimientos = response.data;
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

    reiniciarFormulario() {
        this.categoriaComponent.reiniciarComponente();
        this.ubicacionComponent.reiniciarComponente();
        this.proveedorComponent.reiniciarComponente();
        this.productoForm.reset();

    }

    agregarABodega() {
        let stockActual = this.productoForm.get('stock_actual')?.value; // Get the stock_actual from the productoForm
        if (stockActual == null || stockActual === '') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'El stock actual no puede estar vacío.',
                life: 3000,
            });
            return;
        }

        let cantidadRegistroUno =
            this.detalles.at(0).get('cantidad')?.value || 0; // Get the quantity from the first record
            let nuevoValor = stockActual - cantidadRegistroUno;
            if (nuevoValor < 0) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se puede superar el stock actual.',
                    life: 3000,
                });
                return;
            }
            this.detalles.at(1).get('cantidad')?.setValue(nuevoValor); // Update the second record's quantity

    }

    cargarInputs() {
        if (this.bodegas.length > 0) {
            this.detalles.clear();
            for (let index = 0; index < this.bodegas.length; index++) {
                this.detalles.push(
                    this.fb.group({
                        bodega_id: [
                            this.bodegas[index].id,
                            Validators.required,
                        ],
                        cantidad: [0, [Validators.required, Validators.min(0)]],
                    })
                );
            }
        }
    }

    copiarTexto(){
        let nombre = this.productoForm.get('nombre')?.value;
        this.productoForm.get('descripcion')?.setValue(nombre);
    }

    openDialog(id:any, nombre:any, stock_actual:any, bodegas:any) {
        this.trasladoDialog = true;
        this.trasladoForm.get('nombre')?.setValue(nombre);
        this.trasladoForm.get('producto_id')?.setValue(id);
        this.trasladoForm.get('stock_general')?.setValue(stock_actual);
        this.trasladoForm.get('user_id')?.setValue(localStorage.getItem('user_id'));
        this.bodegas=bodegas;

        if (bodegas.length > 0) {
            this.detalle.clear();
            for (let index = 0; index < bodegas.length; index++) {
                this.detalle.push(
                    this.fb.group({
                        bodega_id: [
                            bodegas[index].bodega_id,
                            Validators.required,
                        ],
                        cantidad: [bodegas[index].cantidad, [Validators.required, Validators.min(0)]],
                    })
                );
            }
        }
    }

    cargarInputTraslado() {

    }

    agregarABodegaTraslado() {
        let stockActual = this.trasladoForm.get('stock_general')?.value; // Get the stock_actual from the productoForm
        if (stockActual == null || stockActual === '') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'El stock actual no puede estar vacío.',
                life: 3000,
            });
            return;
        }

        let cantidadRegistroUno =
            this.detalle.at(0).get('cantidad')?.value || 0; // Get the quantity from the first record
            let nuevoValor = stockActual - cantidadRegistroUno;
            if (nuevoValor < 0) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se puede superar el stock actual.',
                    life: 3000,
                });
                this.detalle.at(1).get('cantidad')?.setValue(null);
                return;
            }
            this.detalle.at(1).get('cantidad')?.setValue(nuevoValor); // Update the second record's quantity

    }

    storeTraslado() {
        console.log(this.trasladoForm.value);
        let item = this.trasladoForm.value;
        this.service
            .postProductoBodega(item)
            .pipe(finalize(() => this.getDataAll()))
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
                        severity: 'error',
                        summary: 'Advertencia',
                        detail: 'Error al enviar datos',
                        life: 3000,
                    });
                }
            );
        this.trasladoDialog = false;
    }

    exportarPDF() {
        const worksheet = XLSX.utils.json_to_sheet(this.data.map(item => ({
            'Nombre': item.nombre,
            'Descripción': item.descripcion,
            'C digo': item.codigo,
            'Lote': item.lote,
            'Precio Venta': item.precio,
            'Stock General': item.stock_actual,
            'Fecha Vencimiento': item.fecha_vencimiento,
            'Categoría': item.categoria?.nombre,
            'Distribuidor': item.proveedor?.nombre,
            'Laboratorio': item.laboratorio,
            'Estado': item.estado == "1" ? "Activo" : "Inactivo",
        })));
        const wscols = [
            { wch: 20 }, // Nombre
            { wch: 30 }, // Descripci n
            { wch: 15 }, // C digo
            { wch: 15 }, // Lote
            { wch: 15 }, // Precio Venta
            { wch: 15 }, // Stock General
            { wch: 15 }, // Fecha Vencimiento
            { wch: 20 }, // Categor a
            { wch: 20 }, // Distribuidor
            { wch: 20 }, // Laboratorio
            { wch: 10 }, // Estado
        ];
        worksheet['!cols'] = wscols;
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte de Productos');
        const fecha = new Date();
        const fechaFormateada = `${fecha.getDate()}_${fecha.getMonth() + 1}_${fecha.getFullYear()}`;
        XLSX.writeFile(workbook, `reporte_productos_${fechaFormateada}.xlsx`);
    }

}
