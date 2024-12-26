import { Component } from '@angular/core';
import { DataTableColumnDirective } from 'data-table';
import { DataTableResource } from 'projects/data-table/src/public-api';
import persons from './data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  itemResource = new DataTableResource(persons);
  items: any = [];
  itemCount = 0;

    norm: any = {
        description: 'Fellow Expandable'
    };

    rowCollapsed(row): void {
        console.log(row.item.name + ' Collapsed');
    }

    rowExpand(row): void {

        console.log(row.item.name + ' Expanded');
    }
  constructor() {
      this.itemResource.count().then(
        (count: any) => this.itemCount = count
      );
  }

  reloadItems(params: any): void {
      console.log(params);
      this.itemResource.query(params).then((items: any) => this.items = items);
  }

  // special properties:

  rowClick(rowEvent: any): void {
    //   console.log('Clicked: ' + rowEvent.row.item.name);
  }

  rowDoubleClick(rowEvent: any): void {
      alert('Double clicked: ' + rowEvent.row.item.name);
  }

  rowTooltip(item: any): any{ return item.jobTitle; }

}
