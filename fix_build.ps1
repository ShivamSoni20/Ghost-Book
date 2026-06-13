$max_retries = 20
$count = 0

while ($count -lt $max_retries) {
    Write-Host "Replacing version = 4 with version = 3 in Cargo.lock"
    (Get-Content Cargo.lock) -replace '^version = 4', 'version = 3' | Set-Content Cargo.lock
    
    Write-Host "Running cargo build-sbf..."
    $output = cargo build-sbf --manifest-path programs/ghost-book/Cargo.toml --sbf-out-dir target/deploy 2>&1 | Out-String
    
    if ($output -match "(?s)feature ``edition2024`` is required") {
        if ($output -match "(?s)failed to parse manifest at .*?([^\\/]+)-([0-9]+\.[0-9]+\.[0-9]+.*?)[\\/]Cargo\.toml") {
            $crate = $matches[1]
            $version = $matches[2]
            Write-Host "Detected edition2024 error in $crate v$version"
            
            # Use crates.io API to find the immediately preceding version
            $url = "https://crates.io/api/v1/crates/$crate"
            $response = curl.exe -s $url | ConvertFrom-Json
            
            # Filter out the bad version and yanked versions, then get the newest one
            $safe_versions = $response.versions | Where-Object { $_.num -ne $version -and $_.yanked -eq $false } | Sort-Object created_at -Descending
            $prev = $safe_versions[0].num
            
            Write-Host "Downgrading $crate to $prev"
            cargo update -p $crate --precise $prev
            $count++
            continue
        }
    }
    
    Write-Host "Build finished or failed for another reason:"
    Write-Host $output
    break
}
