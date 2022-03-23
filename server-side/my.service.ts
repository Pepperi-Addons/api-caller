import { PapiClient, InstalledAddon } from '@pepperi-addons/papi-sdk'
import { Client } from '@pepperi-addons/debug-server';
import spec from './spec.json';

class MyService {

    papiClient: PapiClient

    constructor(private client: Client) {
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
}

export default MyService;