FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=https://api.foodservice.app/api/v1
ARG VITE_DEFAULT_TENANT_SUBDOMAIN=demo

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DEFAULT_TENANT_SUBDOMAIN=$VITE_DEFAULT_TENANT_SUBDOMAIN

RUN npm run build && npm run build:admin

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/storefront
COPY --from=builder /app/dist-admin /usr/share/nginx/admin

# Config real é montada via volume no docker-compose do backend
EXPOSE 80
