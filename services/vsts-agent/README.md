# vsts-agent

## Login to AWS registry

```
$token = $(aws ecr get-login --no-include-email --region eu-west-1)
$token
```

## Build Image
`docker build -t vsts-agent:latest .`

## Publish Image

Replace *XXXXXXX* with your DKR.

```
docker tag vsts-agent:latest XXXXXXX.dkr.ecr.eu-west-1.amazonaws.com/vsts-agent:latest
docker push XXXXXXX.dkr.ecr.eu-west-1.amazonaws.com/vsts-agent:latest
```

