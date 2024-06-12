# Quick Reference

- Package maintained By: [Yersa Nordman](https://github.com/finwo/mynvr)
- Where to file issues: https://github.com/finwo/mynvr/issues

## MyNVR

MyNVR is a simplified NVR appliance, intended to be self-hosted in a
semi-isolated network using IP cameras.

## How to use this image

This image will not work stand-alone, but relies on
[bluenviron/mediamtx](https://hub.docker.com/r/bluenviron/mediamtx) for it's
core functionality. It's basically just a web-ui for mediamtx.

Example docker-compose:

```yml
services:
  mediamtx:
    image: bluenviron/mediamtx
    ports:
      - 8888:8888
      - 8889:8889
    volumes:
      - ./docker/mediamtx/config.yml:/mediamtx.yml
      - ./data:/data
  mynvr:
    image: finwo/mynvr
    ports:
      - 4000:4000
    environment:
      - PORT=4000
      - RECORDING_DIR=/data/recordings        # As seen from mediamtx & agent
      - MEDIAMTX_API=http://mediamtx:9997     # As seen from agent
      - MEDIAMTX_RTSP=rtsp://mediamtx:8554    # As seen from agent
      - MEDIAMTX_HLS=http://localhost:8888    # As seen from external
      - MEDIAMTX_WEBRTC=http://localhost:8889 # As seen from external
      - STORAGE_CLASS=json-file
      - STORAGE_DIR=/data                     # As seen from agent
    volumes:
      - ./data:/data
```
