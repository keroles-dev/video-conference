# simple pure nodejs video and audio conference app

## Techs:

- Websocket
- WebRTC [native without any plugin]
- Typescript
- webpack
- Docker

## Features:

- Dynamic multiple webrtc peer connections

## Usage:

### with docker

1- build image
> docker build -t ($image_name) .

2- run container
> docker run --name ($container_name) -v $(pwd):/app -d -p 3000:3000 ($image_name)

### without docker

1- install dependencies
- npm i

2- run server without watching
- npm run up

2- run server with watching
- npm run up-dev


Linux users could use v4l2loopback to create multiple virtual devices to test multiple connections