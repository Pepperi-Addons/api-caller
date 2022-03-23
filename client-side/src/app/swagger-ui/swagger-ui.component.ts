import { Component, OnInit } from '@angular/core';
import { PepSessionService } from '@pepperi-addons/ngx-lib';
import SwaggerUI from 'swagger-ui';
import { AddonService } from '../addon/addon.service';

@Component({
  selector: 'app-swagger-ui',
  templateUrl: './swagger-ui.component.html',
  styleUrls: ['./swagger-ui.component.css']
})
export class SwaggerUiComponent implements OnInit {

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
            spec: spec
          });

          const token = this.session.getIdpToken();
          i.preauthorizeApiKey("bearerAuth", token);
  }

}
