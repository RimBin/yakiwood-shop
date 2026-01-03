# Script to identify and remove unused assets
# This script scans the codebase for asset references and removes unused files

$assetsPath = "public\assets"
$projectRoot = Get-Location

# List of assets that are actually referenced in the codebase
$usedAssets = @(
    'imgProject1.jpg',
    'imgProject2.jpg',
    'imgProject3.jpg',
    'imgProject4.jpg',
    'imgProject5.jpg',
    'imgProject6.jpg',
    'imgSpruce.png',
    'imgLarch1.png',
    'imgLarch2.png',
    'imgColor1.png',
    'imgColor2.png',
    'imgColor3.png',
    'imgColor4.png',
    'imgColor5.png',
    'imgColor6.png',
    'imgColor7.png',
    'imgColor8.png',
    'imgMask.jpg',
    'imgVector33.jpg',
    'imgVector37.jpg',
    'imgFence.jpg',
    'imgFacades.jpg',
    'imgTerrace.jpg',
    'imgInterior.jpg',
    'imgLogo.svg',
    'imgCart.svg',
    'cert-epd.png',
    'cert-fsc.png',
    'cert-eu.png',
    'icon-base.png',
    'coins-base.png',
    'plant-base.png',
    'imgCart.jpg',
    'imgLogo.jpg',
    'imgIconCoins.jpg',
    'imgIconCoins.svg',
    'imgIconPlant.jpg',
    'imgIconPlant.svg',
    'imgIconTruck.jpg',
    'imgIconTruck.svg',
    'README.md',
    'figma-manifest.json'
)

Write-Host "=== Scanning for unused assets ===" -ForegroundColor Cyan
Write-Host ""

# Get all files in assets directory
$allFiles = Get-ChildItem -Path $assetsPath -File -Recurse

$unusedFiles = @()
$totalSize = 0

foreach ($file in $allFiles) {
    $isUsed = $usedAssets -contains $file.Name
    
    if (-not $isUsed) {
        $unusedFiles += $file
        $totalSize += $file.Length
    }
}

Write-Host "Found $($unusedFiles.Count) unused files" -ForegroundColor Yellow
Write-Host "Total size: $([math]::Round($totalSize / 1MB, 2)) MB" -ForegroundColor Yellow
Write-Host ""

if ($unusedFiles.Count -eq 0) {
    Write-Host "No unused files found!" -ForegroundColor Green
    exit 0
}

# List files to be deleted
Write-Host "Files to be deleted:" -ForegroundColor Red
foreach ($file in $unusedFiles) {
    $relativePath = $file.FullName.Replace("$projectRoot\", "")
    $sizeKB = [math]::Round($file.Length / 1KB, 2)
    Write-Host "  - $relativePath ($sizeKB KB)" -ForegroundColor Gray
}
Write-Host ""

# Ask for confirmation
$confirmation = Read-Host "Do you want to delete these files? (yes/no)"

if ($confirmation -eq "yes" -or $confirmation -eq "y") {
    Write-Host ""
    Write-Host "Deleting files..." -ForegroundColor Yellow
    
    $deletedCount = 0
    foreach ($file in $unusedFiles) {
        try {
            Remove-Item $file.FullName -Force
            $deletedCount++
            Write-Host "  Deleted: $($file.Name)" -ForegroundColor Green
        } catch {
            Write-Host "  Failed to delete: $($file.Name)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Successfully deleted $deletedCount files" -ForegroundColor Green
    Write-Host "Freed up $([math]::Round($totalSize / 1MB, 2)) MB" -ForegroundColor Green
    
    # Clean up empty directories
    Write-Host ""
    Write-Host "Cleaning up empty directories..." -ForegroundColor Yellow
    Get-ChildItem -Path $assetsPath -Directory -Recurse | 
        Where-Object { (Get-ChildItem $_.FullName -File -Recurse).Count -eq 0 } |
        Remove-Item -Recurse -Force
    
    Write-Host "Done!" -ForegroundColor Green
} else {
    Write-Host "Cancelled. No files were deleted." -ForegroundColor Yellow
}
