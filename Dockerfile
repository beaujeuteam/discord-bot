FROM alpine:3.9

RUN apk add --update nodejs npm python bash libstdc++
RUN apk add --update ffmpeg

RUN mkdir -p /home/app
WORKDIR /home/app

COPY . /home/app

EXPOSE 9013

CMD ["npm", "start"]
