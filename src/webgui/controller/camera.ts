import { Controller, Middleware, Get, Delete, Res, Req } from '@finwo/router';
import { FastifyRequest, FastifyReply   } from 'fastify';
import { AuthenticatedRequest           } from '@identity/model/authenticated-request';
import   authenticated                    from '@identity/middleware/authenticated';
import   requireAuthentication            from '@identity/middleware/require-authentication';

import { Template } from '@webgui/template';
import { CameraRepository } from '@nvr/repository/camera';
import { RecordingExportQuery } from '@nvr/query/recording-export';

const commonData = {
  site: {
    title: 'MyNVR',
  },
};

@Controller("/ui/cameras")
export class CameraController {
  constructor(
    private template: Template,
    private cameraRepository: CameraRepository,
    private recordingExportQuery: RecordingExportQuery,
  ) {}

  @Get()
  async camerasPage(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/html');
    res.send(this.template.render('page/dashboard.html', {
      ...commonData,
    }));
  }

  @Get('/:name')
  async cameraPage(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/html');
    res.send(this.template.render('page/camera.html', {
      ...commonData,
      camera: {
        name: (req.params as Record<string, string>).name,
      },
      mediamtx: {
        hls   : process.env.MEDIAMTX_HLS,
        webrtc: process.env.MEDIAMTX_WEBRTC,
      },
    }));
  }

  @Get('/:name/export')
  @Middleware(authenticated)
  @Middleware(requireAuthentication())
  async cameraExport(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) throw new Error();
    const cameraName = (req.params as Record<string, string>).name;
    // const range      =

    return res.send('dinges');
  }

  @Delete('/:name')
  @Middleware(authenticated)
  @Middleware(requireAuthentication())
  async deleteCamera(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) throw new Error();
    const cameraName = (req.params as Record<string, string>).name;
    if (!cameraName) throw new Error();

    await this.cameraRepository.delete(cameraName);

    const isHtmx = (req.headers['hx-request'] && req.headers['hx-request'] == 'true');
    if (isHtmx) {
      res.statusCode = 204;
      res.header('HX-Redirect', '/ui/');
      return res.send();
    } else {
      res.statusCode = 302;
      res.header('Location', '/ui/');
      return res.send();
    }
  }

}
