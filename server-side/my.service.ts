import { PapiClient, InstalledAddon } from '@pepperi-addons/papi-sdk'
import { Client } from '@pepperi-addons/debug-server';
import spec from './spec.json';
import {v4 as uuid} from 'uuid';

class MyService {

    papiClient: PapiClient
    addonUUID: string

    constructor(private client: Client) {
        this.addonUUID = client.AddonUUID;
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            addonUUID: client.AddonUUID,
            addonSecretKey: client.AddonSecretKey,
            actionUUID: client.AddonUUID
        });
    }

    async getSpec(): Promise<any> {
        const res: any = spec;
        await this.updateSpec(res);

        const relations = await this.papiClient.addons.data.relations.find({
            where: "RelationName='OpenAPISpec'"
        });

        await Promise.all(relations.map(async relation => {
            try {
                if (relation.AddonRelativeURL) {
                    const additionalSpec = await this.papiClient.get(`/addons/api/${relation.AddonUUID}/${relation.AddonRelativeURL}`);

                    if (additionalSpec.paths) {
                        for (const path in additionalSpec.paths) {
                            res.paths[`/addons/api/${relation.AddonUUID}${path}`] = additionalSpec.paths[path];   
                        }
                    }
                    
                    if (additionalSpec.tags) {
                        res.tags = [
                            ...res.tags,
                            ...additionalSpec.tags
                        ]
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        }));

        return res;
    }

    async updateSpec(spec: any) {
        let [accountFields, activityFields, transactionFields] = (await Promise.all([
            await this.papiClient.metaData.type('accounts').fields.get(),
            await this.papiClient.metaData.type('activities').fields.get(),
            await this.papiClient.metaData.type('transactions').fields.get(),
        ])).map(fields => fields.map(field => field.FieldID));

        activityFields = activityFields.concat(accountFields.map(field => `Account.${field}`));
        transactionFields = transactionFields.concat(accountFields.map(field => `Account.${field}`));

        const accountsFieldsParam = spec.paths['/accounts'].get.parameters.find(p => p.name === 'fields');
        if (accountsFieldsParam) {
            accountsFieldsParam.schema.items.enum = accountFields;
        }

        const activitiesFieldsParam = spec.paths['/activities'].get.parameters.find(p => p.name === 'fields');
        if (activitiesFieldsParam) {
            activitiesFieldsParam.schema.items.enum = activityFields;
        }

        const transactionFieldsParam = spec.paths['/transactions'].get.parameters.find(p => p.name === 'fields');
        if (transactionFieldsParam) {
            transactionFieldsParam.schema.items.enum = transactionFields;
        }
    }

    async createTables(): Promise<any> {
        await this.papiClient.addons.data.schemes.post({
            Name: 'api_collections',
            Type: 'meta_data',
            Fields: {
                Name: {
                    Type: 'String',
                },
                Description: {
                    Type: 'String',
                }
            }
        });
    }

    async createRelations(): Promise<any> {
        await this.papiClient.addons.data.relations.upsert({
            Type: 'AddonAPI',
            Name: 'OpenAPISpec',
            RelationName: 'OpenAPISpec',
            AddonUUID: this.addonUUID,
            AddonRelativeURL: 'api/openapi_spec'
        })
    }

    async getAPICollections(options: any): Promise<any> {
        return this.papiClient.addons.data.uuid(this.addonUUID).table('api_collections').find(options);
    }

    async upsertAPICollection(collection: any): Promise<any> {
        if (!collection.Key) {
            collection.Key = uuid();
        }

        return this.papiClient.addons.data.uuid(this.addonUUID).table('api_collections').upsert(collection);
    }

    async getLogs(actionID: string, timeStamp: Date, searchString: string): Promise<any> {
        const start = new Date(timeStamp.getTime() - 3600000)
        const end = new Date(timeStamp.getTime() + 3600000)
        const body = {
            Groups: [
                "AsyncAddon",
                "Addon",
                "PAPI"
            ],
            Fields: "Message, DateTimeStamp,Level",
            Filter: `ActionUUID = '${actionID}'`,
            PageSize: 1000,
            DateTimeStamp: {
                Start: start.toISOString(),
                End: end.toISOString()
            }
        }
        if (searchString) {
            body.Filter += ` AND Message LIKE /${searchString}/`
        }
        console.log(body);
        return this.papiClient.post("/logs", body)
    }
}

export default MyService;