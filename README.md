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
> Linux users could use `v4l2loopback` to create multiple virtual devices to test multiple connections.<br/>
> For archlinux [v4l2loopback](https://wiki.archlinux.org/title/V4l2loopback)

### with docker

1- build image
```console
docker build -t $(image_name) .
```
2- run container
```console
docker run --name $(container_name) -v $(pwd):/app -d -p 3000:3000 $(image_name)
```

### without docker

1- install dependencies
```console
npm i
```
2- run server without watching
```console
npm run up
```
2- run server with watching
```console
npm run up-dev
```

<img src="preview.gif" width="600"/>
