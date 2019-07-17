import { RequestOptions, RESTDataSource } from 'apollo-datasource-rest';
import { getKey } from '../../schedule/apikey';
import { TTLs } from '../cache/TTLs';
import { IApolloContext } from '../types/IApolloContext';

export class TablerWorldAPI extends RESTDataSource<IApolloContext> {
    constructor() {
        super();
        this.baseURL = `https://${process.env.api_host || process.env.API_HOST}/v1/admin/`;
    }

    async willSendRequest(request: RequestOptions): Promise<void> {
        request.headers.set('Content-Type', 'application/json');
        request.headers.set('Authorization', `Token ${process.env.API_KEY_PLAIN || await getKey()}`);
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
                ttl: TTLs.Albums,
            },
        });
    }
}
