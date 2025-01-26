import { Component, ViewChild } from '@angular/core';
import { finalize } from 'rxjs';

import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { Proveedor } from 'src/app/core/interface/Proveedor';

import { ProductosService } from 'src/app/core/services/productos.service';
import { SelectorCategoriaComponent } from 'src/app/shared/components/selector-categoria/selector-categoria.component';
import { SelectorUbicacionComponent } from 'src/app/shared/components/selector-ubicacion/selector-ubicacion.component';
import { SelectorProveedorComponent } from 'src/app/shared/components/selector-proveedor/selector-proveedor.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

    constructor(
        private service: ProductosService,
        private messageService: MessageService,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.getDataAll();
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
            laboratorio: [''],
            lote: [''],
            fecha_vencimiento: [''],
            precio: ['', [Validators.required]],
            stock_actual: ['', [Validators.required]],
        });
    }

    getDataAll() {
        this.service.getAll().subscribe(
            (response) => {
                //console.log(response.data);
                this.data = response.data;
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
    }

    deleteSelectedProducts() {
        this.deleteProductsDialog = true;
    }

    editProduct(item: any) {
        this.producto = { ...item };
        this.clienteDialog = true;
        this.producto.editar = true;
        this.categoriaComponent.filtrar(this.producto.categoria_id);
        this.proveedorComponent.filtrar(this.producto.proveedor_id);
        this.ubicacionComponent.filtrar(this.producto.ubicacion_id);
        this.productoForm.get('categoria_id').setValue(this.producto.categoria_id);
        this.productoForm.get('ubicacion_id').setValue(this.producto.ubicacion_id);
        this.productoForm.get('proveedor_id').setValue(this.producto.proveedor_id);
        this.productoForm.get('nombre').setValue(this.producto.nombre);
        this.productoForm.get('codigo').setValue(this.producto.codigo);
        this.productoForm.get('descripcion').setValue(this.producto.descripcion);
        this.productoForm.get('laboratorio').setValue(this.producto.laboratorio);
        this.productoForm.get('lote').setValue(this.producto.lote);
        this.productoForm.get('precio').setValue(this.producto.precio);
        this.productoForm.get('stock_actual').setValue(this.producto.stock_actual);
        this.productoForm.get('fecha_vencimiento').setValue(this.producto.fecha_vencimiento);
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
        if (this.producto.id==undefined) {
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

    reiniciarFormulario(){
        this.categoriaComponent.reiniciarComponente();
        this.ubicacionComponent.reiniciarComponente();
        this.proveedorComponent.reiniciarComponente();
        this.productoForm.reset();
    }
}
