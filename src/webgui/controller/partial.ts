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
import { CameraRepository                      } from '@nvr/repository/camera';

const partialDir = resolve(__dirname, '../template/partial');

@Controller("/ui/partial")
export class PartialController {
  constructor(
    private template: Template,
    private cameraRepository: CameraRepository
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
      referer,
      user: req.auth.user,
      site: {
        title: 'MyNVR',
      }
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
      user: req.auth.user,
      site: {
        title: 'MyNVR',
      },
      cameras: await this.cameraRepository.find(),
    }));
  }


}
