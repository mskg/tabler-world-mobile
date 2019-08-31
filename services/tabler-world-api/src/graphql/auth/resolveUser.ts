import { AuthenticationError } from "apollo-server-core";
import { APIGatewayProxyEvent } from "aws-lambda";
import { IPrincipal } from "../types/IPrincipal";

export function resolveUser(event: APIGatewayProxyEvent): IPrincipal {
    const authorizer = event.requestContext.authorizer;
    if (authorizer == null) {
        throw new AuthenticationError("Authorizer missing");
    }

    let resolvedPrincipal: IPrincipal = {
        email: "",
        club: 0,
        area: 0,
        association: "",
        id: 0,
    };

    if (process.env.IS_OFFLINE === "true" && authorizer.principalId === "offlineContext_authorizer_principalId") {
        console.warn("********* AUTHENTICATION DEBUG MODE *********");

        // single quotes are not allowed in JSON, but encoding in ENV is easier
        const user = (process.env.API_DEBUG_USER || "").replace(/'/g, '"');
        resolvedPrincipal = JSON.parse(user) as IPrincipal;
    } else {
        const { area, club, association, id, email } = authorizer;

        // tslint:disable: triple-equals
        if (area == null || area == "") { throw new AuthenticationError("Authorizer missing (area)"); }
        if (club == null || club == "") { throw new AuthenticationError("Authorizer missing (club)"); }
        if (association == null || association == "") { throw new AuthenticationError("Authorizer missing (association)"); }
        if (id == null || id == "") { throw new AuthenticationError("Authorizer missing (id)"); }
        if (email == null || email == "") { throw new AuthenticationError("Authorizer missing (email)"); }

        resolvedPrincipal.email = email;
        resolvedPrincipal.association = association;
        // values are transfered as strings only
        resolvedPrincipal.club = parseInt(club, 10);
        resolvedPrincipal.area = parseInt(area, 10);
        resolvedPrincipal.id = parseInt(id, 10);
    }

    if (
        typeof (resolvedPrincipal.association) != "string"
        || typeof (resolvedPrincipal.email) != "string"
        || typeof (resolvedPrincipal.area) != "number"
        || typeof (resolvedPrincipal.club) != "number"
        || typeof (resolvedPrincipal.id) != "number"
        || resolvedPrincipal.id <= 0
        || resolvedPrincipal.club <= 0
        || resolvedPrincipal.area <= 0) {
        throw new AuthenticationError("Context not complete");
    }

    return resolvedPrincipal;
}
