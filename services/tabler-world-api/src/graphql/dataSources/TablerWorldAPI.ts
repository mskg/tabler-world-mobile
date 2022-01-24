import { getParameters, Param_Api } from '@mskg/tabler-world-config';
import { RequestOptions, RESTDataSource, Request } from 'apollo-datasource-rest';
import { TTLs } from '../cache/TTLs';
import { IApolloContext } from '../types/IApolloContext';

export class TablerWorldAPI extends RESTDataSource<IApolloContext> {
    constructor() {
        super();
    }

    protected cacheKeyFor(request: Request): string {
        const key = super.cacheKeyFor(request);
        return `${this.context.principal.family}::${key}`;
    }

    public async resolveURL(request: RequestOptions) {
        const params = await getParameters('tw-api');
        const api = JSON.parse(params['tw-api']) as Param_Api;

        this.baseURL = `https://${api.host}/v1/admin/`;
        return super.resolveURL(request);
    }

    public async willSendRequest(request: RequestOptions): Promise<void> {
        request.headers.set('Content-Type', 'application/json');

        const params = await getParameters('tw-api');
        const api = JSON.parse(params['tw-api']) as Param_Api;

        // @ts-ignore
        const key = api.keys[this.context.principal.family!];
        request.headers.set('Authorization', `Token ${key}`);
    }

    public async getAllAlbums(): Promise<any[]> {
        const ttls = await TTLs();

        return this.get(
            'albums/',
            undefined,
            {
                cacheOptions: {
                    ttl: ttls.Albums,
                },
            });
    }

    public async getAllDocuments(): Promise<any[]> {
        const ttls = await TTLs();

        return this.get(
            'folders/',
            undefined,
            {
                cacheOptions: {
                    ttl: ttls.Documents,
                },
            });
    }

    public async getAllNews(): Promise<any[]> {
        const ttls = await TTLs();

        return this.get(
            'news/',
            undefined,
            {
                cacheOptions: {
                    ttl: ttls.News,
                },
            });
    }
}
