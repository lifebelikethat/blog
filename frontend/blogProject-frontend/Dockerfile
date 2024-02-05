FROM node:21-alpine
RUN mkdir /react
WORKDIR /react
COPY . .
RUN npm install
EXPOSE 80
RUN npm run build
