import MyService from './my.service'
import { Client, Request } from '@pepperi-addons/debug-server'

export async function json_spec(client: Client, request: Request) {
    const service = new MyService(client)
    const res = await service.getSpec();
    return res
}

