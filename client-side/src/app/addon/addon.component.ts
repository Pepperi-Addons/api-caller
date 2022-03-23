import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { KeyValuePair, PepLayoutService, PepScreenSizeType, PepSessionService } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';
import { AddonService } from "./addon.service";
import { ApiCall } from "../swagger-ui/swagger-ui.component";

@Component({
    selector: 'addon-module',
    templateUrl: './addon.component.html',
    styleUrls: ['./addon.component.scss']
})
export class AddonComponent implements OnInit {
    @Input() hostObject: any;
    
    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    
    screenSize: PepScreenSizeType;
    spec: any = undefined;
    collections: any[] = [];
    callHistory: ApiCall[] = []

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
        this.tabSelected(0);
    }

    async tabSelected(tab: number) {
        switch (tab) {
            case 0: {
                this.spec = await this.addonService.getSpec();
                break;
            } 
            case 1: {
                this.collections = await this.addonService.getCollections();
                break;
            }
            case 2: {
                this.callHistory = await this.addonService.getCallHistory();
                break;
            }
        }
    }

}
