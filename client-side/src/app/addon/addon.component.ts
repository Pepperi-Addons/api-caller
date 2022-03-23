import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { PepLayoutService, PepScreenSizeType, PepSessionService } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';
import SwaggerUI from 'swagger-ui';

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
            "description" : "Current Enviroment"
        }]            

        const node = document.getElementById('swagger-ui-item');
        console.log(node)
        const i = SwaggerUI({
            domNode: node,
            spec: spec
          });

          const token = this.session.getIdpToken();
          i.preauthorizeApiKey("bearerAuth", token);
    }
}
