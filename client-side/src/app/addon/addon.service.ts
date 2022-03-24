import { Observable } from 'rxjs';
import jwt from 'jwt-decode';
import { PapiClient } from '@pepperi-addons/papi-sdk';
import { Injectable } from '@angular/core';

import { PepHttpService, PepSessionService } from '@pepperi-addons/ngx-lib';
import { ApiCall } from '../swagger-ui/swagger-ui.component';

import { v4 as uuid } from 'uuid';

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

    clearCallHistory() {
        this.session.removeObject(CallsHistoryKey);
    }

    getCollections(options: any = undefined): Promise<any> {
        return this.papiClient.addons.api.uuid("4fa8e62c-896a-4662-88b2-317d73d481d3").file('api').func('api_collections').get(options);
    }
    
    async getCloudWatchLogs(actionID: string, timeStamp: Date, searchString: string): Promise<any> {
        return await this.papiClient.addons.api.uuid("4fa8e62c-896a-4662-88b2-317d73d481d3").file('api').func('logs').get({
            ActionUUID: actionID,
            TimeStamp: timeStamp,
            SearchString: searchString
        });
    }

    updateCollection(collection: any): Promise<any> {
        return this.papiClient.addons.api.uuid("4fa8e62c-896a-4662-88b2-317d73d481d3").file('api').func('api_collections').post({}, collection);
    }

    async makeApiCall(data: ApiCall): Promise<any> {
        return new Promise(async (resolve, reject)=> {
            let value;
            const call: ApiCall = {
                ActionUUID: uuid(),
                URL: data.URL,
                Method: data.Method,
                Timestamp: new Date(),
                Body: data.Body,
            }
            try {
                if (data.Method === 'GET') {
                    value = await this.papiClient.get(data.URL);
                }
                else if(data.Method === 'POST') {
                    value = await this.papiClient.post(data.URL, data.Body);
                }
                call.Response = value;  
                call.Success = true;  
                resolve(value);
            }
            catch (error) {
                call.Response = error.message;
                call.Success = false;
                reject(error);
            }
            finally {
                this.addCallHistory(call);
            }
        })
    }
}
