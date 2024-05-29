import { Controller, Get, Req, Res, Middleware } from '@finwo/router';
import { FastifyReply                          } from 'fastify';
import { AuthenticatedRequest                  } from '@identity/model/authenticated-request';
import   authenticated                           from '@identity/middleware/authenticated';
import { Template                              } from '@webgui/template';

@Controller("/ui/partial")
export class PartialController {
  constructor(
    private template: Template
  ) {}

  @Get("/nav.html")
  @Middleware(authenticated)
  async serveNav(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) {
      res.statusCode = 204;
      res.header('HX-Redirect', '/ui/login');
      return res.send();
    }

    res.header('Content-Type', 'text/html');
    res.send(this.template.render('partial/nav.html', {
      user: req.auth.user,
      site: {
        title: 'MyNVR',
      }
    }));
  }

}
