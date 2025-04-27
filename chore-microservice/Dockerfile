# Stage 1: Build (with full dependencies)
FROM node:18-slim AS builder

WORKDIR /usr/src/app

# Install system dependencies including CUDA toolkit
RUN apt-get update && \
    apt-get install -y python3 make g++ wget && \
    rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
# Force CPU version and install all dependencies
ENV ONNXRUNTIME_EXECUTABLE="cpu"
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Stage 2: Production
FROM node:18-slim

WORKDIR /usr/src/app

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y libgcc-12-dev libstdc++6 && \
    rm -rf /var/lib/apt/lists/*

# Copy production node_modules from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/human224v3.onnx ./

EXPOSE 3000

CMD ["node", "dist/main.js"]