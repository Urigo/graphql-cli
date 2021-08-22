# Stage 1 - the build process
FROM node:16 as compile-server
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build

CMD [ "npm", "start" ]