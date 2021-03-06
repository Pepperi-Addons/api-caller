import MyService from './my.service'
import { Client, Request } from '@pepperi-addons/debug-server'

export async function json_spec(client: Client, request: Request) {
    const service = new MyService(client)
    const res = await service.getSpec();
    return res
}

export async function api_collections(client: Client, request: Request) {
    const service = new MyService(client)
 
    let res: any; 
    if (request.method === 'POST') {
        res = service.upsertAPICollection(request.body);
    }
    else if (request.method === 'GET') {
        res = service.getAPICollections(request.query);
    }

    return res
}

export async function openapi_spec()
{
    return {
        paths: {
            '/api/api_collections': {
                get: {
                    tags: ['api_collections'],
                    summary: 'Get API collections',
                    operationId: 'getAPICollections',
                    parameters: [
                        {
                            name: 'where',
                            in: 'query',
                            description: 'Where clause',
                            required: false,
                            schema: {
                                type: 'string'
                            }
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Success',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: {
                                            schema: {
                                                type: 'object',
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                post: {
                    tags: ['api_collections'],
                    summary: 'Create API collection',
                    operationId: 'upsertAPICollection',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        Name: {
                                            type: 'string',
                                            required: true
                                        },
                                        Description: {
                                            type: 'string',
                                            required: true
                                        },
                                        Spec: {
                                            type: 'object',
                                            required: true
                                        }
                                    },
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Success',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                    }
                                }
                            }
                        }
                    }
                }

            }
        }
    }
}

export async function logs(client: Client, request: Request) {
    const service = new MyService(client);
    const actionID = request.query?.ActionUUID;
    const timeStamp: Date = request.query?.TimeStamp;
    const searchString: string = request.query?.SearchString;
    let res: any;

    res = await service.getLogs(actionID, new Date(timeStamp), searchString);

    return res
}