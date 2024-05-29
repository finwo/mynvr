import { Controller, Get, Res, Req } from '@finwo/router';
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
    private template: Template
  ) {}

  @Get("/login")
  async loginPage(
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'text/html');
    res.send(this.template.render('page/login.html'));
  }
}
