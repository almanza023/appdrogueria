import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    items: MenuItem[] = [];

    constructor(public layoutService: LayoutService,
        private router:Router
    ) { }

    ngOnInit() {
        let rol=localStorage.getItem('rol');
        this.items = [
            {
                label: 'Inicio',
                icon: 'pi pi-fw pi-file',
                routerLink: 'dashboard',
            },
        ];

        let configuraciones= {
            label: 'Configuraciones',
            icon: 'pi pi-fw pi-pencil',
            items: [
                {
                    label: 'Empresa',
                    icon: 'pi pi-fw pi-align-justify',
                    routerLink: 'empresa',

                },
                {
                    label: 'Categorias',
                    icon: 'pi pi-fw pi-align-justify',
                    routerLink: 'categorias',

                },
                {
                    label: 'Tipo Pagos',
                    icon: 'pi pi-fw pi-align-justify',
                    routerLink: 'tipo-pagos',

                },
                {
                    label: 'Tipo Gastos',
                    icon: 'pi pi-fw pi-align-justify',
                    routerLink: 'tipo-gastos',
                },
                {
                    label: 'Bodegas',
                    icon: 'pi pi-fw pi-align-justify',
                    routerLink: 'bodegas',
                },

                {
                    label: 'Ubicaciones',
                    icon: 'pi pi-fw pi-align-justify',
                    routerLink: 'ubicaciones',
                },
                {
                    label: 'Distribuidores',
                    icon: 'pi pi-fw pi-align-justify',
                    routerLink: 'distribuidores',
                },
                {
                    label: 'Usuarios',
                    icon: 'pi pi-fw pi-align-justify',
                    routerLink: 'usuarios',
                },
            ]
        };
        let operaciones=
            {
                label: 'Operaciones',
                icon: 'pi pi-plus',
                items: [
                    {
                        label: 'Apertura de Caja Diaria',
                        icon: 'pi pi-fw pi-align-justify',
                        command: () => this.reloadCurrentRoute('apertura-caja')

                    },
                    {
                        label: 'Clientes',
                        icon: 'pi pi-fw pi-align-justify',
                        command: () => this.reloadCurrentRoute('clientes')

                    },
                    {
                        label: 'Productos',
                        icon: 'pi pi-fw pi-align-justify',
                        command: () => this.reloadCurrentRoute('productos')

                    },
                    {
                        label: 'Facturar',
                        icon: 'pi pi-fw pi-align-justify',
                        command: () => this.reloadCurrentRoute('ventas/registro/0')
                    },
                    {
                        label: 'Ventas',
                        icon: 'pi pi-fw pi-align-justify',
                        command: () => this.reloadCurrentRoute('ventas')
                    },
                    {
                        label: 'Gastos',
                        icon: 'pi pi-fw pi-align-justify',
                        command: () => this.reloadCurrentRoute('gastos')
                    },
                    {
                        label: 'Compras',
                        icon: 'pi pi-fw pi-align-justify',
                        command: () => this.reloadCurrentRoute('compras')
                    },
                ]
            };

            let operacionesCaja=
            {
                label: 'Operaciones',
                icon: 'pi pi-plus',
                items: [

                    {
                        label: 'Facturar',
                        icon: 'pi pi-fw pi-align-justify',
                        command: () => this.reloadCurrentRoute('ventas/registro/0')
                    },
                    {
                        label: 'Ventas',
                        icon: 'pi pi-fw pi-align-justify',
                        command: () => this.reloadCurrentRoute('ventas')
                    },


                ]
            };

            let reportes=
            {
                label: 'Reportes',
                icon: 'pi pi-chart-bar',
                items: [
                    {
                        label: 'Reporte Día',
                        icon: 'pi pi-fw pi-align-justify',
                        command: () => this.reloadCurrentRoute('reportes/dia')
                    },
                    {
                        label: 'Reporte Historico Caja Diaria',
                        icon: 'pi pi-fw pi-align-justify',
                        command: () => this.reloadCurrentRoute('reportes/historicos')

                    },
                    {
                        label: 'Reporte Historico Caja Menor',
                        icon: 'pi pi-fw pi-align-justify',
                        command: () => this.reloadCurrentRoute('reportes/caja-menor')

                    },

                ]
            };
            let reportesCaja=
            {
                label: 'Reportes',
                icon: 'pi pi-chart-bar',
                items: [
                    {
                        label: 'Reporte Día',
                        icon: 'pi pi-fw pi-align-justify',
                        command: () => this.reloadCurrentRoute('reportes/dia')
                    },

                ]
            };
            let perfil =
            {
                label: 'Perfil',
                icon: 'pi pi-users',
                routerLink: 'cambiar-clave',
            };

            let cerrar =
                {
                    label: 'Cerrar Sesión',
                    icon: 'pi pi-sign-out',
                    routerLink: 'auth',
                };

        if(localStorage.getItem('rol') == '1') {
            this.items.push(configuraciones);
            this.items.push(operaciones);
            this.items.push(reportes);
        }
        else if (localStorage.getItem('rol') == '2'){
            this.items.push(operacionesCaja);
            this.items.push(reportesCaja);
        }
        this.items.push(perfil);
        this.items.push(cerrar);
    }

    reloadCurrentRoute(route:string){
        this.router.navigateByUrl('/', {skipLocationChange:true}).then(()=>{
            this.router.navigate([route]);
        })
    }

}
