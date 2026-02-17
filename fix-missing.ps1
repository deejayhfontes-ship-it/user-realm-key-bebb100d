$token = $env:GITHUB_TOKEN
$headers = @{ Authorization = "token $token"; Accept = "application/vnd.github.v3+json" }
$base = "https://api.github.com/repos/deejayhfontes-ship-it/user-realm-key-bebb100d"
$localDir = "c:\Users\djhen\Downloads\demo\DESIGN - DO FUTURO\lovable-site"

Write-Host "=== ENCONTRAR E ENVIAR ARQUIVOS FALTANTES ==="

# 1. Get GitHub tree
Write-Host "`n1. Getting GitHub tree..."
$ref = Invoke-RestMethod -Uri "$base/git/refs/heads/main" -Headers $headers
$latestSha = $ref.object.sha
$commit = Invoke-RestMethod -Uri "$base/git/commits/$latestSha" -Headers $headers
$tree = Invoke-RestMethod -Uri "$base/git/trees/$($commit.tree.sha)?recursive=1" -Headers $headers
$ghFiles = @{}
$tree.tree | Where-Object { $_.type -eq "blob" } | ForEach-Object { $ghFiles[$_.path] = $_.sha }
Write-Host "   GitHub has $($ghFiles.Count) files"

# 2. Get ALL local files
Write-Host "2. Scanning local files..."
$excludeDirs = @("node_modules", ".git", "dist", ".next", ".vercel", ".gemini", "dist-electron")
$excludeExts = @(".psd", ".ai", ".sketch", ".fig", ".mov", ".mp4", ".zip", ".rar", ".7z", ".exe", ".dmg")

$localFiles = Get-ChildItem -Path $localDir -Recurse -File | Where-Object {
    $path = $_.FullName
    $skip = $false
    foreach ($d in $excludeDirs) {
        if ($path -match [regex]::Escape("\$d\") -or $path -match [regex]::Escape("\$d$")) { $skip = $true; break }
    }
    if (-not $skip) {
        foreach ($e in $excludeExts) {
            if ($path.EndsWith($e)) { $skip = $true; break }
        }
    }
    -not $skip
} | ForEach-Object {
    $rel = $_.FullName.Substring($localDir.Length + 1).Replace("\", "/")
    @{ FullPath = $_.FullName; RelPath = $rel; Size = $_.Length }
} | Where-Object { 
    $_.Size -lt 10485760 -and 
    $_.RelPath -ne ".env" -and 
    $_.RelPath -notmatch "^C:" -and 
    $_.RelPath -notmatch "cleanup-repo|upload-missing|push-to-github|sync-all|fix-missing"
}

Write-Host "   Local has $($localFiles.Count) files"

# 3. Find missing files
$missing = $localFiles | Where-Object { -not $ghFiles.ContainsKey($_.RelPath) }
Write-Host "   Missing from GitHub: $($missing.Count) files"

if ($missing.Count -eq 0) {
    Write-Host "`n=== NO MISSING FILES ==="
    exit
}

# Show what's missing
Write-Host "`n   Missing files:"
$missing | ForEach-Object { Write-Host "   - $($_.RelPath)" }

# 4. Upload missing files
Write-Host "`n3. Uploading $($missing.Count) missing files..."
$treeItems = @()
$count = 0
$errors = 0

foreach ($file in $missing) {
    $count++
    try {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullPath)
        $b64 = [System.Convert]::ToBase64String($bytes)
        $body = "{`"content`":`"$b64`",`"encoding`":`"base64`"}"
        $blob = Invoke-RestMethod -Uri "$base/git/blobs" -Method Post -Headers $headers -Body $body -ContentType "application/json; charset=utf-8"
        $treeItems += @{ path = $file.RelPath; mode = "100644"; type = "blob"; sha = $blob.sha }
        if ($count % 10 -eq 0) { Write-Host "   [$count/$($missing.Count)] uploaded..." }
    }
    catch {
        $errors++
        Write-Host "   ERROR [$count]: $($file.RelPath) - $($_.Exception.Message)"
    }
}
Write-Host "   Uploaded: $($treeItems.Count) | Errors: $errors"

if ($treeItems.Count -eq 0) {
    Write-Host "Nothing to commit!"
    exit
}

# 5. Create tree (additive with base_tree)
Write-Host "`n4. Creating tree..."
$treeBody = @{ base_tree = $commit.tree.sha; tree = $treeItems } | ConvertTo-Json -Depth 5 -Compress
$newTree = Invoke-RestMethod -Uri "$base/git/trees" -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($treeBody)) -ContentType "application/json; charset=utf-8"

# 6. Commit
Write-Host "5. Creating commit..."
$commitBody = @{
    message = "fix: adiciona $($treeItems.Count) arquivos faltantes para corrigir build"
    tree    = $newTree.sha
    parents = @($latestSha)
} | ConvertTo-Json -Depth 3
$newCommit = Invoke-RestMethod -Uri "$base/git/commits" -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($commitBody)) -ContentType "application/json; charset=utf-8"

# 7. Update ref
Write-Host "6. Updating main..."
$refBody = @{ sha = $newCommit.sha; force = $false } | ConvertTo-Json
Invoke-RestMethod -Uri "$base/git/refs/heads/main" -Method Patch -Headers $headers -Body $refBody -ContentType "application/json" | Out-Null

Write-Host "`n=== CONCLUIDO ==="
Write-Host "Enviados: $($treeItems.Count) | Erros: $errors"
Write-Host "Commit: $($newCommit.sha)"
