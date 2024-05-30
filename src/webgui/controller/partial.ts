import { URL                                   } from 'url';
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

    // Parse & normalize referer
    const referer = new URL(req.headers['hx-current-url'] || req.headers.referer || '');
    if (referer.pathname.substring(referer.pathname.length-1) == '/') {
      referer.pathname = referer.pathname.substring(0, referer.pathname.length - 1);
    }

    res.header('Content-Type', 'text/html');
    res.send(this.template.render('partial/nav.html', {
      referer,
      user: req.auth.user,
      site: {
        title: 'MyNVR',
      }
    }));
  }

}
