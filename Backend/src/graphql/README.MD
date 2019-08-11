# Settings

## Environment Variables

### AWS

- `AWS_REGION`

### Cache

- `DISABLE_CACHE=false`
- `MEMORY_CACHE_SIZE=128000000`

### XRAY

- `XRAY_DISABLED=false`
- `XRAY_STREAMING_THRESHOLD=100`
- `XRAY_GRAPHQL_DISABLED=false`

### Offline

- `IS_OFFLINE=false`
- `NEARBY_RADIUS=100000`

## Lambd Warmer

See [Lambda Warmer: Optimize AWS Lambda Function Cold Starts](https://www.jeremydaly.com/lambda-warmer-optimize-aws-lambda-function-cold-starts).

    >In short, after many different setups and iterations, I haven’t been able to get “affinity” between a container being warmed by lambda-warmer (i.e., on the lambda side), and one being invoked via API Gateway, if the lambda is built with X-Ray.

**Due to that reason, turned off for now**
