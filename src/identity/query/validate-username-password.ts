import { Service    } from '@finwo/di';
import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
import { pbkdf2Sync } from 'pbkdf2';
import { CredentialRepository } from '@identity/repository/credential';
import { UserRepository       } from '@identity/repository/user';
import { Credential           } from '@identity/model/credential';
import { User                 } from '@identity/model/user';

const ajv = new Ajv();

export const inputSchema = {
  title     : 'Validate username-password input schema',
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

export type Output = false | { user: User, credential: Credential };

@Service()
export class ValidateUsernamePasswordQuery {
  constructor(
    private credentialRepository: CredentialRepository,
    private userRepository      : UserRepository
  ) {}
  async execute(input: Input): Promise<Output> {
    if (!isInput(input)) return false;
    if (!(input.user && input.password)) return false;

    const user = await this.userRepository.getByUsername(input.user);
    if (!user) return false;
    if (!user.id) return false;

    const credentials = await this.credentialRepository.findByUser(user.id);
    if (!credentials.length) return false;

    for(const credential of credentials) {
      if (credential.type != 'password') continue;
      const [scheme, ...args] = credential.descriptor.split(':');

      switch(scheme) {
        case 'pbkdf2':
          const iterations = parseInt(args[0]);
          const hash       = args[1];
          const digest     = args[2];
          const length     = digest.length / 2;
          const validator  = pbkdf2Sync(input.password, input.user, iterations, length, hash).toString('hex');
          if (digest != validator) continue;
          return { user, credential };
        default:
          // Unsupported
          continue;
      }
    }

    return false;
  }
}
