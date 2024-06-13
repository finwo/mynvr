import { Controller, Middleware, Get, Delete, Res, Req } from '@finwo/router';
import { FastifyRequest, FastifyReply   } from 'fastify';
import { AuthenticatedRequest           } from '@identity/model/authenticated-request';
import   authenticated                    from '@identity/middleware/authenticated';
import   requireAuthentication            from '@identity/middleware/require-authentication';

import { Template } from '@webgui/template';
import { CameraRepository } from '@nvr/repository/camera';
import { RecordingExportQuery } from '@nvr/query/recording-export';

const commonData = {
  site: {
    title: 'MyNVR',
  },
};

@Controller("/ui/users")
export class UserController {
  constructor(
    private template: Template,
    // private cameraRepository: CameraRepository,
    // private recordingExportQuery: RecordingExportQuery,
  ) {}

  @Get()
  async usresPage(
    @Res() res: FastifyReply
  ) {
    console.log('User controller');
    res.header('Content-Type', 'text/html');
    res.send(this.template.render('page/users.html', {
      ...commonData,
    }));
  }

}
