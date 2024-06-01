import { Controller, Post, Req, Res } from '@finwo/router';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ValidateUsernamePasswordQuery, isInput, Input, Output } from '@identity/query/validate-username-password';


@Controller("/api/v1/identity/auth/mediamtx")
export class IdentityAuthMediamtxController {
  constructor(
    private query: ValidateUsernamePasswordQuery
  ) {}

  @Post()
  async post(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {
    console.log('Mediamtx requested auth');

    // Sanity check
    if (!isInput(req.body)) {
      res.statusCode = 401;
      return;
    };

    // Actual permission check
    const response = await this.query.execute(req.body);
    if (!response) {
      res.statusCode = 403;
      return;
    }

    // Done
    res.statusCode = 204;
    return;
  }

}
