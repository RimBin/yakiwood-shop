$ErrorActionPreference = 'Stop'

function Move-Safe {
  param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Destination
  )

  if (-not (Test-Path $Source)) {
    Write-Host "SKIP (missing): $Source"
    return
  }

  $destDir = Split-Path -Parent $Destination
  New-Item -ItemType Directory -Force -Path $destDir | Out-Null

  Write-Host "MOVE: $Source -> $Destination"
  Move-Item -Force $Source $Destination
}

$public = Join-Path (Resolve-Path .) 'public'

# Projects
1..6 | ForEach-Object {
  Move-Safe (Join-Path $public "assets/imgProject$_.jpg") (Join-Path $public "images/ui/projects/imgProject$_.jpg")
}

# Category images
'imgFacades','imgFence','imgTerrace','imgInterior' | ForEach-Object {
  Move-Safe (Join-Path $public "assets/$_.jpg") (Join-Path $public "images/ui/categories/$_.jpg")
}

# Colors
1..8 | ForEach-Object {
  Move-Safe (Join-Path $public "assets/imgColor$_.png") (Join-Path $public "images/ui/colors/imgColor$_.png")
}

# Wood samples
'imgSpruce','imgLarch1','imgLarch2' | ForEach-Object {
  Move-Safe (Join-Path $public "assets/$_.png") (Join-Path $public "images/ui/wood/$_.png")
}

# Background/decor
'imgMask','imgVector33','imgVector37' | ForEach-Object {
  Move-Safe (Join-Path $public "assets/$_.jpg") (Join-Path $public "images/ui/backgrounds/$_.jpg")
}

# Certifications
'cert-epd','cert-eu','cert-fsc' | ForEach-Object {
  Move-Safe (Join-Path $public "assets/$_.png") (Join-Path $public "images/ui/certifications/$_.png")
}

# Brand assets
Move-Safe (Join-Path $public 'assets/imgLogo.jpg') (Join-Path $public 'images/ui/brand/imgLogo.jpg')
Move-Safe (Join-Path $public 'assets/imgLogo.svg') (Join-Path $public 'images/ui/brand/imgLogo.svg')

# Cart placeholders
Move-Safe (Join-Path $public 'assets/imgCart.jpg') (Join-Path $public 'images/ui/imgCart.jpg')
Move-Safe (Join-Path $public 'assets/imgCart.svg') (Join-Path $public 'icons/ui/imgCart.svg')

# UI icons (old: public/assets/icons)
Move-Safe (Join-Path $public 'assets/icons/shopping-cart-simple.svg') (Join-Path $public 'icons/ui/shopping-cart-simple.svg')
Move-Safe (Join-Path $public 'assets/icons/coins.png') (Join-Path $public 'icons/ui/coins.png')
Move-Safe (Join-Path $public 'assets/icons/coins-base.png') (Join-Path $public 'icons/ui/coins-base.png')
Move-Safe (Join-Path $public 'assets/icons/package.png') (Join-Path $public 'icons/ui/package.png')
Move-Safe (Join-Path $public 'assets/icons/plant.png') (Join-Path $public 'icons/ui/plant.png')
Move-Safe (Join-Path $public 'assets/icons/plant-base.png') (Join-Path $public 'icons/ui/plant-base.png')
Move-Safe (Join-Path $public 'assets/icons/icon-base.png') (Join-Path $public 'icons/ui/icon-base.png')

# UI icon variants that were stored at public/assets root
Move-Safe (Join-Path $public 'assets/imgIconTruck.jpg') (Join-Path $public 'icons/ui/imgIconTruck.jpg')
Move-Safe (Join-Path $public 'assets/imgIconTruck.svg') (Join-Path $public 'icons/ui/imgIconTruck.svg')
Move-Safe (Join-Path $public 'assets/imgIconCoins.jpg') (Join-Path $public 'icons/ui/imgIconCoins.jpg')
Move-Safe (Join-Path $public 'assets/imgIconCoins.svg') (Join-Path $public 'icons/ui/imgIconCoins.svg')
Move-Safe (Join-Path $public 'assets/imgIconPlant.jpg') (Join-Path $public 'icons/ui/imgIconPlant.jpg')
Move-Safe (Join-Path $public 'assets/imgIconPlant.svg') (Join-Path $public 'icons/ui/imgIconPlant.svg')

# Move manifest/docs
Move-Safe (Join-Path $public 'assets/figma-manifest.json') (Join-Path $public 'docs/figma-manifest.json')
Move-Safe (Join-Path $public 'assets/README.md') (Join-Path $public 'docs/assets-README.md')

Write-Host 'Done.'
