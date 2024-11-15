import { Component, OnInit } from '@angular/core';
import { DataTableColumnDirective } from 'projects/data-table/src/public-api';
import { DataTableResource } from 'projects/data-table/src/public-api';
import persons from './data';

interface Person {
  name: string;
  email: string;
  jobTitle: string;
  active: boolean;
  phoneNumber: string;
  date: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  itemResource: DataTableResource<Person>;
  items: Person[] = [];
  itemCount = 0;

  norm = {
    description: 'Fellow Expandable'
  };

  constructor() {
    this.itemResource = new DataTableResource<Person>(persons);
  }

  async ngOnInit(): Promise<void> {
    this.itemCount = await this.itemResource.count();
  }

  rowCollapsed(row: { item: Person }): void {
    console.log(`${row.item.name} Collapsed`);
  }

  rowExpand(row: { item: Person }): void {
    console.log(`${row.item.name} Expanded`);
  }

  async reloadItems(params: any): Promise<void> {
    this.items = await this.itemResource.query(params);
  }

  rowClick(rowEvent: { row: { item: Person } }): void {
    // console.log('Clicked: ' + rowEvent.row.item.name);
  }

  rowDoubleClick(rowEvent: { row: { item: Person } }): void {
    // alert('Double clicked: ' + rowEvent.row.item.name);
  }

  rowTooltip(item: Person): string {
    return item.jobTitle;
  }
}