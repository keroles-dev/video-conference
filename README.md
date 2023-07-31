# simple pure nodejs video and audio conference app

Techs:

- Websocket
- WebRTC [native without any plugin]
- Typescript
- webpack
- Docker

Features:

- Dynamic multiple webrtc peer connections

Usage:

1- with docker

- build image
  docker build -t ($image_name) .

- run container
  docker run --name ($container_name) -v $(pwd):/app -d -p 3000:3000 ($image_name)

2- without docker

- install dependencies
  npm i

- run server without watching
  npm run up

- run server with watching
  npm run up-dev


Linux users could use v4l2loopback to create multiple virtual devices to test multiple connections