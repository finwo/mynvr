import { Controller, Get, Res } from '@finwo/router';
import { FastifyReply } from 'fastify';
import { Template     } from '@webgui/template';

@Controller()
class IndexController {
  constructor(
    private template: Template
  ) {}
  @Get('/ui')
  redirect(
    @Res() res: FastifyReply
  ) {
    res.redirect('/ui/cameras/');
  }
}

export const controllers = [
  IndexController,
  require('./camera').CameraController,
  require('./assets').AssetController,
  require('./authentication').AuthenticationController,
  require('./form').FormController,
  require('./partial').PartialController,
  require('./page').PageController,
  require('./snapshot').SnapshotController,
];
