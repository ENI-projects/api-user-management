FROM node:lts-slim

WORKDIR /app
# copy project files, install dependencies and build it
ADD package-lock.json .
ADD package.json .
RUN npm ci
COPY . .

ARG ENVIRONMENT=development
ENV NODE_ENV=${ENVIRONMENT}

EXPOSE 3000

CMD ["node", "server.js"]