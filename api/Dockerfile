FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache tini

# Copy lib (shared core) first
COPY lib/ ./lib/

# Copy API code
COPY api/package*.json ./api/
WORKDIR /app/api
RUN npm install --production

COPY api/server.js ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER node

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
