import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-ticket-pos',
  templateUrl: './ticket-pos.component.html',
})
export class TicketPosComponent implements OnInit {
  tienda: string = '';
  nit: string = '';
  direccion: string = '';
  telefono: string = '';
  @Input() data: any = {};
  @ViewChild('ticketContent') ticketContent?: ElementRef<HTMLElement>;

  constructor() {}

  ngOnInit() {
    this.cargarDatosEmpresa();
  }

  private cargarDatosEmpresa() {
    this.tienda = localStorage.getItem('nombreEmpresa') || '';
    this.nit = localStorage.getItem('nitEmpresa') || '';
    this.direccion = localStorage.getItem('direccionEmpresa') || '';
    this.telefono = localStorage.getItem('telefonoEmpresa') || '';
  }

  printTicket() {
    this.cargarDatosEmpresa();
    const printContent = this.ticketContent?.nativeElement || document.getElementById('ticket-pos');
    const windowPrint = window.open('', '', 'width=360,height=650');
    if (windowPrint && printContent) {
      windowPrint.document.open();
      windowPrint.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Tirilla de Venta</title>
          <style>
            @page {
              size: auto;
              margin: 0;
            }

            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            html,
            body {
              width: 100%;
              background: #fff;
              color: #000;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 11px;
              line-height: 1.35;
              font-variant-numeric: tabular-nums;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .ticket {
              width: 100%;
              max-width: 76mm;
              margin: 0 auto;
              padding: 3mm 2.5mm 6mm 2.5mm;
            }

            .ticket-header {
              text-align: center;
              padding-bottom: 4px;
            }

            .ticket-header h1 {
              font-size: 14px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              line-height: 1.25;
              margin-bottom: 3px;
              word-break: break-word;
            }

            .ticket-header p {
              font-size: 10.5px;
              line-height: 1.35;
              margin: 1px 0;
            }

            .divider {
              border: none;
              border-top: 1px dashed #000;
              margin: 5px 0;
            }

            .divider-solid {
              border: none;
              border-top: 1.5px solid #000;
              margin: 5px 0;
            }

            .ticket-info {
              margin: 2px 0;
            }

            .info-row {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              gap: 6px;
              font-size: 10.5px;
              margin: 2px 0;
            }

            .info-row .label {
              font-weight: 700;
              white-space: nowrap;
            }

            .info-row .value {
              text-align: right;
            }

            .items {
              margin: 2px 0;
            }

            .items-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }

            .items-table thead th {
              font-size: 9.5px;
              font-weight: 700;
              text-transform: uppercase;
              padding: 2px 0 4px 0;
              border-bottom: 1px solid #000;
              vertical-align: bottom;
            }

            .items-table tbody td {
              padding: 3px 0;
              vertical-align: top;
              line-height: 1.3;
            }

            .col-producto {
              text-align: left;
              word-break: break-word;
              padding-right: 4px !important;
            }

            .col-cant {
              text-align: center;
              white-space: nowrap;
              width: 1%;
              padding-left: 4px !important;
              padding-right: 4px !important;
            }

            .col-precio {
              text-align: right;
              white-space: nowrap;
              width: 1%;
              padding-left: 4px !important;
              padding-right: 4px !important;
            }

            .col-total {
              text-align: right;
              white-space: nowrap;
              width: 1%;
              padding-left: 4px !important;
              font-weight: 700;
            }

            .totals {
              margin: 2px 0;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              gap: 8px;
              font-size: 10.5px;
              margin: 2.5px 0;
            }

            .total-row span:last-child {
              white-space: nowrap;
              text-align: right;
              font-weight: 600;
            }

            .total-grand {
              font-size: 13px;
              font-weight: 700;
              margin: 4px 0;
            }

            .total-grand span:last-child {
              font-weight: 700;
            }

            .ticket-footer {
              text-align: center;
              margin-top: 6px;
            }

            .ticket-footer p {
              font-size: 10.5px;
              font-weight: 700;
            }

            @media print {
              html,
              body {
                width: 100%;
              }
              .ticket {
                width: 100%;
                max-width: 76mm;
                margin: 0 auto;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
        </html>
      `);
      windowPrint.document.close();
      windowPrint.onafterprint = () => {
        windowPrint.close();
      };
      setTimeout(() => {
        windowPrint.focus();
        windowPrint.print();
      }, 150);
    }
  }
}
