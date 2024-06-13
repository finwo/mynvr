import { URL                                   } from 'url';
import { resolve                               } from 'path';
import { readFileSync                          } from 'fs';
import   mime                                    from 'mime-types';
import { Controller, Get, Req, Res, Middleware } from '@finwo/router';
import { FastifyRequest, FastifyReply          } from 'fastify';
import { AuthenticatedRequest                  } from '@identity/model/authenticated-request';
import   authenticated                           from '@identity/middleware/authenticated';
import   requireAuthentication                   from '@identity/middleware/require-authentication';
import { Template                              } from '@webgui/template';
import { UserRepository                        } from '@identity/repository/user';
import { CameraRepository                      } from '@nvr/repository/camera';
import { RecordingRangeQuery                   } from '@nvr/query/recording-range';

const partialDir = resolve(__dirname, '../template/partial');
const commonData = {
  site: {
    title: 'MyNVR',
  },
};

@Controller("/ui/partial")
export class PartialController {
  constructor(
    private template: Template,
    private userRepository: UserRepository,
    private cameraRepository: CameraRepository,
    private recordingRangeQuery: RecordingRangeQuery,
  ) {}

  @Get("/:name")
  async servePartial(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {

    // Basic filter
    const { name } = req.params as Record<string, string>;
    if (!name) {
      res.statusCode = 400;
      res.send('Bad request');
    }

    // Static dir filter
    const fullPath = resolve(partialDir, name);
    if (fullPath.substring(0, partialDir.length) !== partialDir) {
      res.statusCode = 400;
      res.send('Bad request');
    }

    res.header('Content-Type', mime.lookup(fullPath));
    const content = readFileSync(fullPath);
    res.send(content);
  }

  @Get("/nav.html")
  @Middleware(authenticated)
  @Middleware(requireAuthentication())
  async serveNav(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) throw new Error();

    // Parse & normalize referer
    const referer = new URL(req.headers['hx-current-url'] || req.headers.referer || '');
    if (referer.pathname.substring(referer.pathname.length-1) == '/') {
      referer.pathname = referer.pathname.substring(0, referer.pathname.length - 1);
    }

    res.header('Content-Type', 'text/html');
    res.send(this.template.render('partial/nav.html', {
      ...commonData,
      referer,
      user: req.auth.user,
    }));

  }

  @Get("/camera-overview.html")
  @Middleware(authenticated)
  @Middleware(requireAuthentication())
  async serveCameraOverview(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) throw new Error();
    res.header('Content-Type', 'text/html');
    res.send(this.template.render('partial/camera-overview.html', {
      ...commonData,
      user: req.auth.user,
      cameras: await this.cameraRepository.find(),
      mediamtx: {
        hls   : process.env.MEDIAMTX_HLS,
        webrtc: process.env.MEDIAMTX_WEBRTC,
      },
    }));
  }

  @Get("/user-overview.html")
  @Middleware(authenticated)
  @Middleware(requireAuthentication())
  async serveUserOverview(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) throw new Error();
    res.header('Content-Type', 'text/html');
    const users = await this.userRepository.findAll();
    console.log({ users });
    res.send(this.template.render('partial/user-overview.html', {
      ...commonData,
      user: req.auth.user,
      users: await this.userRepository.findAll(),
      mediamtx: {
        hls   : process.env.MEDIAMTX_HLS,
        webrtc: process.env.MEDIAMTX_WEBRTC,
      },
    }));
  }

  @Get("/camera-details/:name")
  @Middleware(authenticated)
  @Middleware(requireAuthentication())
  async serveCameraDetails(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) throw new Error();

    const camera = await this.cameraRepository.get((req.params as Record<string, string>).name);
    const data   = { ...commonData, user: req.auth.user, camera, recordingRange: false } as Record<string, any>;

    if (camera) {
      const rangeResponse = await this.recordingRangeQuery.execute(camera.name);
      if (rangeResponse.ok) {
        data.recordingRange = rangeResponse.range;
      }
    }

    res.header('Content-Type', 'text/html');
    res.send(this.template.render('partial/camera-details.html', data));
  }

}
