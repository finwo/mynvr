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
    if (!cameraName) throw new Error();

    const { start, end } = req.query as Record<string, string>;
    if (!start) throw new Error();
    if (!end) throw new Error();

    const response = await this.recordingExportQuery.execute({
      camera: cameraName,
      range: {
        start,
        end,
      },
    });

    if (response.ok) {
      res.hijack();
      res.raw.setHeader('Content-Type', 'video/mp4');
      response.data.pipe(res.raw);
      return;
    }

    res.statusCode = 500;
    res.send(response.error);
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
