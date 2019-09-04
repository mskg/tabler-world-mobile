#!/bin/bash
source ~/.bashrc

STACK="$(aws cloudformation list-exports)"

export COGNITO_IDENTITY_POOL="$(echo $STACK | jq -r -c '.Exports[] | select(.Name == "CognitoIdentityPool-dev") | .Value')"
export COGNITO_POOL="$(echo $STACK | jq -r -c '.Exports[] | select(.Name == "CognitoUserPool-dev") | .Value')"
export COGNITO_POOL_CLIENT="$(echo $STACK | jq -r -c '.Exports[] | select(.Name == "CognitoUserPoolClient-dev") | .Value')"
#export APP_API="https://$(echo $STACK | jq -r -c '.Exports[] | select(.Name == "ApiGatewayRestApiId-dev") | .Value').execute-api.eu-west-1.amazonaws.com/dev"
export APP_API="https://$(echo $STACK | jq -r -c '.Exports[] | select(.Name == "ApiUrl-dev") | .Value')"
export DB_HOST="$(echo $STACK | jq -r -c '.Exports[] | select(.Name == "DatabaseHostId") | .Value')"

echo Identity Pool  $COGNITO_IDENTITY_POOL
echo Cognito        $COGNITO_POOL
echo Client         $COGNITO_POOL_CLIENT
echo API            $APP_API
echo DB_HOST        $DB_HOST
