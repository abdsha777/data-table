import { DataTableRowComponent } from './row/row.component';
import { DataTableColumnDirective } from './column/column.component';
import { Injectable } from '@angular/core';

export interface DataTableItem {
  [key: string]: any;
}

export type RowCallback<T = DataTableItem> = (
  item: T, 
  row: DataTableRowComponent, 
  index: number
) => string;

export type CellCallback<T = DataTableItem> = (
  item: T, 
  row: DataTableRowComponent, 
  column: DataTableColumnDirective, 
  index: number
) => string;

export interface DataTableTranslations {
  indexColumn: string;
  selectColumn: string;
  expandColumn: string;
  paginationLimit: string;
  paginationRange: string;
}

export const defaultTranslations: Readonly<DataTableTranslations> = {
  indexColumn: 'index',
  selectColumn: 'select',
  expandColumn: 'expand',
  paginationLimit: 'Limit',
  paginationRange: 'Results'
};

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

@Injectable({
  providedIn: 'root'
})
export class DataTableResource<T extends DataTableItem> {
  constructor(private items: T[]) {}

  async query(
    params: DataTableParams, 
    filter?: (item: T, index: number, items: T[]) => boolean
  ): Promise<T[]> {
    let result = filter ? 
      this.items.filter(filter) : 
      [...this.items];

    if (params.sortBy) {
      result.sort((a, b) => {
        const aVal = a[params.sortBy!];
        const bVal = b[params.sortBy!];
        
        if (typeof aVal === 'string') {
          return aVal.localeCompare(bVal);
        }
        return aVal - bVal;
      });

      if (params.sortAsc === false) {
        result.reverse();
      }
    }

    if (params.offset !== undefined) {
      const end = params.limit !== undefined ? 
        params.offset + params.limit : 
        result.length;
      result = result.slice(params.offset, end);
    }

    return result;
  }

  async count(): Promise<number> {
    return this.items.length;
  }
}