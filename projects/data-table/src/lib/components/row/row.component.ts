import {
  Component, 
  Input, 
  Inject, 
  forwardRef, 
  Output, 
  EventEmitter, 
  OnDestroy
} from '@angular/core';
import { DataTableComponent } from '../data-table/datatable.component';

@Component({
  selector: '[dataTableRow]',
  styleUrls: ['./row.component.scss'],
  templateUrl: './row.component.html'
})
export class DataTableRowComponent implements OnDestroy {
  @Input() item: any;
  @Input() index: number = 0;

  expanded: boolean = false;

  private _selected: boolean = false;

  @Output() selectedChange = new EventEmitter<boolean>();

  get selected(): boolean {
    return this._selected;
  }

  set selected(value: boolean) {
    this._selected = value;
    this.selectedChange.emit(value);
  }

  get displayIndex(): number {
    if (this.dataTable.pagination) {
      const offset = this.dataTable.displayParams?.offset ?? 0;
      return offset + this.index + 1;
    }
    return this.index + 1;
  }

  getTooltip(): string {
    if (this.dataTable.rowTooltip) {
      return this.dataTable.rowTooltip(this.item, this, this.index);
    }
    return '';
  }

  constructor(
    @Inject(forwardRef(() => DataTableComponent)) 
    public dataTable: DataTableComponent
  ) {
    // Optional: Add validation for required inputs
    if (this.item === undefined) {
      console.warn('DataTableRowComponent: item input is required');
    }
    if (this.index === undefined) {
      console.warn('DataTableRowComponent: index input is required');
    }
  }

  ngOnDestroy(): void {
    this.selected = false;
  }

  selectionTrigger(): void {
    this.selected = !this.selected;
  }
}