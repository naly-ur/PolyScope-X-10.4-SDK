import {deserializeMethodResponse} from './deserializer';
import {serializeMethodCall} from './serializer';
import {XmlRpcValue} from './types';

export class XmlRpcClient {
    url: string;
    headers = {
        'Content-Type': 'text/xml',
    };

    constructor(url: string, options?: { headers?: Map<string, string> }) {
        this.url = url;
        if (options?.headers != undefined) {
            this.headers = {...this.headers, ...options.headers};
        }
    }

    // Make an XML-RPC call to the server and return the response
    async methodCall(method: string, ...params: XmlRpcValue[]): Promise<string> {
        const body = serializeMethodCall(method, params);
        const headers = this.headers;

        let res: Response;
        try {
            res = await fetch(this.url, {method: 'POST', headers, body});
        } catch (err) {
            if ((err as Error).message === 'Failed to fetch') {
                throw new Error(`XML-RPC call "${method}" to ${this.url} failed to connect`);
            }
            throw err;
        }
        if (!res.ok) {
            throw new Error(`XML-RPC call "${method}" to ${this.url} returned ${res.status}: "${res.statusText}"`);
        }

        return deserializeMethodResponse(await res.text());
    }
}
