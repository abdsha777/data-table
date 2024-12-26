import { Component, Inject, forwardRef } from '@angular/core';
// import { DataTableComponent } from '../data-table/datatable.component';
import { DataTableService } from '../../services/data-table.service';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'data-table-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class DataTablePaginationComponent {

    constructor(
        // @Inject(forwardRef(() => DataTableComponent)) public dataTable: DataTableComponent,
        public dataTableService: DataTableService
    ) {}

    pageBack(): void {
        this.dataTableService.offset -= Math.min(this.dataTableService.limit, this.dataTableService.offset);
    }

    pageForward(): void {
        this.dataTableService.offset += this.dataTableService.limit;
    }

    pageFirst(): void {
        this.dataTableService.offset = 0;
    }

    pageLast(): void {
        this.dataTableService.offset = (this.maxPage - 1) * this.dataTableService.limit;
    }

    get maxPage(): number {
        return Math.ceil(this.dataTableService.itemCount / this.dataTableService.limit);
    }

    get limit(): number {
        return this.dataTableService.limit;
    }

    set limit(value) {
        this.dataTableService.limit = Number(value as any); // TODO better way to handle that value of number <input> is string?
    }

    get page(): number {
        return this.dataTableService.page;
    }

    set page(value) {
        this.dataTableService.page = Number(value as any);
    }
}
