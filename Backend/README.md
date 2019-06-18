# Backend

## Overview

This package implements the GraphQL backend and data loading routines.

- `src\graphql` Apollo GraphQL-Backend
- `src\notifications` Server side processing of push notifications
- `src\schedule` Data loading routines
- `src\sql` Database scripts and update procedures

## Services

- Lambda
- RDS as user repository
- DynamoDB as query cache

## Local development

- Open ssh tunnel to database
- `npx serverless dynamodb install` (once)
- `npm start dev`
- Browse [http://localhost:3000/graphql](http://localhost:3000/graphql)

## Deployment

- `npx serverless deploy`
