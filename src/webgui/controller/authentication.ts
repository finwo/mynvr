import { Controller, Get, Res    } from '@finwo/router';
import { FastifyRequest, FastifyReply } from 'fastify';

import loginPage from '@webgui/template/page/login';

@Controller("/ui/")
export class AuthenticationController {

  @Get()
  async loginPage(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/html');
    res.send(loginPage());
  }

}
