import { GraphQLResponse } from 'apollo-server-core';
import { GraphQLExtension } from 'apollo-server-lambda';
import { GraphQLResolveInfo } from 'graphql';
import { IApolloContext } from '../types/IApolloContext';
//@ts-ignore
import { XRAY } from "./aws";

function getFieldName(info: GraphQLResolveInfo) {
    if (
        info.fieldNodes &&
        info.fieldNodes.length > 0 &&
        info.fieldNodes[0].alias
    ) {
        return info.fieldNodes[0].alias.value;
    }

    return info.fieldName || "field";
}

// function isArrayPath(path: ResponsePath) {
//     return typeof path.key === "number";
// }

// function buildPath(path: ResponsePath | undefined) {
//     let current = path;
//     const segments = [];
//     while (current != null) {
//         if (isArrayPath(current)) {
//             segments.push(`[${current.key}]`);
//         } else {
//             segments.push(current.key);
//         }
//         current = current.prev;
//     }
//     return segments.reverse().join(".");
// }

export class XRayRequestExtension extends GraphQLExtension<IApolloContext> {
    requestDidStart() {
        let close: any;

        XRAY.captureAsyncFunc(`GraphQL`, function (ss: any) {
            if (ss) {
                close = () => {
                    ss.close();
                };
            }
        });

        return close;
    }

    // monitors
    willResolveField(
        _source: any,
        _args: { [argName: string]: any },
        _context: IApolloContext,
        info: GraphQLResolveInfo
    ) {
        if (info.path && info.path.prev) {
            // we are currently only interested in the root metrics
            return;
        }

        const name = getFieldName(info);
        // const fullPath =
        //     info.path && info.path.prev
        //         ? buildPath(info.path.prev) + "." + name
        //         : name

        let close: any;

        XRAY.captureAsyncFunc(`GraphQL ${name}`, function (ss: any) {
            if (ss) {
                close = (error: Error | null, _result: any) => {
                    ss.close(error);
                };
            }
        });

        return close;
    }

    willSendResponse(o: {
        graphqlResponse: GraphQLResponse;
        context: IApolloContext;
    }) {
        try {
            const { graphqlResponse } = o;

            if (graphqlResponse.errors) {
                XRAY.captureFunc("GraphQL Errors", (segment: any) => {
                    //@ts-ignore
                    graphqlResponse.errors.forEach(
                        err => segment.addError(JSON.stringify(err, null, 2)));
                });
            }
        }
        catch (e) {
            o.context.logger.error("Faild to add error to segment", e);
        }
    }
}
