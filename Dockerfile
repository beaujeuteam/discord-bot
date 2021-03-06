FROM alpine:latest

RUN apk add --update nodejs npm python-dev bash libstdc++
RUN apk add --update ffmpeg

RUN mkdir -p /home/app
WORKDIR /home/app

COPY . /home/app

EXPOSE 9013

CMD ["npm", "start"]
