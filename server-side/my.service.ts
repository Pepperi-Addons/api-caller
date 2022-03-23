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

        const relations = await this.papiClient.addons.data.relations.find({
            where: "RelationName='OpenAPISpec'"
        });

        for (const relation of relations) {
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
        }

        return res;
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
}

export default MyService;