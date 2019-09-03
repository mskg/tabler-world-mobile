# CloudWatch Log Insights

## Cache Utilization
```
filter @message like /DynamoDBCache|MemoryBackedCache/
| fields @timestamp
| parse @message /\[(?<@cache>[^\s\]]*)\] (?<@method>[^\s]*)(?<@parameters>.*)/
| filter @method not like "item"
| sort @timestamp desc
#| stats count() by @cache, @method
```
