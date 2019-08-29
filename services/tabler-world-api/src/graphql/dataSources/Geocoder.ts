import { useDataService } from "@mskg/tabler-world-rds-client";
import { DataSource, DataSourceConfig } from "apollo-datasource";
import DataLoader from "dataloader";
import { IApolloContext } from "../types/IApolloContext";

export class GeocoderDataSource extends DataSource<IApolloContext> {
    context!: IApolloContext;
    data!: DataLoader<string, any>;

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.context = config.context;

        this.data = new DataLoader<string, any>(
            (ids: string[]) => useDataService(this.context, async (client) => {
                const res = await client.query(`
                select
                    hash,
                    ST_X (point::geometry) AS longitude,
                    ST_Y (point::geometry) AS latitude
                from geocodes where hash = ANY($1)`,
                [ids]);

                //this.context.logger.log(ids, res.rows);
                return ids.map(id => res.rows.find(r => r.hash == id));
            }),
            {
                cacheKeyFn: (k: number) => k,
            }
        );
    }

    public readOne(hash: string): Promise<any | null> {
        this.context.logger.log("readOne", hash);
        return this.data.load(hash);
    }
}