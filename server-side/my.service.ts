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

        const additionalSpecs: any[] = [];
        for (const relation of relations) {
            if (relation.AddonRelativeURL) {
                const x = await this.papiClient.get(`addons/api/${relation.AddonUUID}/${relation.AddonRelativeURL}`);
                if (x) {
                    additionalSpecs.push(x);
                }
            }
        }

        for (const additionalSpec of additionalSpecs) {
            res.paths = {
                ...res.paths,
                ...additionalSpec.paths
            }

            res.tags = [
                ...res.tags,
                ...additionalSpec.tags
            ]
        }

        return res;
    }
}

export default MyService;