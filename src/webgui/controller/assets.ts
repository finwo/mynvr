import { Controller, Get, Req, Res    } from '@finwo/router';
import { FastifyRequest, FastifyReply } from 'fastify';
import { readFileSync                 } from 'fs';
import { resolve                      } from 'path';
import   mime                           from 'mime-types';

const assetDir = resolve(__dirname, '../../../assets');

@Controller("/ui/assets")
export class AssetController {

  @Get("/htmx.js")
  async serveHtmx(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'application/javascript');
    const content = readFileSync(resolve(__dirname, '../../../node_modules/htmx.org/dist/htmx.min.js'));
    res.send(content);
  }

  @Get("/flatpickr.js")
  async serveEasepickJs(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'application/javascript');
    const content = readFileSync(resolve(__dirname, '../../../node_modules/flatpickr/dist/flatpickr.js'));
    res.send(content);
  }
  @Get("/flatpickr.css")
  async serveEasepickCss(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/css');
    const content = readFileSync(resolve(__dirname, '../../../node_modules/flatpickr/dist/flatpickr.css'));
    res.send(content);
  }

  @Get("/:filename")
  async serveAuthenticationBackground(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {

    // Basic filter
    const { filename } = req.params as Record<string, string>;
    if (!filename) {
      res.statusCode = 400;
      res.send({ ok: false, error: 'bad-request' });
    }

    // Static dir filter
    const fullPath = resolve(__dirname, '../../../assets', filename);
    if (fullPath.substring(0, assetDir.length) !== assetDir) {
      res.statusCode = 400;
      res.send({ ok: false, error: 'bad-request' });
    }

    res.header('Content-Type', mime.lookup(fullPath));
    const content = readFileSync(fullPath);
    res.send(content);
  }

}
