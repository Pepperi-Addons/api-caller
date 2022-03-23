import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { KeyValuePair, PepLayoutService, PepScreenSizeType, PepSessionService } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';
import SwaggerUI from 'swagger-ui';
import { v4 as uuid } from 'uuid'

import { AddonService } from "./addon.service";

@Component({
    selector: 'addon-module',
    templateUrl: './addon.component.html',
    styleUrls: ['./addon.component.scss']
})
export class AddonComponent implements OnInit {
    @Input() hostObject: any;
    
    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    
    screenSize: PepScreenSizeType;

    apiCallHistory: ApiCall[] = [];
    apiCallHistoryString: string = ''
    lastAction:string = '';

    constructor(
        public addonService: AddonService,
        public layoutService: PepLayoutService,
        public translate: TranslateService,
        public session:  PepSessionService,
    ) {
        
        this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        });
    }

    ngOnInit() {
        window['global'] = window;
        this.load().then(() => console.log("loaded"));
    }

    async load() {
        const spec = await this.addonService.getSpec();
        spec.servers = [{
            "url" : this.session.getPapiBaseUrl(),
            "description" : "Current Enviroment",
        }]            

        const node = document.getElementById('swagger-ui-item');
        console.log(node)
        const i = SwaggerUI({
            domNode: node,
            spec: spec,
            requestInterceptor: (request) => {
                this.lastAction = uuid();
                request.headers = {
                    ...request.headers,
                    "X-Pepperi-ActionID": this.lastAction,
                }
                this.apiCallHistory.push({
                    ActionUUID: this.lastAction,
                })
                return request;
            },
            responseInterceptor: (response)=> {
                let index = this.apiCallHistory.findIndex(call => call.ActionUUID == this.lastAction);
                const call: ApiCall = {
                    ActionUUID: this.lastAction,
                    URL: response.url,
                    Duration: response.duration,
                    Response: response.obj,
                    Status: response.status
                }
                this.apiCallHistory.splice(index, 1, call);
                console.log(response);
            },
          });

          const token = this.session.getIdpToken();
          i.preauthorizeApiKey("bearerAuth", token);
    }
}

export interface ApiCall {
    ActionUUID: string;
    URL?: string;
    Body?: any;
    Response?: any;
    Duration?: number;
    Status?: number;
    Error?: string;
}

