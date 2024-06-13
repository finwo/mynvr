import { Controller, Middleware, Get, Delete, Res, Req } from '@finwo/router';
import { FastifyRequest, FastifyReply   } from 'fastify';
import { AuthenticatedRequest           } from '@identity/model/authenticated-request';
import   authenticated                    from '@identity/middleware/authenticated';
import   requireAuthentication            from '@identity/middleware/require-authentication';

import { Template } from '@webgui/template';
import { UserRepository } from '@identity/repository/user';
import { CredentialRepository } from '@identity/repository/credential';

const commonData = {
  site: {
    title: 'MyNVR',
  },
};

@Controller("/ui/users")
export class UserController {
  constructor(
    private template: Template,
    private userRepository: UserRepository,
    private credentialRepository: CredentialRepository,
  ) {}

  @Get('/:id')
  async userPage(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/html');
    res.send(this.template.render('page/user.html', {
      ...commonData,
      user: {
        id: (req.params as Record<string, string>).id,
      },
      mediamtx: {
        hls   : process.env.MEDIAMTX_HLS,
        webrtc: process.env.MEDIAMTX_WEBRTC,
      },
    }));
  }

  @Delete('/:id')
  @Middleware(authenticated)
  @Middleware(requireAuthentication())
  async deleteUser(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) throw new Error();
    const userId = (req.params as Record<string, string>).id;
    if (!userId) throw new Error();
    await this.userRepository.deleteById(userId);

    const credentials = await this.credentialRepository.findByUser(userId);
    for(const credential of credentials) {
      if (!credential.id) continue;
      await this.credentialRepository.deleteById(credential.id);
    }

    const isHtmx = (req.headers['hx-request'] && req.headers['hx-request'] == 'true');
    if (isHtmx) {
      res.statusCode = 204;
      res.header('HX-Redirect', '/ui/users/');
      return res.send();
    } else {
      res.statusCode = 302;
      res.header('Location', '/ui/users/');
      return res.send();
    }
  }

}
