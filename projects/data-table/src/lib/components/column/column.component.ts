import { Directive, Input, ContentChild, OnInit } from '@angular/core';
import { DataTableRowComponent } from '../row/row.component';
import { CellCallback } from '../types';


@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'data-table-column'
})
export class DataTableColumnDirective implements OnInit {

    // init:
    @Input() header: string;
    @Input() sortable = false;
    @Input() resizable = false;
    @Input() property: string;
    @Input() styleClass: string;
    @Input() cellColors: CellCallback;
    @Input() filter = false;

    // init and state:
    @Input() width: number | string;
    @Input() visible = true;

    @ContentChild('dataTableCell') cellTemplate: any;
    @ContentChild('dataTableHeader') headerTemplate: any;

    private styleClassObject = {}; // for [ngClass]

    getCellColor(row: DataTableRowComponent, index: number): string{
        if (this.cellColors !== undefined) {
            return (this.cellColors)(row.item, row, this, index);
        }
    }

    ngOnInit(): void {
        this._initCellClass();
    }

    private _initCellClass(): any {
        if (!this.styleClass && this.property) {
            if (/^[a-zA-Z0-9_]+$/.test(this.property)) {
                this.styleClass = 'column-' + this.property;
            } else {
                this.styleClass = 'column-' + this.property.replace(/[^a-zA-Z0-9_]/g, '');
            }
        }

        if (this.styleClass != null) {
            this.styleClassObject = {
                [this.styleClass]: true
            };
        }
    }
}
