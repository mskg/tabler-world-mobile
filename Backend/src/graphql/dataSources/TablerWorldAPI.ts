import { RequestOptions, RESTDataSource } from 'apollo-datasource-rest';
import { getParameters } from '../../shared/parameters/getParameters';
import { Param_Api } from '../../shared/parameters/types';
import { TTLs } from '../cache/TTLs';
import { IApolloContext } from '../types/IApolloContext';

export class TablerWorldAPI extends RESTDataSource<IApolloContext> {
    constructor() {
        super();
    }

    async resolveURL(request: RequestOptions) {
        const params = await getParameters('tw-api');
        const api = JSON.parse(params["tw-api"]) as Param_Api;

        this.baseURL = `https://${api.host}/v1/admin/`;
        return super.resolveURL(request);
    }

    async willSendRequest(request: RequestOptions): Promise<void> {
        request.headers.set('Content-Type', 'application/json');

        const params = await getParameters('tw-api');
        const api = JSON.parse(params["tw-api"]) as Param_Api;

        request.headers.set('Authorization', `Token ${api.key}`);
    }

    async getAllAlbums(): Promise<Array<any>> {
        return this.get('albums/', undefined,
            {
                cacheOptions: {
                    ttl: TTLs.Albums,
                },
            });
    }

    async getAllDocuments(): Promise<Array<any>> {
        return this.get('folders/', undefined,
            {
                cacheOptions: {
                    ttl: TTLs.Documents,
                },
            });
    }

    async getAllNews(): Promise<Array<any>> {
        return this.get('news/', undefined,
            {
                cacheOptions: {
                    ttl: TTLs.News,
                },
            });
    }
}
