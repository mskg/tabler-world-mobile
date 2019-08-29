import { CustomAuthorizerResult, Statement } from "aws-lambda";

type Options = {
    restApiId?: string,
    region?: string,
    stage?: string,
}

export enum HttpVerb {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    HEAD = "HEAD",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS",
    ALL = "*"
};

/**
 * AuthPolicy receives a set of allowed and denied methods and generates a valid
 * AWS policy for the API Gateway authorizer. The constructor receives the calling
 * user principal, the AWS account ID of the API owner, and an apiOptions object.
 * The apiOptions can contain an API Gateway RestApi Id, a region for the RestApi, and a
 * stage that calls should be allowed/denied for. For example
 * {
 *   restApiId: "xxxxxxxxxx",
 *   region: "us-east-1",
 *   stage: "dev"
 * }
 *
 * var testPolicy = new AuthPolicy("[principal user identifier]", "[AWS account id]", apiOptions);
 * testPolicy.allowMethod(AuthPolicy.HttpVerb.GET, "/users/username");
 * testPolicy.denyMethod(AuthPolicy.HttpVerb.POST, "/pets");
 * context.succeed(testPolicy.build());
 *
 * @class AuthPolicy
 * @constructor
 */
export class AuthPolicy {

    private version = "2012-10-17";
    private pathRegex = new RegExp('^[/.a-zA-Z0-9-\*]+$');
    private allowMethods: any[] = [];
    private denyMethods: any[] = [];

    private restApiId: string;
    private region: string;
    private stage: string;

    constructor(private principalId: string, private awsAccountId: string, apiOptions?: Options) {
        if (!apiOptions || !apiOptions.restApiId) {
            this.restApiId = "*";
        }
        else {
            this.restApiId = apiOptions.restApiId;
        }

        if (!apiOptions || !apiOptions.region) {
            this.region = "*";
        }
        else {
            this.region = apiOptions.region;
        }

        if (!apiOptions || !apiOptions.stage) {
            this.stage = "*";
        }
        else {
            this.stage = apiOptions.stage;
        }
    }

    /**
     * Adds a method to the internal lists of allowed or denied methods. Each object in
     * the internal list contains a resource ARN and a condition statement. The condition
     * statement can be null.
     *
     * @method addMethod
     * @param {String} The effect for the policy. This can only be "Allow" or "Deny".
     * @param {String} he HTTP verb for the method, this should ideally come from the
     *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
     * @param {String} The resource path. For example "/pets"
     * @param {Object} The conditions object in the format specified by the AWS docs.
     * @return {void}
     */
    addMethod(effect: string, verb: HttpVerb, resource: string, conditions: any) {
        if (verb != "*" && !HttpVerb.hasOwnProperty(verb)) {
            throw new Error("Invalid HTTP verb " + verb + ". Allowed verbs in AuthPolicy.HttpVerb");
        }

        if (!this.pathRegex.test(resource)) {
            throw new Error("Invalid resource path: " + resource + ". Path should match " + this.pathRegex);
        }

        var cleanedResource = resource;
        if (resource.substring(0, 1) == "/") {
            cleanedResource = resource.substring(1, resource.length);
        }
        var resourceArn = "arn:aws:execute-api:" +
            this.region + ":" +
            this.awsAccountId + ":" +
            this.restApiId + "/" +
            this.stage + "/" +
            verb + "/" +
            cleanedResource;

        if (effect.toLowerCase() == "allow") {
            this.allowMethods.push({
                resourceArn: resourceArn,
                conditions: conditions
            });

        } else if (effect.toLowerCase() == "deny") {
            this.denyMethods.push({
                resourceArn: resourceArn,
                conditions: conditions
            })
        }
    };

    /**
     * Returns an empty statement object prepopulated with the correct action and the
     * desired effect.
     *
     * @method getEmptyStatement
     * @param {String} The effect of the statement, this can be "Allow" or "Deny"
     * @return {Object} An empty statement object with the Action, Effect, and Resource
     *                  properties prepopulated.
     */
    getEmptyStatement(effect: string): { Action: string, Effect: string, Resource: string[] } {
        effect = effect.substring(0, 1).toUpperCase() + effect.substring(1, effect.length).toLowerCase();

        var statement = {
            Action: "execute-api:Invoke",
            Effect: effect,
            Resource: [],
        };

        return statement;
    };

    /**
     * This loops over an array of objects containing a resourceArn and
     * conditions statement and generates the array of statements for the policy.
     *
     * @method getStatementsForEffect
     * @param {String} The desired effect. This can be "Allow" or "Deny"
     * @param {Array} An array of method objects containing the ARN of the resource
     *                and the conditions for the policy
     * @return {Array} an array of formatted statements for the policy.
     */
    getStatementsForEffect(effect: string, methods: any[]): Statement[] {
        var statements: Statement[] = [];

        if (methods.length > 0) {
            var statement = this.getEmptyStatement(effect);

            for (var i = 0; i < methods.length; i++) {
                var curMethod = methods[i];
                if (curMethod.conditions === null || curMethod.conditions.length === 0) {
                    statement.Resource.push(curMethod.resourceArn);
                } else {
                    var conditionalStatement = this.getEmptyStatement(effect);
                    conditionalStatement.Resource.push(curMethod.resourceArn);

                    //@ts-ignore
                    conditionalStatement.Condition = curMethod.conditions;
                    statements.push(conditionalStatement);
                }
            }

            if (statement.Resource !== null && statement.Resource.length > 0) {
                statements.push(statement);
            }
        }

        return statements;
    };

    /**
     * Adds an allow "*" statement to the policy.
     *
     * @method allowAllMethods
     */
    allowAllMethods() {
        this.addMethod("allow", HttpVerb.ALL, "*", null);
    };

    /**
     * Adds a deny "*" statement to the policy.
     *
     * @method denyAllMethods
     */
    denyAllMethods() {
        this.addMethod("deny", HttpVerb.ALL, "*", null);
    };

    /**
     * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
     * methods for the policy
     *
     * @method allowMethod
     * @param {String} The HTTP verb for the method, this should ideally come from the
     *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
     * @param {string} The resource path. For example "/pets"
     * @return {void}
     */
    allowMethod(verb: HttpVerb, resource: string) {
        this.addMethod("allow", verb, resource, null);
    };

    /**
     * Adds an API Gateway method (Http verb + Resource path) to the list of denied
     * methods for the policy
     *
     * @method denyMethod
     * @param {String} The HTTP verb for the method, this should ideally come from the
     *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
     * @param {string} The resource path. For example "/pets"
     * @return {void}
     */
    denyMethod(verb: HttpVerb, resource: string) {
        this.addMethod("deny", verb, resource, null);
    };

    /**
     * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
     * methods and includes a condition for the policy statement. More on AWS policy
     * conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
     *
     * @method allowMethodWithConditions
     * @param {String} The HTTP verb for the method, this should ideally come from the
     *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
     * @param {string} The resource path. For example "/pets"
     * @param {Object} The conditions object in the format specified by the AWS docs
     * @return {void}
     */
    allowMethodWithConditions(verb: HttpVerb, resource: string, conditions: any) {
        this.addMethod("allow", verb, resource, conditions);
    };

    /**
     * Adds an API Gateway method (Http verb + Resource path) to the list of denied
     * methods and includes a condition for the policy statement. More on AWS policy
     * conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
     *
     * @method denyMethodWithConditions
     * @param {String} The HTTP verb for the method, this should ideally come from the
     *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
     * @param {string} The resource path. For example "/pets"
     * @param {Object} The conditions object in the format specified by the AWS docs
     * @return {void}
     */
    denyMethodWithConditions(verb: HttpVerb, resource: string, conditions: any) {
        this.addMethod("deny", verb, resource, conditions);
    };

    /**
     * Generates the policy document based on the internal lists of allowed and denied
     * conditions. This will generate a policy with two main statements for the effect:
     * one statement for Allow and one statement for Deny.
     * Methods that includes conditions will have their own statement in the policy.
     *
     * @method build
     * @return {Object} The policy object that can be serialized to JSON.
     */
    build(): CustomAuthorizerResult {
        if ((!this.allowMethods || this.allowMethods.length === 0) &&
            (!this.denyMethods || this.denyMethods.length === 0)) {
            throw new Error("No statements defined for the policy");
        }

        //@ts-ignore
        var policy: CustomAuthorizerResult = {};
        policy.principalId = this.principalId;

        var doc: any = {};
        doc.Version = this.version;
        doc.Statement = [];

        doc.Statement = doc.Statement.concat(this.getStatementsForEffect("Allow", this.allowMethods));
        doc.Statement = doc.Statement.concat(this.getStatementsForEffect("Deny", this.denyMethods));

        policy.policyDocument = doc;

        return policy;
    }
}