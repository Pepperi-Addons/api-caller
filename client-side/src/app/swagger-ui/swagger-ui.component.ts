import { Component, OnInit } from '@angular/core';
import { PepSessionService } from '@pepperi-addons/ngx-lib';
import SwaggerUI from 'swagger-ui';
import { AddonService } from '../addon/addon.service';

import { v4 as uuid } from 'uuid'

@Component({
  selector: 'app-swagger-ui',
  templateUrl: './swagger-ui.component.html',
  styleUrls: ['./swagger-ui.component.css']
})
export class SwaggerUiComponent implements OnInit {

    
    apiCallHistory: ApiCall[] = [];
    apiCallHistoryString: string = ''
    lastAction:string = '';

  constructor(
    public addonService: AddonService,
    public session:  PepSessionService,
  ) { }

  ngOnInit(): void {
    window['global'] = window;
    this.load().then(() => console.log("loaded"));
  }

  async load() {
    const spec = await this.addonService.getSpec();
        spec.servers = [{
            "url" : this.session.getPapiBaseUrl(),
            "description" : "Current Enviroment"
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
                return request;
            },
            responseInterceptor: (response)=> {
                const call: ApiCall = {
                    ActionUUID: this.lastAction,
                    URL: response.url,
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

export interface ApiCall {
    ActionUUID: string;
    URL?: string;
    Body?: any;
    Response?: any;
    Duration?: number;
    Status?: number;
    Error?: string;
}

