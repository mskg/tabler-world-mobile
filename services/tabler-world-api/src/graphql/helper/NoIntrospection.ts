import { GraphQLError, ValidationContext } from 'graphql';

export function NoIntrospection(context: ValidationContext) {
  return {
    Field(node: any) {
      if (node.name.value === '__schema' || node.name.value === '__type') {
        context.reportError(new GraphQLError('GraphQL introspection is not allowed, but the query contained __schema or __type', [node]));
      }
    }
  };
}
