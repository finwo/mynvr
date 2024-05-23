import { Controller, Get, Post, Res, Req } from '@finwo/router';
import { FastifyRequest, FastifyReply   } from 'fastify';

import cookiePage from '@webgui/template/page/cookies';

@Controller("/ui")
export class LegalController {

  @Get("/use-of-cookies")
  async cookiePage(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/html');
    res.send(cookiePage());
  }

}
