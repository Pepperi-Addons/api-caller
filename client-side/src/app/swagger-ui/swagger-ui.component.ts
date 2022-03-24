import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { PepSessionService } from '@pepperi-addons/ngx-lib';
import SwaggerUI from 'swagger-ui';
import { AddonService } from '../addon/addon.service';

import { v4 as uuid } from 'uuid'

@Component({
  selector: 'app-swagger-ui',
  templateUrl: './swagger-ui.component.html',
  styleUrls: ['./swagger-ui.component.scss']
})
export class SwaggerUiComponent implements OnInit, OnChanges {

    lastCall: ApiCall;;

  constructor(
    public addonService: AddonService,
    public session:  PepSessionService,
  ) { }

  @Input() 
  spec: any = undefined;

  ngOnInit(): void {
    window['global'] = window;
    this.load().then(() => console.log("loaded"));
  }

  ngOnChanges() {
    console.log("spec changed");
    this.load().then(() => console.log("loaded"));
  }

  async load() {
    if (this.spec) {
        this.spec.servers = [{
            "url" : this.session.getPapiBaseUrl()
        }]  
        this.spec.security = [{bearerAuth: []}] 
        this.spec.components = {securitySchemes: {bearerAuth: {type: "http", scheme: "bearer", bearerFormat: "JWT"}}}         

        const node = document.getElementById('swagger-ui-item');
        const i = SwaggerUI({
            domNode: node,
            spec: this.spec,
            filter: true,
            requestInterceptor: (request) => {
                this.lastCall = { 
                    ActionUUID: uuid(),
                    Body: request.body,
                    URL: request.url.replace(this.session.getPapiBaseUrl(), ""),
                    Method: request.method,
                    Timestamp: new Date()
                }
                request.headers = {
                    ...request.headers,
                    "X-Pepperi-ActionID": this.lastCall.ActionUUID,
                }
                return request;
            },
            responseInterceptor: (response)=> {
                if (response.body.ExecutionUUID) {
                    this.lastCall.ActionUUID = response.body.ExecutionUUID;
                }
                const call: ApiCall = {
                    ...this.lastCall,
                    Response: response.obj,
                    Success: response.status === 200
                }
                this.addonService.addCallHistory(call);
            },
            plugins: [
              () => {
                return {
                  wrapComponents: {
                    curl: () => () => null,
                    info: () => () => null,
                    authorizeBtn: () => () => null,
                    ServersContainer: () => () => null,
                  }
                }
              }
            ]
          });

          const token = this.session.getIdpToken();
          i.preauthorizeApiKey("bearerAuth", token);
    }
  }

}

export interface ApiCall {
    ActionUUID: string;
    URL: string;
    Body?: any;
    Response?: any;
    Success?: boolean;
    Error?: string;
    Method: string;
    Timestamp: Date;
}

