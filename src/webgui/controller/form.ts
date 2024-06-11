import { Controller, Post, Get, Req, Res, Middleware } from '@finwo/router';
import { FastifyRequest, FastifyReply                } from 'fastify';
import { readFileSync                                } from 'fs';
import { resolve                                     } from 'path';
import { Template                                    } from '@webgui/template';
import   mime                                          from 'mime-types';
import   authenticated                                 from '@identity/middleware/authenticated';
import   requireAuthentication                         from '@identity/middleware/require-authentication';
import { CameraRepository                            } from '@nvr/repository/camera';
import { isCamera, Camera                            } from '@nvr/model/camera';
import { AuthenticatedRequest                        } from '@identity/model/authenticated-request';
import { RecordingRangeQuery                         } from '@nvr/query/recording-range';

const assetDir = resolve(__dirname, '../../../assets');

@Controller("/ui/form")
export class FormController {
  constructor(
    private template: Template,
    private cameraRepository: CameraRepository,
  ) {}

  @Get("/camera-details.html")
  @Middleware(authenticated)
  @Middleware(requireAuthentication())
  async serveCameraDetails(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) throw new Error();
    res.header('Content-Type', 'text/html');

    const data = {
      site: {title:'MyNVR'},
      req: {
        query: req.query as Record<string, string>,
      },
      camera: undefined as (Camera | undefined)
    };

    if (data.req.query.camera) {
      data.camera = await this.cameraRepository.get(data.req.query.camera);
    }

    return res.send(this.template.render('form/camera-details.html', data));
  }

  @Post("/camera-details.html")
  @Middleware(authenticated)
  @Middleware(requireAuthentication())
  async handleCameraDetails(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) throw new Error();
    const isHtmx = (req.headers['hx-request'] && req.headers['hx-request'] == 'true');

    if (!isCamera(req.body)) {
      res.header('Content-Type', 'text/html');
      return res.send(this.template.render('form/camera-details.html', {
        error: 'Invalid data'
      }));
    }

    if (!(await this.cameraRepository.save(req.body))) {
      res.header('Content-Type', 'text/html');
      return res.send(this.template.render('form/camera-details.html', {
        error: 'Internal server error'
      }));
    }

    // Prevent duplicate camera upon name update
    const query = req.query as Record<string, string>;
    if (query.camera && (req.body.name !== query.camera)) {
      await this.cameraRepository.delete(query.camera);
    }

    if (isHtmx) {
      res.statusCode = 204;
      res.header('HX-Redirect', '/ui/cameras/' + req.body.name);
      return res.send();
    } else {
      res.statusCode = 302;
      res.header('Location', '/ui/cameras/' + req.body.name);
      return res.send();
    }
  }

}
