import {
    Component, Input, Output, EventEmitter, ContentChildren,
    TemplateRef, ContentChild, ViewChildren, OnInit,
} from '@angular/core';
import { DataTableColumnDirective } from '../column/column.component';
import { DataTableRowComponent} from '../row/row.component';
import { DataTableParams } from '../types';
import { DataTableTranslations, defaultTranslations, SearchParam, RowCallback } from '../types';
import { drag } from '../../utility/drag';
import { DataTableService } from '../../services/data-table.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'data-table',
    templateUrl: './datatable.component.html',
    styleUrls: ['./datatable.component.scss']
})
export class DataTableComponent implements DataTableParams, OnInit  {

    constructor(public dataTableService: DataTableService){}

    @Input() get items(): any[] {
        return this._items;
    }

    set items(items: any[]) {
        this._items = items;
        this._onReloadFinished();
    }

    @Input()
    get sortBy(): string {
        return this.dataTableService.sortBy;
    }

    set sortBy(value) {
        this.dataTableService.sortBy = value;
        this.dataTableService.triggerReload();
    }

    @Input()
    get sortAsc(): boolean {
        return this.dataTableService.sortAsc;
    }

    set sortAsc(value) {
        this.dataTableService.sortAsc = value;
        this.dataTableService.triggerReload();
    }

    @Input()
    get offset(): number {
        return this.dataTableService.offset;
    }

    set offset(value) {
        this.dataTableService.offset = value
        console.log("offset changes")
        this._triggerReload();
    }

    @Input()
    get limit(): number {
        return this.dataTableService.limit;
    }

    set limit(value) {
        this.dataTableService.limit = value;
        this.dataTableService.triggerReload();
    }

    // calculated property:

    @Input()
    get page(): number {
        // return this.dataTableService.page
        return Math.floor(this.offset / this.limit) + 1
    }

    set page(value) {
        this.dataTableService.page = value
        this.dataTableService.offset = (value)
    }

    get lastPage(): number {
        return this.dataTableService.lastPage
    }

    get displayParams() {
        return this.dataTableService.displayParams;
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

    @Input()
    set itemCount(value){
        this.dataTableService.itemCount = value
    }
    get itemCount(){
        return this.dataTableService.itemCount
    }

    // UI components:

    // @ContentChildren(DataTableColumnDirective) columns: QueryList<DataTableColumnDirective>;
    @ContentChildren(DataTableColumnDirective)
    set columns(value){
        this.dataTableService.columns = value
    }
    get columns(){
        return this.dataTableService.columns
    }

    // @ViewChildren(DataTableRowComponent) rows: QueryList<DataTableRowComponent>;
    @ViewChildren(DataTableRowComponent)
    set rows(value){
        this.dataTableService.rows = value
    }
    get rows(){
        return this.dataTableService.rows
    }
    @ContentChild('dataTableExpand')
    set expandTemplate(value){
        this.dataTableService.expandTemplate = value
    }
    get expandTemplate(){
        return this.dataTableService.expandTemplate
    }

    // One-time optional bindings with default values:

    @Input()
    set headerTitle(value){
        this.dataTableService.headerTitle = value
    }
    get headerTitle(){
        return this.dataTableService.headerTitle
    }
    @Input() header = true;
    @Input() 
    set pagination(value){
        this.dataTableService.pagination = value
    }
    get pagination(){
        return this.dataTableService.pagination
    }
    @Input()
    set indexColumn(value){
        this.dataTableService.indexColumn = value
    }
    get indexColumn(){
        return this.dataTableService.indexColumn
    }
    @Input() indexColumnHeader = '';
    // @Input() rowColors: RowCallback;
    @Input()
    set rowTooltip(value){
        this.dataTableService.rowTooltip = value
    }
    get rowTooltip(){
        return this.dataTableService.rowTooltip
    }
    @Input()
    set selectColumn(value){
        this.dataTableService.selectColumn = value
    }
    get selectColumn(){
        return this.dataTableService.selectColumn
    }
    @Input() multiSelect = true;
    @Input() substituteRows = true;
    // @Input() expandableRows = false;
    @Input()
    set expandableRows(value: boolean){
        this.dataTableService.expandableRows = value
    }
    get expandableRows(){
        return this.dataTableService.expandableRows
    }
    @Input()
    set translations(value){
        this.dataTableService.translations = value
    }
    get translations(){
        return this.dataTableService.translations
    }
    // @Input() selectOnRowClick = false;
    @Input()
    set selectOnRowClick(value: boolean){
        this.dataTableService.selectOnRowClick = value
    }
    get selectOnRowClick(){
        return this.dataTableService.selectOnRowClick
    }
    @Input() autoReload = true;
    @Input() showReloading = false;
    @Input() autoSearch = true;

    // UI state without input:

    set indexColumnVisible(value){
        this.dataTableService.indexColumnVisible = value
    }
    get indexColumnVisible(){
        return this.dataTableService.indexColumnVisible
    }

    set selectColumnVisible(value) {
        this.dataTableService.selectColumnVisible = value;
    }
    get selectColumnVisible(){
        return this.dataTableService.selectColumnVisible
    }
    // expandColumnVisible: boolean;
    set expandColumnVisible(value) {
        this.dataTableService.expandColumnVisible = value;
    }
    get expandColumnVisible() {
        return this.dataTableService.expandColumnVisible
    }
    // UI state: visible ge/set for the outside with @Input for one-time initial values

    private _sortBy: string;
    private _sortAsc = true;

    private _offset = 0;
    private _limit = 10;

    // Reloading:

    set reloading(value){
        this.dataTableService.reloading = value
    }
    get reloading(){
        return this.dataTableService.reloading
    }

    // tslint:disable-next-line:member-ordering
    @Output() reload = this.dataTableService.reload;

    // tslint:disable-next-line:member-ordering
    // _displayParams = {} as DataTableParams; // params of the last finished reload

    // tslint:disable-next-line:member-ordering
    _scheduledReload: number | null = null;

    // event handlers:

    // tslint:disable-next-line:member-ordering
    @Output() rowClick = this.dataTableService.rowClick;
    // @Output() rowClick = new EventEmitter();
    // tslint:disable-next-line:member-ordering
    @Output() rowDoubleClick = this.dataTableService.rowDoubleClick;
    // @Output() rowDoubleClick = new EventEmitter();
    // tslint:disable-next-line:member-ordering
    @Output() headerClick = new EventEmitter();
    // tslint:disable-next-line:member-ordering
    @Output() cellClick = new EventEmitter();
    // tslint:disable-next-line:member-ordering
    @Output() rowExpanded = this.dataTableService.rowExpanded;
    // @Output() rowExpanded = new EventEmitter();
    // tslint:disable-next-line:member-ordering
    @Output() rowCollapsed = this.dataTableService.rowCollapsed;
    // @Output() rowCollapsed = new EventEmitter();

    // selection:

    selectedRow: DataTableRowComponent | undefined;
    selectedRows: DataTableRowComponent[] = [];

    private _selectAllCheckbox = false;

    // column resizing:

    private _resizeInProgress = false;

    resizeLimit = 30;

    set search(value){
        this.dataTableService.search = value
    }
    get search(){
        return this.dataTableService.search
    }

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

        this.dataTableService.resetParams()

        if (this.autoReload && this._scheduledReload == null) {
            this.dataTableService.reloadItems();
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
        this.reloading = true;
        this.reload.emit(this._getRemoteParameters());
    }

    private _onReloadFinished(): void {
        this._updateDisplayParams();

        this._selectAllCheckbox = false;
        this.reloading = false;
    }

    _updateDisplayParams(): void {
        this.dataTableService.displayParams = {
            sortBy: this.sortBy,
            sortAsc: this.sortAsc,
            offset: this.offset,
            limit: this.limit,
            search: this.search
        };
    }

    // for avoiding cascading reloads if multiple params are set at once:
    _triggerReload(): void {
        this.dataTableService.triggerReload()
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

    // rowDoubleClicked(row: DataTableRowComponent, event: any): void {
    //     this.rowDoubleClick.emit({ row, event });
    // }

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

    // getRowColor(item: any, index: number, row: DataTableRowComponent): string {
    //     if (this.rowColors !== undefined) {
    //         return (this.rowColors as RowCallback)(item, row, index);
    //     }
    // }

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
            this.dataTableService.offset = 0;
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
