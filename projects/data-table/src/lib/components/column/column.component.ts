import { Directive, Input, ContentChild, OnInit, TemplateRef } from '@angular/core';
import { DataTableRowComponent } from '../row/row.component';
import { CellCallback } from '../types';

@Directive({
    selector: 'data-table-column',
})
export class DataTableColumnDirective implements OnInit {
    @Input() header!: string;
    @Input() sortable: boolean = false;
    @Input() resizable: boolean = false;
    @Input() property!: string;
    @Input() styleClass?: string;
    @Input() cellColors?: CellCallback;
    @Input() filter: boolean = false;

    @Input() width?: number | string;
    @Input() visible: boolean = true;

    @ContentChild('dataTableCell', { static: true })
    cellTemplate!: TemplateRef<any>;

    @ContentChild('dataTableHeader', { static: true })
    headerTemplate!: TemplateRef<any>;

    private styleClassObject: { [key: string]: boolean } = {};

    getCellColor(row: DataTableRowComponent, index: number): string | undefined {
        if (this.cellColors !== undefined) {
            return this.cellColors(row.item, row, this, index);
        }
        return undefined;
    }

    ngOnInit(): void {
        this._initCellClass();
    }

    private _initCellClass(): void {
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