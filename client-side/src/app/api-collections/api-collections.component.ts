import { Component, OnInit } from '@angular/core';
import { IPepGenericListActions, IPepGenericListDataSource } from '@pepperi-addons/ngx-composite-lib/generic-list';
import { PepSelectionData } from '@pepperi-addons/ngx-lib/list';

@Component({
  selector: 'app-api-collections',
  templateUrl: './api-collections.component.html',
  styleUrls: ['./api-collections.component.css']
})
export class ApiCollectionsComponent implements OnInit {

  constructor() { }

  dataSource: IPepGenericListDataSource = {

    init: async(params:any) => {
      console.log('init list');
      let collections = [
        {
          "Key": "1",
          "Name": "Collection 1",
          "Description": "Collection 1 Description",
          "Spec": {

          }
        }
      ];
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
          totalCount: collections.length,
          items: collections
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
  }

  actions: IPepGenericListActions = {
    get: async (data: PepSelectionData) => {
        const actions = [];
        if (data && data.rows.length == 1) {
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

  ngOnInit(): void {
  }

  createCollection() {
  }
}
