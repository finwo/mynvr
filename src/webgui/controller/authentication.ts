import { Controller, Get, Post, Res, Req } from '@finwo/router';
import { ValidateUsernamePasswordQuery } from '@identity/query/validate-username-password';
import { GenerateAuthTokenCommand } from '@identity/command/generate-auth-token';
import { FastifyRequest, FastifyReply   } from 'fastify';
import { Template } from '@webgui/template';

import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
const ajv = new Ajv();

export const loginInputSchema = {
  title     : 'Login schema',
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

export type LoginInput = FromSchema<typeof loginInputSchema>;
export const isLoginInput: (subject:any)=>subject is LoginInput = ajv.compile(loginInputSchema);


@Controller("/ui")
export class AuthenticationController {
  constructor(
    private template: Template,
    private validateUsernamePasswordQuery: ValidateUsernamePasswordQuery,
    private generateAuthTokenCommand: GenerateAuthTokenCommand
  ) {}

  @Get()
  async loginPage(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/html');
    res.send(this.template.render('page/login'));
  }

  @Post("/login")
  async handleLogin(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {
    // res.header('Content-Type', 'text/html');

    if (!isLoginInput(req.body)) {
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

    const token = await this.generateAuthTokenCommand.execute(ident);
    if (!token) {
      res.statusCode = 500;
      res.header('Content-Type', 'application/json');
      return res.send({
        ok   : false,
        error: 'internal-error',
      });
    }

    res.send({
      ok: true,
      token,
    });
  }

}
