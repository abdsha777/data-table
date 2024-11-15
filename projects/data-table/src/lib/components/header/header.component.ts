import { Component, HostListener, inject } from '@angular/core';
import { DataTableComponent } from '../data-table/datatable.component';

@Component({
  selector: 'data-table-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class DataTableHeaderComponent {
  protected columnSelectorOpen = false;
  protected readonly dataTable = inject(DataTableComponent);

  @HostListener('document:click')
  protected _closeSelector(): void {
    this.columnSelectorOpen = false;
  }
}