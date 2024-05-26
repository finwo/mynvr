import { Controller, Get, Post, Res, Req } from '@finwo/router';
import { ValidateUsernamePasswordQuery } from '@identity/query/validate-username-password';
import { GenerateAuthTokenCommand } from '@identity/command/generate-auth-token';
import { FastifyRequest, FastifyReply   } from 'fastify';
import { Template } from '@webgui/template';

import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
const ajv = new Ajv();

export const authenticatePasswordInputSchema = {
  title     : 'Authenticate password input schema',
  type      : 'object',
  properties: {
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
  },
  required: [
    'username',
    'password',
  ],
} as const;

export type Input = FromSchema<typeof authenticatePasswordInputSchema>;
export const isInput: (subject:any)=>subject is Input = ajv.compile(authenticatePasswordInputSchema);

@Controller("/api/v1/identity/auth/password")
export class PasswordAuthenticationController {
  constructor(
    private validateUsernamePasswordQuery: ValidateUsernamePasswordQuery,
    private generateAuthTokenCommand: GenerateAuthTokenCommand
  ) {}

  // Authenticate by password
  @Post()
  async handlePost(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {

    if (!isInput(req.body)) {
      res.statusCode = 401;
      res.header('Content-Type', 'application/json');
      return res.send({
        ok   : false,
        error: 'invalid-input',
      });
    }

    const ident = await this.validateUsernamePasswordQuery.execute({ user: req.body.username, password: req.body.password });
    if (!ident) {
      res.statusCode = 403;
      res.header('Content-Type', 'application/json');
      return res.send({
        ok   : false,
        error: 'invalid-credentials',
      });
    }

    const tokenResponse = await this.generateAuthTokenCommand.execute(ident);
    if (!tokenResponse) {
      res.statusCode = 500;
      res.header('Content-Type', 'application/json');
      return res.send({
        ok   : false,
        error: 'internal-error',
      });
    }

    res.send(Object.assign({}, tokenResponse, { ok: true }));
  }

}
