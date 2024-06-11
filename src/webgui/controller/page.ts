import { Controller, Get, Res } from '@finwo/router';
import { FastifyReply         } from 'fastify';
import { Template             } from '@webgui/template';

const commonData = {
  site: {
    title: 'MyNVR',
  },
};

@Controller("/ui")
export class PageController {
  constructor(
    private template: Template,
  ) {}

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
