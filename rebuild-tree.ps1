# REBUILD - Reconstrói TODA a tree do GitHub com arquivos locais
$token = $env:GITHUB_TOKEN
$headers = @{ Authorization = "token $token"; Accept = "application/vnd.github.v3+json" }
$base = "https://api.github.com/repos/deejayhfontes-ship-it/user-realm-key-bebb100d"
$localDir = "c:\Users\djhen\Downloads\demo\DESIGN - DO FUTURO\lovable-site"

Write-Host "=== REBUILD COMPLETO DA TREE ==="

# Get current commit for parent
$ref = Invoke-RestMethod -Uri "$base/git/refs/heads/main" -Headers $headers
$parentSha = $ref.object.sha
Write-Host "Parent commit: $parentSha"

# Collect all files
$excludeDirs = @("node_modules", ".git", "dist", ".next", ".vercel", ".gemini", "dist-electron")
$excludeExts = @(".psd", ".ai", ".sketch", ".fig", ".mov", ".mp4", ".zip", ".rar", ".7z", ".exe", ".dmg")
$excludeFiles = @(".env", "rebuild-tree.ps1", "fix-missing.ps1", "upload-missing.ps1", "push-to-github.ps1", "sync-all.ps1", "cleanup-repo.ps1")

$allFiles = Get-ChildItem -Path $localDir -Recurse -File | Where-Object {
    $path = $_.FullName
    $skip = $false
    foreach ($d in $excludeDirs) {
        if ($path -match [regex]::Escape("\$d\")) { $skip = $true; break }
    }
    if (-not $skip) {
        foreach ($e in $excludeExts) {
            if ($path.EndsWith($e)) { $skip = $true; break }
        }
    }
    if (-not $skip) {
        foreach ($f in $excludeFiles) {
            if ($_.Name -eq $f) { $skip = $true; break }
        }
    }
    -not $skip -and $_.Length -lt 5242880
} | ForEach-Object {
    $rel = $_.FullName.Substring($localDir.Length + 1).Replace("\", "/")
    @{ FullPath = $_.FullName; RelPath = $rel }
} | Where-Object { $_.RelPath -notmatch "^C:" }

Write-Host "Total files to upload: $($allFiles.Count)"

# Upload ALL files as blobs and build tree items
$treeItems = @()
$count = 0
$errors = 0
$errorFiles = @()

foreach ($file in $allFiles) {
    $count++
    try {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullPath)
        $b64 = [System.Convert]::ToBase64String($bytes)
        $body = @{ content = $b64; encoding = "base64" } | ConvertTo-Json
        $blob = Invoke-RestMethod -Uri "$base/git/blobs" -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -ContentType "application/json; charset=utf-8"
        $treeItems += @{ path = $file.RelPath; mode = "100644"; type = "blob"; sha = $blob.sha }
    }
    catch {
        $errors++
        $errorFiles += $file.RelPath
        Write-Host "   ERROR [$count]: $($file.RelPath)"
    }
    if ($count % 25 -eq 0) { Write-Host "   [$count/$($allFiles.Count)] uploaded... ($errors errors)" }
}

Write-Host "`nUploaded: $($treeItems.Count) | Errors: $errors"
if ($errorFiles.Count -gt 0) {
    Write-Host "Error files:"
    $errorFiles | ForEach-Object { Write-Host "   - $_" }
}

# Create NEW tree (NO base_tree - complete replacement)
Write-Host "`nCreating tree with $($treeItems.Count) items..."

# Split tree items into batches if too many
$batchSize = 100
$batches = @()
for ($i = 0; $i -lt $treeItems.Count; $i += $batchSize) {
    $end = [Math]::Min($i + $batchSize, $treeItems.Count)
    $batches += , ($treeItems[$i..($end - 1)])
}

# Build tree incrementally
$currentTreeSha = $null
foreach ($batch in $batches) {
    $treeBody = @{ tree = $batch }
    if ($currentTreeSha) { $treeBody.base_tree = $currentTreeSha }
    $json = $treeBody | ConvertTo-Json -Depth 5 -Compress
    $newTree = Invoke-RestMethod -Uri "$base/git/trees" -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($json)) -ContentType "application/json; charset=utf-8"
    $currentTreeSha = $newTree.sha
    Write-Host "   Batch tree: $currentTreeSha"
}

# Create commit
Write-Host "Creating commit..."
$commitBody = @{
    message = "chore: rebuild completo - todos arquivos sincronizados"
    tree    = $currentTreeSha
    parents = @($parentSha)
} | ConvertTo-Json -Depth 3
$newCommit = Invoke-RestMethod -Uri "$base/git/commits" -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($commitBody)) -ContentType "application/json; charset=utf-8"
Write-Host "Commit: $($newCommit.sha)"

# Update ref
$refBody = @{ sha = $newCommit.sha; force = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "$base/git/refs/heads/main" -Method Patch -Headers $headers -Body $refBody -ContentType "application/json" | Out-Null
Write-Host "`n=== REBUILD COMPLETO! ==="
Write-Host "Files: $($treeItems.Count) | Errors: $errors"

# Verify FormularioSolicitacao specifically
$verifyTree = Invoke-RestMethod -Uri "$base/git/trees/$($currentTreeSha)?recursive=1" -Headers $headers
$checkFile = $verifyTree.tree | Where-Object { $_.path -match "FormularioSolicitacao" }
if ($checkFile) { 
    Write-Host "VERIFIED: FormularioSolicitacao IS in tree!" 
    $checkFile | ForEach-Object { Write-Host "   $($_.path)" }
}
else { 
    Write-Host "WARNING: FormularioSolicitacao NOT found!" 
}
