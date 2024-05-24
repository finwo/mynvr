import { Controller, Get, Post, Res, Req } from '@finwo/router';
import { FastifyRequest, FastifyReply   } from 'fastify';
import { Template } from '@webgui/template';

// import cookiePage from '@webgui/template/page/cookies';

@Controller("/ui")
export class LegalController {
  constructor(
    private template: Template
  ) {}

  @Get("/use-of-cookies")
  async cookiePage(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/html');
    res.send(this.template.render('page/cookies'));
    // res.send(cookiePage());
  }

}
