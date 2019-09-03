#/bin/bash
source ~/.bash_profile

ME=$1

# Get id list
aws dynamodb scan --table-name $TABLE_NAME | grep ID | awk '{ print $2 }' > /tmp/truncate.list

# Delete from id list
cat /tmp/truncate.list | xargs -IID aws dynamodb delete-item --table-name $TABLE_NAME --key '{ "id": { "S": "ID" }}'

# Remove id list
rm /tmp/truncate.list
