import { Controller, Get, Middleware, Req, Res } from '@finwo/router';
import authenticated from '@identity/middleware/authenticated';
import { GetUserQuery } from '@identity/query/get-user';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '@identity/model/authenticated-request';

@Controller("/api/v1/identity/user/current")
export class CurrentUserController {
  constructor(
    private query: GetUserQuery
  ) {}

  @Get()
  @Middleware(authenticated)
  async get(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) {
      res.statusCode = 401;
      return res.send({
        name   : 'UnauthorizedError',
        message: 'unauthorized',
      });
    }

    res.statusCode = 200;
    return res.send(req.auth.user);
  }

}
