# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Deployment

Production deploys as static Nuxt output to the cPanel account for `hayhaydesign.com.au` over SSH:

```bash
npm run deploy:check
npm run deploy
```

The scripts default to:

```bash
DEPLOY_DOMAIN=hayhaydesign.com.au
DEPLOY_SSH_HOST=SYN01AE.SYD5.hostyourservices.net
DEPLOY_SSH_PORT=2683
DEPLOY_SSH_USER=hayhayde
DEPLOY_SSH_KEY=~/.ssh/hayhay-production
DEPLOY_STRICT_HOST_KEY_CHECKING=accept-new
REMOTE_BUILD_BASE_DIR=/home/hayhayde/tmp
REMOTE_GOMAXPROCS=2
REMOTE_NODE_BIN_DIR=/opt/alt/alt-nodejs20/root/usr/bin
REMOTE_PUBLIC_DIR=/home/hayhayde/public_html
```

Use environment variables to override any of those values for a one-off run.
