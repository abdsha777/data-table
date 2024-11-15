import { Component, Inject, forwardRef } from '@angular/core';
import { DataTableComponent } from '../data-table/datatable.component';

@Component({
    selector: 'app-data-table-pagination',
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.scss'],
})
export class DataTablePaginationComponent {
    constructor(@Inject(forwardRef(() => DataTableComponent)) public dataTable: DataTableComponent) {}

    get maxPage(): number {
        return Math.ceil((this.dataTable.itemCount ?? 0) / this.dataTable.limit);
    }

    get limit(): number {
        return this.dataTable.limit;
    }

    set limit(value: string | number) {
        this.dataTable.limit = Number(value);
    }

    get page(): number {
        return this.dataTable.page;
    }

    set page(value: string | number) {
        this.dataTable.page = Number(value);
    }

    pageBack(): void {
        this.dataTable.offset -= Math.min(this.dataTable.limit, this.dataTable.offset);
    }

    pageForward(): void {
        this.dataTable.offset += this.dataTable.limit;
    }

    pageFirst(): void {
        this.dataTable.offset = 0;
    }

    pageLast(): void {
        this.dataTable.offset = (this.maxPage - 1) * this.dataTable.limit;
    }
}