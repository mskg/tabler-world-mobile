import { ForbiddenError } from "apollo-server-lambda";
import { Client } from "pg";
import { FieldNames } from "../privacy/FieldNames";
import { FilterContext } from "../privacy/FilterContext";
import { IPrincipal } from "../types/IPrincipal";

export async function getFilterContext(client: Client, principal: IPrincipal): Promise<FilterContext> {
    const res = await client.query("select * from profiles where rtemail = $1 and removed = false", [principal.email]);
    if (res.rowCount !== 1) {
        throw new ForbiddenError("User not found");
    }

    const me = res.rows[0];
    const filterContext: FilterContext =
    {
        id: me[FieldNames.Id],
        club: me[FieldNames.Club],
        area: me[FieldNames.Area],
        association: me[FieldNames.Association]
    };

    if (
        typeof (filterContext.association) != "string"
        || typeof (filterContext.area) != "number"
        || typeof (filterContext.club) != "number"
        || filterContext.club <= 0
        || filterContext.area <= 0) {
        throw new ForbiddenError("Context not complete");
    }

    return filterContext;
}
