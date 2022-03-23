import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IPepGenericListActions, IPepGenericListDataSource } from '@pepperi-addons/ngx-composite-lib/generic-list';
import { PepSelectionData } from '@pepperi-addons/ngx-lib/list';
import { AddonService } from '../addon/addon.service';

@Component({
  selector: 'app-api-collections',
  templateUrl: './api-collections.component.html',
  styleUrls: ['./api-collections.component.css']
})
export class ApiCollectionsComponent implements OnInit, OnChanges {

  constructor(
    public addonService: AddonService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("collections changed");
    if (this.collections) {
      this.dataSource = this.getDataSource()
    }
  }

  edit: boolean = false;
  collection: any = undefined;

  @Input()
  collections: any[] = [];

  dataSource: IPepGenericListDataSource | undefined = undefined; 

  actions: IPepGenericListActions = {
    get: async (data: PepSelectionData) => {
        const actions = [];
        if (data && data.rows.length == 1) {
          actions.push({
            title: 'Show',
            handler: async (obj: PepSelectionData) => {
              const key = obj.rows[0];
              if (key) {
                this.collection = this.collections.find(c => c.Key == key);
                if (this.collection) {
                  this.edit = true;
                }
              }
            }
          });
          actions.push({
            title: 'Edit',
            handler: async (objs) => {
                
            }
          });
          actions.push({
              title: 'Delete',
              handler: async (objs) => {
                  
              }
          })
        return actions;
      }
    }
  }

  getDataSource(): IPepGenericListDataSource {
    return {

      init: async(params:any) => {
        console.log('init list');
        return Promise.resolve({
            dataView: {
                Context: {
                    Name: '',
                    Profile: { InternalID: 0 },
                    ScreenSize: 'Landscape'
                },
                Type: 'Grid',
                Title: '',
                Fields: [
                    {
                        FieldID: 'Name',
                        Type: 'TextBox',
                        Title: 'Name',
                        Mandatory: false,
                        ReadOnly: true
                    },
                    {
                        FieldID: 'Description',
                        Type: 'TextBox',
                        Title: 'Description',
                        Mandatory: false,
                        ReadOnly: true
                    },
                ],
                Columns: [
                    {
                        Width: 20
                    },
                    {
                        Width: 50
                    }
                ],
  
                FrozenColumnsCount: 0,
                MinimumColumnWidth: 0
            },
            totalCount: this.collections.length,
            items: this.collections
        });
    },
    inputs: () => {
        return Promise.resolve({
            pager: {
                type: 'scroll'
            },
            selectionType: 'single'
        });
    },
    };
  }

  ngOnInit(): void {
  }

  createCollection() {
  }
}
