import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { PepLayoutService, PepScreenSizeType, PepSessionService } from '@pepperi-addons/ngx-lib';
import { TranslateService } from '@ngx-translate/core';
import SwaggerUI from 'swagger-ui';

import { AddonService } from "./addon.service";

const spec = {
    "openapi" : "3.0.0",
    "security" : [ {
      "bearerAuth" : [ ]
    } ],
    "paths" : {
      "/accounts" : {
        "get" : {
          "summary" : "accouts",
          "description" : "This is an endpoint to retreive all account in Pepperi's system",
          "parameters" : [ {
            "name" : "Fields",
            "in" : "query",
            "description" : "List of fields (comma seperated) to retrieve from the object",
            "schema" : {
              "type" : "string"
            }
          }, {
            "name" : "page",
            "in" : "query",
            "description" : "page number to retrieve (zero based)",
            "schema" : {
              "type" : "integer",
              "minimum" : 0
            }
          }, {
            "name" : "page_size",
            "in" : "query",
            "description" : "number of items each page contains",
            "schema" : {
              "type" : "integer",
              "minimum" : -1
            }
          } ],
          "responses" : {
            "200" : {
              "description" : "OK"
            }
          }
        }
      },
      "/meta_data/data_views" : {
        "get" : {
          "summary" : "Data Views",
          "description" : "This is an endpoint to retreive all Data Views in Pepperi's system",
          "parameters" : [ {
            "name" : "Fields",
            "in" : "query",
            "description" : "List of fields (comma seperated) to retrieve from the object",
            "schema" : {
              "type" : "string"
            }
          },
          {
            "name" : "where",
            "in" : "query",
            "description" : "filter",
            "schema" : {
              "type" : "string"
            }
          }],
          "responses" : {
            "200" : {
              "description" : "OK"
            }
          }
        }
      },
      "/ping" : {
        "get" : {
          "summary" : "Server heartbeat operation",
          "description" : "This operation shows how to override the global security defined above, as we want to open it up for all users.",
          "security" : [ ],
          "responses" : {
            "200" : {
              "description" : "OK"
            }
          }
        }
      }
    },
    "components" : {
      "securitySchemes" : {
        "bearerAuth" : {
          "type" : "http",
          "scheme" : "bearer",
          "bearerFormat" : "JWT"
        }
      }
    },
    "info" : {
      "title" : "PAPI",
      "description" : "Aplication contains a list of all Pepperi's API endpoints",
      "version" : "1.0.0",
      "contact" : {
        "name" : "Pepperi",
        "email" : "support@pepperi.com",
        "url" : "https://www.pepperi.com/contact-sales/"
      }
    },
    "servers" : [],
    "tags" : [ {
      "description" : "Pepperi's accounts endpoints",
      "name" : "Accounts"
    } ]
  }

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

    openDialog() {
        
    }
}
