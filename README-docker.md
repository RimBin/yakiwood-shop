# Docker usage for Yakiwood Next.js app

## Build the Docker image
```
docker build -t yakiwood-app .
```

## Run the container
```
docker run -p 3000:3000 yakiwood-app
```

App will be available at http://localhost:3000

## Notes
- Uses Node.js 20 Alpine for small image size
- Installs with `--legacy-peer-deps` for React 19 compatibility
- Runs `npm run build` and then `npm start` (Next.js production)
- You can override the port with `-p` as needed
