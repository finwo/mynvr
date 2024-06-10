import { Controller, Middleware, Get, Res, Req } from '@finwo/router';
import { FastifyRequest, FastifyReply   } from 'fastify';

import { Template } from '@webgui/template';
import { CameraRepository } from '@nvr/repository/camera';

const commonData = {
  site: {
    title: 'MyNVR',
  },
};

@Controller("/ui")
export class PageController {
  constructor(
    private template: Template,
    private cameraRepository: CameraRepository,
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

  @Get('/cameras/:name')
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

  @Get('/users')
  async usersPage(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/html');
    res.send(this.template.render('page/users.html', {
      ...commonData,
    }));
  }

  @Get('/account')
  async accountPage(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/html');
    res.send(this.template.render('page/account.html', {
      ...commonData,
    }));
  }


}
