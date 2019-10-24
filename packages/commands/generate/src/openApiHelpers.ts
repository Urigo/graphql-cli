import { buildASTSchema, GraphQLObjectType, GraphQLSchema, isInputType, parse, printSchema, visit } from "graphql";

/**
 * Remove comments from schema 
 * 
 * @param schema 
 * @return schema without comments
 */
export const removeCommentsFromSchema = (schema: GraphQLSchema) => {
    // Parse it to get ast
    const schemaAST = parse(printSchema(schema));
    const result = visit(schemaAST, {
        // tslint:disable-next-line: no-any
        leave: (node: any) => {
            // leave any node
            if (node.description) {
                node.description = undefined;
            }
        }
    });

    return buildASTSchema(result);
}


/**
 * Strip out individual query/mutation/subscription types from schema
 * Alternative for using complex visitor
 * 
 * @param schema 
 */
export const removeOperationsFromSchema = (schema: GraphQLSchema) => {
    const schemaConfig = schema.toConfig();
    // Filter typemap for individual query/mutation/subscription types
    // Names can be different depending on user setting
    // This is much faster than using visitor
    schemaConfig.types = schemaConfig.types.filter((graphQLType: GraphQLObjectType) => {
        if(isInputType(graphQLType)){
            return false;
        }
        if (schemaConfig.mutation && graphQLType.name === schemaConfig.mutation.name) {
            return false;
        }
        if (schemaConfig.query && graphQLType.name === schemaConfig.query.name) {
            return false;
        }

        return true;
    })
    schemaConfig.query = undefined
    schemaConfig.mutation = undefined;
    // Required when query is missing
    schemaConfig.assumeValid = true;

    return new GraphQLSchema(schemaConfig);
}
