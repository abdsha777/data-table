import {
  Component, Input, Inject, forwardRef, Output, EventEmitter, OnDestroy
} from '@angular/core';
// import { DataTableComponent } from '../data-table/datatable.component';
import { DataTableService } from '../../services/data-table.service';


@Component({
  selector: '[dataTableRow]',
  styleUrls: ['./row.component.scss'],
  templateUrl: './row.component.html'
})
export class DataTableRowComponent implements OnDestroy {

  @Input() item: any;
  @Input() index: number;

  expanded: boolean;

  // row selection:

  private _selected: boolean;

  @Output() selectedChange = new EventEmitter();

  get selected() {
      return this._selected;
  }

  set selected(selected) {
      this._selected = selected;
      this.selectedChange.emit(selected);
  }

  public _this = this; // FIXME is there no template keyword for this in angular 2?

  // other:

  get displayIndex(): number {
      if (this.dataTableService.pagination) {
          if (this.dataTableService.displayParams.offset) {
              return this.dataTableService.displayParams.offset + this.index + 1;
          }
          else { return 0 + this.index + 1; }
      } else {
          return this.index + 1;
      }
  }

  getTooltip(): string {
      if (this.dataTableService.rowTooltip) {
          return this.dataTableService.rowTooltip(this.item, this, this.index);
      }
      return '';
  }

  constructor(
    // @Inject(forwardRef(() => DataTableComponent)) public dataTable: DataTableComponent,
    public dataTableService: DataTableService
  ) {
    // console.log(this.item);
  }

  ngOnDestroy(): void {
      this.selected = false;
  }

  tryExpansion(): void {
      this.expanded = !this.expanded;
  }

  test(): void {
    //   console.log(this.item);
  }

  SelectionTrigger(): void {
      this.selected = !this.selected;
  }
}
