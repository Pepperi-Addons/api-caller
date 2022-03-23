import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { PepSessionService } from '@pepperi-addons/ngx-lib';
import SwaggerUI from 'swagger-ui';
import { AddonService } from '../addon/addon.service';

import { v4 as uuid } from 'uuid'

@Component({
  selector: 'app-swagger-ui',
  templateUrl: './swagger-ui.component.html',
  styleUrls: ['./swagger-ui.component.css']
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
            "url" : this.session.getPapiBaseUrl(),
            "description" : "Current Enviroment"
        }]  
        this.spec.security = [{bearerAuth: []}] 
        this.spec.components = {securitySchemes: {bearerAuth: {type: "http", scheme: "bearer", bearerFormat: "JWT"}}}         

        const node = document.getElementById('swagger-ui-item');
        console.log(node)
        const i = SwaggerUI({
            domNode: node,
            spec: this.spec,
            requestInterceptor: (request) => {
                console.log(request);
                this.lastCall = { 
                    ActionUUID: uuid(),
                    Body: request.body,
                    URL: request.url,
                    Method: request.method
                }
                request.headers = {
                    ...request.headers,
                    "X-Pepperi-ActionID": this.lastCall.ActionUUID,
                }
                return request;
            },
            responseInterceptor: (response)=> {
                const call: ApiCall = {
                    ...this.lastCall,
                    Duration: response.duration,
                    Response: response.obj,
                    Status: response.status
                }
                this.addonService.addCallHistory(call);
                console.log(response);
            },
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
    Duration?: number;
    Status?: number;
    Error?: string;
    Method: string;
}

