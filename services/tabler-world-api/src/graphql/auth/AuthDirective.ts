import { hasRole } from '@mskg/tabler-world-auth-client';
import { SchemaDirectiveVisitor } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLField, GraphQLInterfaceType, GraphQLObjectType } from 'graphql';
import { IApolloContext } from '../types/IApolloContext';

type Enriched = {
    _requiredAuthRole: any,
    _authFieldsWrapped: any,
};

export class AuthDirective extends SchemaDirectiveVisitor {
    public visitObject(type: GraphQLObjectType) {
        this.ensureFieldsWrapped(type as GraphQLObjectType & Enriched);
        (type as GraphQLObjectType & Enriched)._requiredAuthRole = this.args.requires;
    }

    // Visitor methods for nested types like fields and arguments
    // also receive a details object that provides information about
    // the parent and grandparent types.
    public visitFieldDefinition(field: GraphQLField<any, any>, details: {
        objectType: GraphQLObjectType | GraphQLInterfaceType;
    }) {
        this.ensureFieldsWrapped(details.objectType as GraphQLObjectType<any, any> & Enriched);
        (field as GraphQLField<any, any> & Enriched)._requiredAuthRole = this.args.requires;
    }

    private ensureFieldsWrapped(objectType: GraphQLObjectType<any, any> & Enriched) {
        // Mark the GraphQLObjectType object to avoid re-wrapping:
        if (objectType._authFieldsWrapped) return;
        objectType._authFieldsWrapped = true;

        const fields = objectType.getFields();

        Object.keys(fields).forEach((fieldName) => {
            const field = fields[fieldName] as GraphQLField<any, any> & Enriched;
            const { resolve = defaultFieldResolver } = field;

            field.resolve = async function (...args) {
                // Get the required Role from the field first, falling back
                // to the objectType if no Role is required by the field:
                const requiredRole =
                    field._requiredAuthRole ||
                    objectType._requiredAuthRole;

                if (!requiredRole) {
                    return resolve.apply(this, args);
                }

                const context = args[2] as IApolloContext;
                if (!hasRole(context.principal, requiredRole)) {
                    throw new Error('You are not authorized to view this resource.');
                }

                return resolve.apply(this, args);
            };
        });
    }
}
