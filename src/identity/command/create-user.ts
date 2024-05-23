import { Service    } from '@finwo/di';
import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
import { pbkdf2Sync } from 'pbkdf2';
import { CredentialRepository } from '@identity/repository/credential';
import { UserRepository       } from '@identity/repository/user';
import { Credential           } from '@identity/model/credential';
import { User, isUser         } from '@identity/model/user';

const ajv = new Ajv();

export const inputSchema = {
  title     : 'Create user input schema',
  type      : 'object',
  properties: {
    user: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
  },
  required: [
    'user',
    'password',
  ],
} as const;

export type Input = FromSchema<typeof inputSchema>;
export const isInput: (subject:unknown)=>subject is Input = ajv.compile(inputSchema);

export enum Output {
  Ok            = 200,
  BadRequest    = 400,
  Conflict      = 409,
  InternalError = 500,
};

@Service()
export class CreateUserCommand {
  constructor(
    private credentialRepository: CredentialRepository,
    private userRepository      : UserRepository
  ) {}
  async execute(input: Input): Promise<Output> {
    if (!isInput(input)) return Output.BadRequest;

    // Prevent double username
    const found = await this.userRepository.getByUsername(input.user);
    if (found) return Output.Conflict;

    // Create the user
    const user: Partial<User> = { username: input.user };
    await this.userRepository.save(user);
    if (!isUser(user)) return Output.InternalError;

    // TODO: let this make use of the make-credential command
    const credential: Credential = {
      userId     : user.id,
      type       : 'password',
      descriptor : 'pbkdf2:10000:sha512:' + pbkdf2Sync(input.password, input.user, 10000, 32, 'sha512').toString('hex'),
    };
    await this.credentialRepository.save(credential);
    if (!credential.id) return Output.InternalError;

    return Output.Ok;
  }
}
