FROM node:latest

RUN apt install -y bash
RUN mkdir -p /home/app
WORKDIR /home/app

COPY . /home/app

RUN rm -rf node_modules && npm install

EXPOSE 9013

CMD ["npm", "start"]
