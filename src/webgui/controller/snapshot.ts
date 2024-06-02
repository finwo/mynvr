import { spawn                                 } from 'child_process';
import { URL                                   } from 'url';
import { resolve                               } from 'path';
import { readFileSync                          } from 'fs';
import { Controller, Get, Req, Res, Middleware } from '@finwo/router';
import { FastifyReply                          } from 'fastify';
import { AuthenticatedRequest                  } from '@identity/model/authenticated-request';
import   authenticated                           from '@identity/middleware/authenticated';
import   requireAuthentication                   from '@identity/middleware/require-authentication';
import { CameraRepository                      } from '@nvr/repository/camera';

const partialDir = resolve(__dirname, '../template/partial');

@Controller("/ui/snapshot")
export class SnapshotController {
  constructor(
    private cameraRepository: CameraRepository
  ) {
    if (!('MEDIAMTX_RTSP' in process.env)) {
      throw new Error('Missing MEDIAMTX_RTSP env var');
    }
  }

  @Get("/:filename")
  @Middleware(authenticated)
  async servePartial(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {

    // No redirect, just permission denied
    if (!req.auth) {
      res.statusCode = 403;
      return res.send();
    }

    // Sanity checking
    const params = req.params as Record<string, string>;
    if (!params.filename) {
      res.statusCode = 400;
      return res.send();
    }

    const encoders = {
      png  : [ 'png'    , 'image/png'  ],
      webp : [ 'libwebp', 'image/webp' ],
    };

    // Retrieve what we should snapshot
    const [ cameraName, extension ] = params.filename.split('.') as [ string, keyof (typeof encoders) ];
    if (!(extension in encoders)) {
      res.statusCode = 404;
      return res.send();
    }

    // Validate cameraName
    const camera = await this.cameraRepository.get(cameraName);
    if (!camera) {
      res.statusCode = 404;
      return res.send();
    }

    const command = 'ffmpeg';
    const args    = [
      '-rtsp_transport', 'tcp',
      '-i', `${process.env.MEDIAMTX_RTSP}/${camera.name}`,
      '-frames:v', '1',
      '-c:v', encoders[extension][0],
      '-f', 'rawvideo',
      '-an',
      '-'
    ];
    const child = spawn(command, args);
    let   response = Buffer.alloc(0);

    child.stdout.on('data', chunk => {
      response = Buffer.concat([ response, chunk ]);
    });

    child.on('close', () => {
      // Cleanup?
    });

    res.statusCode = 200;
    res.header('Content-Type', encoders[extension][1]);
    return child.stdout;
  }
}
