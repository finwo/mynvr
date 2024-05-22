import { Controller, Post, Req, Res } from '@finwo/router';
import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserCommand, Input as CommandInput, Output as CommandOutput } from '@identity/command/create-user';


@Controller("/api/v1/identity/user")
export class CreateUserController {
  constructor(
    private command: CreateUserCommand
  ) {}

  @Post()
  async post(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {
    const response = await this.command.execute(req.body as CommandInput);
    console.log({ input: req.body, output: response });
  }

}
