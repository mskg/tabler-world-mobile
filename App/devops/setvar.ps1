param (
    [Parameter(Mandatory=$true)]
    [ValidateNotNullOrEmpty()]
    [string] $VariableName,
    [Parameter(Mandatory=$true)]
    [ValidateNotNullOrEmpty()]
    [string] $VariableValue
)

## Construct a basic auth head using PAT
function BasicAuthHeader()
{
    param([string]$authtoken)

    $ba = (":{0}" -f $authtoken)
    $ba = [System.Text.Encoding]::UTF8.GetBytes($ba)
    $ba = [System.Convert]::ToBase64String($ba)
    $h = @{Authorization=("Basic{0}" -f $ba);ContentType="application/json"}
    return $h
}

$h = BasicAuthHeader $env:SYSTEM_ACCESSTOKEN
$baseRMUri = $env:SYSTEM_TEAMFOUNDATIONSERVERURI + $env:SYSTEM_TEAMPROJECT
$releaseId = $env:RELEASE_RELEASEID

$getReleaseUri = $baseRMUri + "/_apis/release/releases/" + $releaseId + "?api-version=5.0"
$release = Invoke-RestMethod -Uri $getReleaseUri -Headers $h -Method Get

# Update an existing variable named d1 to its new value d5
Write-Host ("Setting variable value...")
$release.variables.($VariableName).value = $VariableValue;
Write-Host ("Completed setting variable value.")

####****************** update the modified object **************************
$release2 = $release | ConvertTo-Json -Depth 100
$release2 = [Text.Encoding]::UTF8.GetBytes($release2)

$updateReleaseUri = $baseRMUri + "/_apis/release/releases/" + $releaseId + "?api-version=5.0"

Write-Host ("Updating release...")
$content2 = Invoke-RestMethod -Uri $updateReleaseUri -Method Put -Headers $h -ContentType “application/json” -Body $release2 -Verbose -Debug

Write-Host "=========================================================="
