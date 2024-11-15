import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DataTableColumnDirective } from './components/column/column.component';
import { DataTableHeaderComponent } from './components/header/header.component';
import { DataTableRowComponent } from './components/row/row.component';
import { DataTableComponent } from './components/data-table/datatable.component';
import { DataTablePaginationComponent } from './components/pagination/pagination.component';
import { PixelConverter } from './utility/px';
import { MinPipe } from './utility/min';

const COMPONENTS = [
  DataTableComponent,
  DataTableRowComponent,
  DataTableColumnDirective,
  DataTableHeaderComponent,
  DataTablePaginationComponent
];

const PIPES = [
  PixelConverter,
  MinPipe
];

@NgModule({
  declarations: [...COMPONENTS, ...PIPES],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  exports: [
    DataTableComponent,
    DataTableColumnDirective,
    DataTableRowComponent
  ]
})
export class DataTableModule {}