FROM node:21-alpine
RUN mkdir /react
WORKDIR /react
COPY . .
RUN npm install
CMD ["npm", "run", "build"]
