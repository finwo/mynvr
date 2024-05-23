import { Controller, Get, Req, Res    } from '@finwo/router';
import { FastifyRequest, FastifyReply } from 'fastify';
import { readFileSync                 } from 'fs';
import { resolve                      } from 'path';

@Controller("/ui/assets")
export class AssetController {

  @Get("/htmx.js")
  async serveHtmx(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'application/javascript');
    const content = readFileSync(resolve(__dirname, '../../../node_modules/htmx.org/dist/htmx.js'));
    res.send(content);
  }

  @Get("/authentication.jpeg")
  async serveAuthenticationBackground(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'image/jpeg');
    const content = readFileSync(resolve(__dirname, '../../../assets/authentication-background.jpeg'));
    res.send(content);
  }

}
