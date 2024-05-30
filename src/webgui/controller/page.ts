import { Controller, Middleware, Get, Res, Req } from '@finwo/router';
import { FastifyRequest, FastifyReply   } from 'fastify';
import { Template } from '@webgui/template';

@Controller("/ui")
export class PageController {
  constructor(
    private template: Template
  ) {}

  @Get()
  async camerasPage(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/html');
    res.send(this.template.render('page/dashboard.html', {
      site: {
        title: 'MyNVR'
      }
    }));
  }

  @Get('/users')
  async usersPage(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/html');
    res.send(this.template.render('page/users.html', {
      site: {
        title: 'MyNVR'
      }
    }));
  }

  @Get('/account')
  async accountPage(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/html');
    res.send(this.template.render('page/account.html', {
      site: {
        title: 'MyNVR'
      }
    }));
  }

}
