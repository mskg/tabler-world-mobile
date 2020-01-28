
 ```
 \copy (select hash, query, point, modifiedon, result, method, provider from geocodes) to 'geocodes.bin' with (FORMAT binary, encoding 'UTF-8');
 \copy geocodes (hash, query, point, modifiedon, result, method, provider) from 'geocodes.bin' with binary;
```