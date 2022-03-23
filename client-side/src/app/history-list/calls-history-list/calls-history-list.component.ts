import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AddonService } from '../../addon/addon.service';

import { IPepGenericListActions, IPepGenericListDataSource, IPepGenericListPager, PepGenericListService } from "@pepperi-addons/ngx-composite-lib/generic-list";

import { PepSelectionData } from "@pepperi-addons/ngx-lib/list";
import { PepMenuItem } from "@pepperi-addons/ngx-lib/menu";
import { PepDialogData, PepDialogService } from "@pepperi-addons/ngx-lib/dialog";
import { ApiCall } from 'src/app/swagger-ui/swagger-ui.component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-calls-history-list',
  templateUrl: './calls-history-list.component.html',
  styleUrls: ['./calls-history-list.component.scss']
})
export class CallsHistoryListComponent implements OnInit, OnChanges {

    @Input() history: ApiCall[] = [];
    dataSource:IPepGenericListDataSource = this.getDataSource();

    
    @ViewChild('response', { read: TemplateRef }) responseTemplate: TemplateRef<any>;
    @ViewChild('body', { read: TemplateRef }) bodyTemplate: TemplateRef<any>;
    
    dialogRef: MatDialogRef<CallsHistoryListComponent>

    callResponse: string;
    callBody: string;

    constructor(public translate: TranslateService,
                public addonService: AddonService,
                public dialogService: PepDialogService,
                public genericListService: PepGenericListService,
                ) { }


    ngOnChanges(changes: SimpleChanges): void {
        this.dataSource = this.getDataSource();
        
    }

    ngOnInit(): void {
    }

    getDataSource() {
        return {
            init: async(params:any) => {
                return Promise.resolve({
                    dataView: {
                        Context: {
                            Name: '',
                            Profile: { InternalID: 0 },
                            ScreenSize: 'Landscape'
                        },
                        Type: 'Grid',
                        Title: 'User Call Histort',
                        Fields: [
                            {
                                FieldID: 'ActionUUID',
                                Type: 'TextBox',
                                Title: this.translate.instant('Action ID'),
                                Mandatory: false,
                                ReadOnly: true
                            },
                            {
                                FieldID: 'Timestamp',
                                Type: 'TextBox',
                                Title: this.translate.instant('Timestamp'),
                                Mandatory: false,
                                ReadOnly: true
                            },
                            {
                                FieldID: 'URL',
                                Type: 'TextBox',
                                Title: this.translate.instant('Url'),
                                Mandatory: false,
                                ReadOnly: true
                            },
                            {
                                FieldID: 'Method',
                                Type: 'TextBox',
                                Title: this.translate.instant('Method'),
                                Mandatory: false,
                                ReadOnly: true
                            },
                            {
                                FieldID: 'Status',
                                Type: 'TextBox',
                                Title: this.translate.instant('Response Status'),
                                Mandatory: false,
                                ReadOnly: true
                            },
                        ],
                        Columns: [
                            {
                                Width: 25
                            },
                            {
                                Width: 25
                            },
                            {
                                Width: 25
                            },
                            {
                                Width: 25
                            },
                            {
                                Width: 25
                            },
                        ],
          
                        FrozenColumnsCount: 0,
                        MinimumColumnWidth: 0
                    },
                    totalCount: this.history.length,
                    items: this.history
                });
            },
            inputs: () => {
                return Promise.resolve({
                    pager: {
                        type: 'scroll'
                    },
                    selectionType: 'single',
                    noDataFoundMsg: this.translate.instant('History_List_NoDataFound')
                });
            },
        } as IPepGenericListDataSource
    }

    actions: IPepGenericListActions = {
        get: async (data: PepSelectionData) => {
            const actions = [];
            if (data && data.rows.length == 1) {
                const itemKey = data.rows[0];
                const rowData = this.history.find(item => item.ActionUUID === itemKey);
                actions.push({
                    title: this.translate.instant('Logs'),
                    handler: async (objs) => {
                        this.openLogsPopup(objs.rows[0]);
                    }
                },
                {
                    title: this.translate.instant('Response.Body'),
                    handler: async (objs) => {
                        this.callResponse = rowData.Response;
                        this.dialogService.openDialog(this.responseTemplate, undefined);
                    }
                });
                if (rowData && rowData.Body) {
                    actions.push(
                        {
                            title: this.translate.instant('Request.Body'),
                            handler: async (objs) => {
                                this.callBody = JSON.parse(rowData.Body);
                                this.dialogService.openDialog(this.bodyTemplate, undefined);
                            
                            },
                        }
                    )
                }
            }
            return actions;
        }
    }

    openLogsPopup(actionID: string) {
        console.log('showing logs for action:', actionID);
    }

}
