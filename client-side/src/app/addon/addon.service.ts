import { Observable } from 'rxjs';
import jwt from 'jwt-decode';
import { PapiClient } from '@pepperi-addons/papi-sdk';
import { Injectable } from '@angular/core';

import { PepHttpService, PepSessionService } from '@pepperi-addons/ngx-lib';
import { ApiCall } from '../swagger-ui/swagger-ui.component';

export const CallsHistoryKey = 'UserCallHistory'
@Injectable({ providedIn: 'root' })
export class AddonService {

    accessToken = '';
    parsedToken: any
    papiBaseURL = ''
    addonUUID;

    get papiClient(): PapiClient {
        return new PapiClient({
            baseURL: this.papiBaseURL,
            token: this.session.getIdpToken(),
            addonUUID: this.addonUUID,
            suppressLogging:true
        })
    }

    constructor(
        public session:  PepSessionService,
        private pepHttp: PepHttpService
    ) {
        const accessToken = this.session.getIdpToken();
        this.parsedToken = jwt(accessToken);
        this.papiBaseURL = this.parsedToken["pepperi.baseurl"];
    }

    async get(endpoint: string): Promise<any> {
        return await this.papiClient.get(endpoint);
    }

    async post(endpoint: string, body: any): Promise<any> {
        return await this.papiClient.post(endpoint, body);
    }

    pepGet(endpoint: string): Observable<any> {
        return this.pepHttp.getPapiApiCall(endpoint);
    }

    pepPost(endpoint: string, body: any): Observable<any> {
        return this.pepHttp.postPapiApiCall(endpoint, body);

    }

    getSpec(): Promise<any> {
        return this.papiClient.addons.api.uuid("4fa8e62c-896a-4662-88b2-317d73d481d3").file('api').func('json_spec').get();
    }

    addCallHistory(call: ApiCall) {
        const history = this.getCallHistory();
        history.unshift(call);
        this.session.setObject<ApiCall[]>(CallsHistoryKey, history);
    }
    
    getCallHistory(params: any = {}): ApiCall[] {
        const history = this.session.getObject<ApiCall[]>(CallsHistoryKey);
        return history || []
    }

    getCollections(): Promise<any> {
        return this.papiClient.addons.api.uuid("4fa8e62c-896a-4662-88b2-317d73d481d3").file('api').func('api_collections').get();
    }
}
