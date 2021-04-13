import { DataTableRowComponent } from './row/row.component';
import { DataTableColumnDirective } from './column/column.component';


export type RowCallback = (item: any, row: DataTableRowComponent, index: number) => string;

export type CellCallback = (item: any, row: DataTableRowComponent, column: DataTableColumnDirective, index: number) => string;

// export type HeaderCallback = (column: DataTableColumn) => string;


export interface DataTableTranslations {
    indexColumn: string;
    selectColumn: string;
    expandColumn: string;
    paginationLimit: string;
    paginationRange: string;
}

export const defaultTranslations = {
    indexColumn: 'index',
    selectColumn: 'select',
    expandColumn: 'expand',
    paginationLimit: 'Limit',
    paginationRange: 'Results'
} as DataTableTranslations;

export interface SearchParam {
    column: string;
    term: string;
}

export interface DataTableParams {
    offset?: number;
    limit?: number;
    sortBy?: string;
    sortAsc?: boolean;
    search?: SearchParam[];
}
