import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableColumnDirective } from './components/column/column.component';
import { DataTableHeaderComponent } from './components/header/header.component';
import { DataTableRowComponent } from './components/row/row.component';
import { DataTableComponent } from './components/data-table/datatable.component';
import { DataTablePaginationComponent } from './components/pagination/pagination.component';
import { PixelConverter } from './utility/px';
import { MinPipe } from './utility/min';
import { DataTableService } from './services/data-table.service';

@NgModule({
  declarations: [
    DataTableComponent,
    DataTableRowComponent,
    DataTableColumnDirective,
    DataTableHeaderComponent,
    DataTablePaginationComponent,
    PixelConverter,
    MinPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    DataTableComponent,
    DataTableColumnDirective,
    DataTableRowComponent
  ],
  providers:[
    DataTableService
  ]
})
export class DataTableModule { }
