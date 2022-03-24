import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AddonService } from '../../addon/addon.service';

import { IPepGenericListActions, IPepGenericListDataSource, PepGenericListService, IPepGenericListTableInputs } from "@pepperi-addons/ngx-composite-lib/generic-list";

import { PepSelectionData } from "@pepperi-addons/ngx-lib/list";
import { PepDialogData, PepDialogService } from "@pepperi-addons/ngx-lib/dialog";
import { ApiCall } from 'src/app/swagger-ui/swagger-ui.component';
import { MatDialogRef } from '@angular/material/dialog';
import { PepCustomizationService } from '@pepperi-addons/ngx-lib';
import { isThisTypeNode } from 'typescript';

@Component({
  selector: 'app-calls-history-list',
  templateUrl: './calls-history-list.component.html',
  styleUrls: ['./calls-history-list.component.scss']
})
export class CallsHistoryListComponent implements OnInit, OnChanges {

    @Input() history: ApiCall[] = [];
    logs: any = undefined;
    dataSource:IPepGenericListDataSource = this.getDataSource();
    logsDataSource:IPepGenericListDataSource;

    
    @ViewChild('response', { read: TemplateRef }) responseTemplate: TemplateRef<any>;
    @ViewChild('body', { read: TemplateRef }) bodyTemplate: TemplateRef<any>;
    @ViewChild('reRun', { read: TemplateRef }) reRunTemplate: TemplateRef<any>;
    
    dialogRef: MatDialogRef<CallsHistoryListComponent>

    callResponse: string;
    callBody: string;
    reRunResponse: string;
    actionID: string;

    constructor(public translate: TranslateService,
                public addonService: AddonService,
                public dialogService: PepDialogService,
                public genericListService: PepGenericListService,
                public customizationService: PepCustomizationService
                ) { }


    ngOnChanges(changes: SimpleChanges): void {
        this.dataSource = this.getDataSource();
        
    }

    ngOnInit(): void {
    }

    getDataSource() {
        return {
            init: async(params:any) => {
                this.history = this.addonService.getCallHistory(params);
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
                                Type: 'DateAndTime',
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
                                FieldID: 'Success',
                                Type: 'ComboBox',
                                Title: this.translate.instant('Successful'),
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

    getLogsDataSource() {
        return {
            init: async(params:any) => {
                const rowData: ApiCall = this.getSelectedRowData();
                this.logs = await this.addonService.getCloudWatchLogs(this.actionID, rowData.Timestamp, params.searchString);
                return Promise.resolve({
                    dataView: {
                        Context: {
                            Name: '',
                            Profile: { InternalID: 0 },
                            ScreenSize: 'Landscape'
                        },
                        Type: 'Grid',
                        Title: 'Call logs',
                        Fields: [
                            {
                                FieldID: 'Message',
                                Type: 'TextBox',
                                Title: this.translate.instant('Message'),
                                Mandatory: false,
                                ReadOnly: true
                            },
                            {
                                FieldID: 'DateTimeStamp',
                                Type: 'DateAndTime',
                                Title: this.translate.instant('Timestamp'),
                                Mandatory: false,
                                ReadOnly: true
                            },
                            {
                                FieldID: 'Level',
                                Type: 'TextBox',
                                Title: this.translate.instant('Level'),
                                Mandatory: false,
                                ReadOnly: true
                            },
                        ],
                        Columns: [
                            {
                                Width: 80
                            },
                            {
                                Width: 10
                            },
                            {
                                Width: 10
                            },
                        ],
          
                        FrozenColumnsCount: 0,
                        MinimumColumnWidth: 0
                    },
                    totalCount: this.logs.length,
                    items: this.logs
                });
            },
            inputs: () => {
                
                return Promise.resolve({
                    pager: {
                        type: 'pages',
                        size: 11
                        
                    },
                    selectionType: 'none',
                    noDataFoundMsg: this.translate.instant('Logs_List_NoDataFound')
                });
            },
        } as IPepGenericListDataSource
    }

    actions: IPepGenericListActions = {
        get: async (data: PepSelectionData) => {
            const actions = [];
            if (data && data.rows.length == 1) {
                this.actionID = data.rows[0];
                const rowData = this.getSelectedRowData();
                actions.push({
                    title: this.translate.instant('Logs'),
                    handler: async (objs) => {
                        this.getLogs();
                    }
                },
                {
                    title: this.translate.instant('Response.Body'),
                    handler: async (objs) => {
                        this.callResponse = rowData.Response;
                        this.dialogService.openDialog(this.responseTemplate, undefined);
                    }
                },
                {
                    title: this.translate.instant('Run Again'),
                    handler: async (objs) => {
                        this.makeApiCall(rowData);
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

    async getLogs() {
        this.logs = [];
        this.logsDataSource = this.getLogsDataSource();
    }

    getSelectedRowData(): ApiCall {
        return this.history.find(item => item.ActionUUID === this.actionID);
    }

    makeApiCall(data: ApiCall) {
        const dataMsg = new PepDialogData({
            title: this.translate.instant('History_ReRun_Dialog_Title'),
            actionsType: 'close'
        });
        this.addonService.makeApiCall(data).then((value)=> {
            //dataMsg.content = this.translate.instant('History_ReRun_Success_Content', {response: JSON.stringify(value)})
            this.reRunResponse = value;
            this.dialogService.openDialog(this.reRunTemplate, undefined).afterClosed().subscribe(() => {
                this.history = [];
                this.dataSource = this.getDataSource();
            });
        }).catch((error) => {
            dataMsg.content = this.translate.instant('History_ReRun_Failed_Content', {error: error})
            this.dialogService.openDefaultDialog(dataMsg).afterClosed().subscribe(() => {
                this.history = [];
                this.dataSource = this.getDataSource();
            })
        });
    }

    clearCallHistory() {
        this.history = [];
        this.addonService.clearCallHistory();
        this.dataSource = this.getDataSource();
    }
}
