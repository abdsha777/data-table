import { EventEmitter, Injectable, QueryList, TemplateRef } from "@angular/core";
import { DataTableParams, DataTableTranslations, defaultTranslations, RowCallback, SearchParam } from "../components/types";

@Injectable({
    providedIn: "root"
})
export class DataTableService {
    expandableRows: boolean = false;
    selectOnRowClick: boolean = false;
    expandColumnVisible: boolean;
    indexColumn = true;
    indexColumnVisible: boolean;
    selectColumn = true;
    selectColumnVisible: boolean;
    pagination = true;
    displayParams = {} as DataTableParams;
    reloading = false;
    search: SearchParam[] = [];
    sortBy: string;
    sortAsc = true;
    headerTitle: string;
    itemCount: number
    _offset = 0;
    get offset(){
        return this._offset;
    }
    set offset(val){
        this._offset = val
        this.triggerReload()
    }
    _limit = 10;

    get limit(){
        return this._limit
    }
    set limit(val){
        this._limit = val
        this.triggerReload()
    }
    rows: QueryList<any>;
    columns: QueryList<any>;
    expandTemplate: TemplateRef<any>;

    rowDoubleClick = new EventEmitter();
    rowClick = new EventEmitter();
    rowCollapsed = new EventEmitter();
    rowExpanded = new EventEmitter();
    reload = new EventEmitter()

    translations: DataTableTranslations = defaultTranslations

    get page(): number {
        return Math.floor(this.offset / this.limit) + 1;
    }

    set page(value) {
        this.offset = (value - 1) * this.limit;
    }

    get lastPage(): number {
        return Math.ceil(this.itemCount / this.limit);
    }

    rowTooltip: RowCallback;

    rowDoubleClicked(row: any, event: any): void {
        this.rowDoubleClick.emit({ row, event });
    }

    rowClicked(row: any, event: any): void {
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
    
    reloadItems(): void {
        this.reloading = true;
        this.reload.emit(this._getRemoteParameters());
    }

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

    _scheduledReload: number | null = null;
    triggerReload(): void {
        if (this._scheduledReload) {
            clearTimeout(this._scheduledReload);
        }
        this._scheduledReload = setTimeout(() => {
            this.reloadItems();
        });
    }
}