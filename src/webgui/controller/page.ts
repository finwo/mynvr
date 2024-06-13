import { Controller, Get, Req, Res    } from '@finwo/router';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Template                     } from '@webgui/template';
import { existsSync                   } from 'fs';

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

  @Get('/:name')
  async dynamicPage(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    let page = (req.params as Record<string, string>).name;
    const filename = __dirname+`/../template/page/${page}.html`;
    if (!existsSync(filename)) {
      console.log({ filename });
      res.statusCode = 404;
      page = '404';
    }
    res.header('Content-Type', 'text/html');
    res.send(this.template.render(`page/${page}.html`, {
      ...commonData,
    }));
  }

}
