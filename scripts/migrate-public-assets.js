const fs = require('fs')
const path = require('path')

function moveSafe(source, destination) {
  if (!fs.existsSync(source)) {
    console.log(`SKIP (missing): ${source}`)
    return
  }

  const destDir = path.dirname(destination)
  fs.mkdirSync(destDir, { recursive: true })

  console.log(`MOVE: ${source} -> ${destination}`)
  fs.renameSync(source, destination)
}

const repoRoot = process.cwd()
const publicDir = path.join(repoRoot, 'public')

// Projects
for (let i = 1; i <= 6; i++) {
  moveSafe(
    path.join(publicDir, `assets/imgProject${i}.jpg`),
    path.join(publicDir, `images/ui/projects/imgProject${i}.jpg`)
  )
}

// Category images
for (const name of ['imgFacades', 'imgFence', 'imgTerrace', 'imgInterior']) {
  moveSafe(
    path.join(publicDir, `assets/${name}.jpg`),
    path.join(publicDir, `images/ui/categories/${name}.jpg`)
  )
}

// Colors
for (let i = 1; i <= 8; i++) {
  moveSafe(
    path.join(publicDir, `assets/imgColor${i}.png`),
    path.join(publicDir, `images/ui/colors/imgColor${i}.png`)
  )
}

// Wood samples
for (const name of ['imgSpruce', 'imgLarch1', 'imgLarch2']) {
  moveSafe(
    path.join(publicDir, `assets/${name}.png`),
    path.join(publicDir, `images/ui/wood/${name}.png`)
  )
}

// Background/decor
for (const name of ['imgMask', 'imgVector33', 'imgVector37']) {
  moveSafe(
    path.join(publicDir, `assets/${name}.jpg`),
    path.join(publicDir, `images/ui/backgrounds/${name}.jpg`)
  )
}

// Certifications
for (const name of ['cert-epd', 'cert-eu', 'cert-fsc']) {
  moveSafe(
    path.join(publicDir, `assets/${name}.png`),
    path.join(publicDir, `images/ui/certifications/${name}.png`)
  )
}

// Brand assets
moveSafe(
  path.join(publicDir, 'assets/imgLogo.jpg'),
  path.join(publicDir, 'images/ui/brand/imgLogo.jpg')
)
moveSafe(
  path.join(publicDir, 'assets/imgLogo.svg'),
  path.join(publicDir, 'images/ui/brand/imgLogo.svg')
)

// Cart placeholders
moveSafe(path.join(publicDir, 'assets/imgCart.jpg'), path.join(publicDir, 'images/ui/imgCart.jpg'))
moveSafe(path.join(publicDir, 'assets/imgCart.svg'), path.join(publicDir, 'icons/ui/imgCart.svg'))

// UI icons (old: public/assets/icons)
for (const file of [
  'shopping-cart-simple.svg',
  'coins.png',
  'coins-base.png',
  'package.png',
  'plant.png',
  'plant-base.png',
  'icon-base.png',
]) {
  moveSafe(
    path.join(publicDir, `assets/icons/${file}`),
    path.join(publicDir, `icons/ui/${file}`)
  )
}

// UI icon variants that were stored at public/assets root
for (const name of ['imgIconTruck', 'imgIconCoins', 'imgIconPlant']) {
  moveSafe(
    path.join(publicDir, `assets/${name}.jpg`),
    path.join(publicDir, `icons/ui/${name}.jpg`)
  )
  moveSafe(
    path.join(publicDir, `assets/${name}.svg`),
    path.join(publicDir, `icons/ui/${name}.svg`)
  )
}

// Move manifest/docs
moveSafe(
  path.join(publicDir, 'assets/figma-manifest.json'),
  path.join(publicDir, 'docs/figma-manifest.json')
)
moveSafe(path.join(publicDir, 'assets/README.md'), path.join(publicDir, 'docs/assets-README.md'))

console.log('Done.')
