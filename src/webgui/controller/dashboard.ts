import { Controller, Middleware, Get, Res, Req } from '@finwo/router';
import { FastifyRequest, FastifyReply   } from 'fastify';
import { Template } from '@webgui/template';
import authenticated from '@identity/middleware/authenticated';

@Controller("/ui")
export class DashboardController {
  constructor(
    private template: Template
  ) {}

  @Get()
  async loginPage(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/html');
    res.send(this.template.render('page/dashboard.html', {
      site: {
        title: 'MyNVR'
      }
    }));
  }
}
