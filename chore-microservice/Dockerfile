# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first (better layer caching)
COPY package.json yarn.lock ./

# Install all dependencies (including devDependencies)
RUN yarn install --frozen-lockfile

# Copy source files (handles Windows line endings)
COPY . .

# Build NestJS
RUN yarn build

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

COPY --from=builder /usr/src/app/dist ./dist



EXPOSE 3000
CMD ["node", "dist/main.js"]