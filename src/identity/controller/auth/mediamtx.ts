import { Controller, Post, Req, Res } from '@finwo/router';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthMediamtxQuery, Input as QueryInput, Output as QueryOutput } from '@identity/query/auth/mediamtx';


@Controller("/api/v1/identity/auth/mediamtx")
export class IdentityAuthMediamtxController {
  constructor(
    private query: AuthMediamtxQuery
  ) {}

  @Post()
  async post(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {
    const response = await this.query.execute(req.body as QueryInput);

    if (response == QueryOutput.Ok                   ) res.statusCode = 200;
    if (response == QueryOutput.BadRequest           ) res.statusCode = 400;
    if (response == QueryOutput.AuthorizationRequired) res.statusCode = 401;
    if (response == QueryOutput.PermissionDenied     ) res.statusCode = 403;
  }

}
