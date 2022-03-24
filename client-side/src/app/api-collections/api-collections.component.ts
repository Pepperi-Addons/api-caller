import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IPepGenericListActions, IPepGenericListDataSource } from '@pepperi-addons/ngx-composite-lib/generic-list';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { PepSelectionData } from '@pepperi-addons/ngx-lib/list';
import { AddonService } from '../addon/addon.service';
import { ApiCollectionFormComponent } from '../api-collection-form/api-collection-form.component';

@Component({
  selector: 'app-api-collections',
  templateUrl: './api-collections.component.html',
  styleUrls: ['./api-collections.component.css']
})
export class ApiCollectionsComponent implements OnInit, OnChanges {

  constructor(
    public addonService: AddonService,
    public dialogService: PepDialogService
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
            handler: async (obj) => {
              const key = obj.rows[0];
              if (key) {
                const collection = this.collections.find(c => c.Key == key);
                this.openForm(collection);
              }
            }
          });
          actions.push({
              title: 'Delete',
              handler: async (obj) => {
                const key = obj.rows[0];
                if (key) {
                  const collection = this.collections.find(c => c.Key == key);
                  if (collection) {
                    collection.Hidden = true;
                    await this.addonService.updateCollection(collection);
                    await this.reload();
                  }
                }
              }
          })
          actions.push({
            title: 'Export Specification',
            handler: async (obj) => {
              const key = obj.rows[0];
              if (key) {
                const collection = this.collections.find(c => c.Key == key);
                if (collection) {
                  const filename = collection.Name + '.json';
                  const blob = new Blob([JSON.stringify(collection.Spec)], {type: 'text/json'});
                  if((window.navigator as any).msSaveOrOpenBlob) {
                    (window.navigator as any).msSaveBlob(blob, filename);
                  }
                  else{
                      const elem = window.document.createElement('a');
                      elem.href = window.URL.createObjectURL(blob);
                      elem.download = filename;        
                      document.body.appendChild(elem);
                      elem.click();        
                      document.body.removeChild(elem);
                  }
              }
            }
          }
        });

        actions.push({
          title: 'Import Specification',
          handler: async (obj) => {
            const key = obj.rows[0];
            if (key) {
              const collection = this.collections.find(c => c.Key == key);
              if (collection) {
                const elem = window.document.createElement('input');
                elem.setAttribute("type", "file");
                elem.click();
                elem.onchange = async (e) => {
                  const file = elem.files[0]; 
                  if (file) {
                    const spec = await file.text();
                    if (spec) {
                      collection.Spec = JSON.parse(spec);
                      await this.addonService.updateCollection(collection);
                      await this.reload()
                    }
                  }
                }
            }
          }
        }
      });
        return actions;
      }
    }
  }

  getCollectionsOptions(params: any) {
    const options: any = {};

    // this doesn't work
    // if (params.searchString) {
    //   options.where = `Name LIKE '%${params.searchString}'`
    // }

    return options;
  }

  getDataSource(): IPepGenericListDataSource {
    return {

      init: async(params:any) => {
        console.log('init list', params);
        let collections = await this.addonService.getCollections(this.getCollectionsOptions(params));

        if (params.searchString) {
          collections = collections.filter(c => c.Name.toLowerCase().indexOf(params.searchString.toLowerCase()) > -1);
        }

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
                    {
                      FieldID: 'ModificationDateTime',
                      Type: 'DateAndTime',
                      Title: 'Last Modified',
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
                    },
                    {
                      Width: 20
                  },
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
    };
  }

  ngOnInit(): void {
  }

  createCollection() {
    this.openForm(undefined);
  }

  async reload() {
    this.dataSource = this.getDataSource();
  }

  openForm(collection: any) {
    const config = this.dialogService.getDialogConfig({}, 'inline');
      const formData = {
        collection: collection
      }
      config.data = new PepDialogData({
          content: ApiCollectionFormComponent
      })
      this.dialogService.openDialog(ApiCollectionFormComponent, formData, config).afterClosed().subscribe(async (value) => {
          if (value) {
              console.log('value got:', value);
              await this.addonService.updateCollection(value);
              await this.reload();
          }
      });
    }
}
