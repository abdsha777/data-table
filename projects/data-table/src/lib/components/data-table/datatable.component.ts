import {
    Component, Input, Output, EventEmitter, ContentChildren, QueryList,
    TemplateRef, ContentChild, ViewChildren, OnInit
} from '@angular/core';
import { DataTableColumnDirective } from '../column/column.component';
import { DataTableRowComponent} from '../row/row.component';
import { DataTableParams } from '../types';
import { DataTableTranslations, defaultTranslations, SearchParam, RowCallback } from '../types';
import { drag } from '../../utility/drag';



@Component({
    // tslint:disable-next-line:component-selector
    selector: 'data-table',
    templateUrl: './datatable.component.html',
    styleUrls: ['./datatable.component.scss']
})
export class DataTableComponent implements DataTableParams, OnInit {
    @Input() get items(): any[] {
        return this._items;
    }

    set items(items: any[]) {
        this._items = items;
        this._onReloadFinished();
    }

    @Input()
    get sortBy(): string {
        return this._sortBy;
    }

    set sortBy(value) {
        this._sortBy = value;
        this._triggerReload();
    }

    @Input()
    get sortAsc(): boolean {
        return this._sortAsc;
    }

    set sortAsc(value) {
        this._sortAsc = value;
        this._triggerReload();
    }

    @Input()
    get offset(): number {
        return this._offset;
    }

    set offset(value) {
        this._offset = value;
        this._triggerReload();
    }

    @Input()
    get limit(): number {
        return this._limit;
    }

    set limit(value) {
        this._limit = value;
        this._triggerReload();
    }

    // calculated property:

    @Input()
    get page(): number {
        return Math.floor(this.offset / this.limit) + 1;
    }

    set page(value) {
        this.offset = (value - 1) * this.limit;
    }

    get lastPage(): number {
        return Math.ceil(this.itemCount / this.limit);
    }

    get reloading(): boolean {
        return this._reloading;
    }

    get displayParams() {
        return this._displayParams;
    }

    get columnCount(): number {
        let count = 0;
        count += this.indexColumnVisible ? 1 : 0;
        count += this.selectColumnVisible ? 1 : 0;
        count += this.expandColumnVisible ? 1 : 0;
        this.columns.toArray().forEach(column => {
            count += column.visible ? 1 : 0;
        });
        return count;
    }

    get selectAllCheckbox() {
        return this._selectAllCheckbox;
    }

    set selectAllCheckbox(value) {
        this._selectAllCheckbox = value;
        this._onSelectAllChanged(value);
    }

    // other:

    get substituteItems(): any[] {
        if (this.displayParams.limit) {
            return this.CreateFakeArrays(this.displayParams.limit - this.items.length);
        }
        else {
            this.displayParams.limit = 10;
            return this.CreateFakeArrays(this.displayParams.limit - this.items.length);
        }
    }

    // tslint:disable-next-line:variable-name
    private _items: any[] = [];
    showPopup: number = null;
    keyTrigger: (e: any) => void;
    popupTimeout: any;
    searchCompleted: boolean;

    @Input() itemCount: number;

    // UI components:

    @ContentChildren(DataTableColumnDirective) columns: QueryList<DataTableColumnDirective>;
    @ViewChildren(DataTableRowComponent) rows: QueryList<DataTableRowComponent>;
    @ContentChild('dataTableExpand') expandTemplate: TemplateRef<any>;

    // One-time optional bindings with default values:

    @Input() headerTitle: string;
    @Input() header = true;
    @Input() pagination = true;
    @Input() indexColumn = true;
    @Input() indexColumnHeader = '';
    @Input() rowColors: RowCallback;
    @Input() rowTooltip: RowCallback;
    @Input() selectColumn = true;
    @Input() multiSelect = true;
    @Input() substituteRows = true;
    @Input() expandableRows = false;
    @Input() translations: DataTableTranslations = defaultTranslations;
    @Input() selectOnRowClick = false;
    @Input() autoReload = true;
    @Input() showReloading = false;
    @Input() autoSearch = true;

    // UI state without input:

    indexColumnVisible: boolean;
    selectColumnVisible: boolean;
    expandColumnVisible: boolean;

    // UI state: visible ge/set for the outside with @Input for one-time initial values

    private _sortBy: string;
    private _sortAsc = true;

    private _offset = 0;
    private _limit = 10;

    // Reloading:

    _reloading = false;

    // tslint:disable-next-line:member-ordering
    @Output() reload = new EventEmitter();

    // tslint:disable-next-line:member-ordering
    _displayParams = {} as DataTableParams; // params of the last finished reload

    // tslint:disable-next-line:member-ordering
    _scheduledReload: number | null = null;

    // event handlers:

    // tslint:disable-next-line:member-ordering
    @Output() rowClick = new EventEmitter();
    // tslint:disable-next-line:member-ordering
    @Output() rowDoubleClick = new EventEmitter();
    // tslint:disable-next-line:member-ordering
    @Output() headerClick = new EventEmitter();
    // tslint:disable-next-line:member-ordering
    @Output() cellClick = new EventEmitter();
    // tslint:disable-next-line:member-ordering
    @Output() rowExpanded = new EventEmitter();
    // tslint:disable-next-line:member-ordering
    @Output() rowCollapsed = new EventEmitter();

    // selection:

    selectedRow: DataTableRowComponent | undefined;
    selectedRows: DataTableRowComponent[] = [];

    private _selectAllCheckbox = false;

    // column resizing:

    private _resizeInProgress = false;

    resizeLimit = 30;

    search: SearchParam[] = [];

    // setting multiple observable properties simultaneously

    sort(sortBy: string, asc: boolean): void {
        this.sortBy = sortBy;
        this.sortAsc = asc;
    }

    // init

    ngOnInit(): void {
        this._initDefaultValues();
        this._initDefaultClickEvents();
        this._updateDisplayParams();

        if (this.autoReload && this._scheduledReload == null) {
            this.reloadItems();
        }
    }

    private _initDefaultValues(): void {
        this.indexColumnVisible = this.indexColumn;
        this.selectColumnVisible = this.selectColumn;
        this.expandColumnVisible = this.expandableRows;
    }

    private _initDefaultClickEvents(): void {
        this.headerClick.subscribe((tableEvent: any) => this.sortColumn(tableEvent.column));
        if (this.selectOnRowClick && !this.expandableRows) {
            this.rowClick.subscribe((tableEvent: any) => tableEvent.row.selected = !tableEvent.row.selected);
        }
    }

    reloadItems(): void {
        this._reloading = true;
        this.reload.emit(this._getRemoteParameters());
    }

    private _onReloadFinished(): void {
        this._updateDisplayParams();

        this._selectAllCheckbox = false;
        this._reloading = false;
    }

    _updateDisplayParams(): void {
        this._displayParams = {
            sortBy: this.sortBy,
            sortAsc: this.sortAsc,
            offset: this.offset,
            limit: this.limit,
            search: this.search
        };
    }

    // for avoiding cascading reloads if multiple params are set at once:
    _triggerReload(): void {
        if (this._scheduledReload) {
            clearTimeout(this._scheduledReload);
        }
        this._scheduledReload = setTimeout(() => {
            this.reloadItems();
        });
    }

    rowClicked(row: DataTableRowComponent, event: any): void {
        if (this.expandColumnVisible) {
            if (row.expanded) {
                row.expanded = false;
                this.rowClick.emit({ row, event });
                this.rowCollapsed.emit(row);
                return;
            }
            // make this the expanded column
            for (const r of this.rows.toArray()) {
                if (r.expanded) {
                    r.expanded = false;
                    this.rowCollapsed.emit(r);
                }
            }
            row.expanded = true;
            this.rowExpanded.emit(row);
        }

        this.rowClick.emit({ row, event });
    }

    rowDoubleClicked(row: DataTableRowComponent, event: any): void {
        this.rowDoubleClick.emit({ row, event });
    }

    headerClicked(column: DataTableColumnDirective, event: MouseEvent): void {
        if (!this._resizeInProgress) {
            this.headerClick.emit({ column, event });
        } else {
            this._resizeInProgress = false; // this is because I can't prevent click from mousup of the drag end
        }
    }

    cellClicked(column: DataTableColumnDirective, row: DataTableRowComponent, event: MouseEvent): void {
        this.cellClick.emit({ row, column, event });
    }

    // functions:

    private _getRemoteParameters(): DataTableParams {
        const params = {} as DataTableParams;

        if (this.sortBy) {
            params.sortBy = this.sortBy;
            params.sortAsc = this.sortAsc;
        }
        if (this.pagination) {
            params.offset = this.offset;
            params.limit = this.limit;
        }
        params.search = this.search;
        return params;
    }

    private sortColumn(column: DataTableColumnDirective): void {
        if (column.sortable) {
            const ascending = this.sortBy === column.property ? !this.sortAsc : true;
            this.sort(column.property, ascending);
        }
    }

    getRowColor(item: any, index: number, row: DataTableRowComponent): string {
        if (this.rowColors !== undefined) {
            return (this.rowColors as RowCallback)(item, row, index);
        }
    }

    private _onSelectAllChanged(value: boolean): void {
        this.rows.toArray().forEach(row => row.selected = value);
    }

    onRowSelectChanged(row: DataTableRowComponent): void {
        // maintain the selectedRow(s) view
        if (this.multiSelect) {
            const index = this.selectedRows.indexOf(row);
            if (row.selected && index < 0) {
                this.selectedRows.push(row);
            } else if (!row.selected && index >= 0) {
                this.selectedRows.splice(index, 1);
            }
        } else {
            if (row.selected) {
                this.selectedRow = row;
            } else if (this.selectedRow === row) {
                this.selectedRow = undefined;
            }
        }

        // unselect all other rows:
        if (row.selected && !this.multiSelect) {
            this.rows.toArray().filter(row_ => row_.selected).forEach(row_ => {
                if (row_ !== row) { // avoid endless loop
                    row_.selected = false;
                }
            });
        }
    }

    CreateFakeArrays(length: number): any[] {
        const l = [];
        while (length !== 0) {
            l.push(undefined);
            length--;
        }

        return l;
    }

    resizeColumnStart(event: MouseEvent, column: DataTableColumnDirective, columnElement: HTMLElement): void {
        this._resizeInProgress = true;

        drag(event, {
            move: (moveEvent: MouseEvent, dx: number) => {
                if (this._isResizeInLimit(columnElement, dx)) {
                    column.width = columnElement.offsetWidth + dx;
                }
            },
        });
    }

    private _isResizeInLimit(columnElement: HTMLElement, dx: number): boolean {
        /* This is needed because CSS min-width didn't work on table-layout: fixed.
         Without the limits, resizing can make the next column disappear completely,
         and even increase the table width. The current implementation suffers from the fact,
         that offsetWidth sometimes contains out-of-date values. */
        if ((dx < 0 && (columnElement.offsetWidth + dx) <= this.resizeLimit) ||
            !columnElement.nextElementSibling || // resizing doesn't make sense for the last visible column
            (dx >= 0 && ((columnElement.nextElementSibling as HTMLElement).offsetWidth + dx) <= this.resizeLimit)) {
            return false;
        }
        return true;
    }

    filterColumn(e: any, column: DataTableColumnDirective, id: number): void {
        if (!this.autoSearch) {
            clearTimeout(this.popupTimeout);
            this.showPopup = null;
            this.searchCompleted = false;
            this.popupTimeout = setTimeout(() => {
                this.showPopup = id;
            }, 2000);
        }
        const newVal: string = e.target.value.trim();
        const columnName: string = column.property;

        let i = -1;
        // find the search term column
        this.search.map(
            (s: SearchParam, index: number) => {
                if (s.column === columnName) {
                    i = index;
                }
            }
        );

        if (newVal === '') {
            // remove this column search term if exists
            if (i > -1) {
                this.search.splice(i, 1);
            }
        }
        else {
            // there is some text in search
            if (i > -1) {
                this.search[i].term = newVal;
            }
            else {
                const s: SearchParam = {
                    column: columnName,
                    term: newVal
                };

                this.search.push(s);
            }
        }
        if (this.autoSearch) {
            this.offset = 0;
        }
    }

    startSearch(e: any): void {
        this.showPopup = null;
        clearTimeout(this.popupTimeout);
        if (!this.autoSearch && !this.searchCompleted) {
            this.offset = 0;
            this.searchCompleted = true;
        }
    }

    onFocusout(e: any): void {
        if (!this.searchCompleted) {
            this.startSearch(e);
        }
        // this.keyTrigger = function (e) {
        //     if(e.keyCode == 13) {
        //         this.startSearch();
        //         document.removeEventListener('keyup', this.keyTrigger);
        //     }
        // };
        // document.addEventListener('keyup', this.keyTrigger);
    }

    isFilterRequested(): boolean {
        const fs = 0;
        const fc = this.columns.toArray();
        for (const c of fc) {
            if (c.filter) {
                return true;
            }
        }
        return false;
    }

    SelectionTrigger(): void {
        this.selectAllCheckbox = !this.selectAllCheckbox;
    }
}
