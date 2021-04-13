import { Component, Inject, forwardRef } from '@angular/core';
import { DataTableComponent } from '../data-table/datatable.component';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'data-table-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    '(document:click)': '_closeSelector()'
  }
})
export class DataTableHeaderComponent {

    columnSelectorOpen = false;

    _closeSelector(): void {
        this.columnSelectorOpen = false;
    }

    constructor(@Inject(forwardRef(() => DataTableComponent)) public dataTable: DataTableComponent) {}
}
