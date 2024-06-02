FROM node:alpine
RUN apk add --no-cache ffmpeg
COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build --if-present
CMD ["npm","start"]
