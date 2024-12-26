import { EventEmitter, Injectable, QueryList, TemplateRef } from "@angular/core";
import { DataTableParams, RowCallback } from "../components/types";

@Injectable({
    providedIn: "root"
})
export class DataTableService {
    expandableRows: boolean = false;
    selectOnRowClick: boolean = false;
    expandColumnVisible: boolean;
    indexColumnVisible: boolean;
    selectColumnVisible: boolean;
    pagination = true;
    displayParams = {} as DataTableParams;

    rows: QueryList<any>;
    columns: QueryList<any>;
    expandTemplate: TemplateRef<any>;

    rowDoubleClick = new EventEmitter();
    rowClick = new EventEmitter();
    rowCollapsed = new EventEmitter();
    rowExpanded = new EventEmitter();

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
    
}