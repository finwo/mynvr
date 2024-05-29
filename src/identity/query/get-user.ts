import { Service        } from '@finwo/di';
import { Ajv            } from 'ajv';
import { FromSchema     } from 'json-schema-to-ts';
import { UserRepository } from '@identity/repository/user';
import { User           } from '@identity/model/user';

const ajv = new Ajv();

export const inputSchema = {
  title     : 'Validate auth token input schema',
  type      : 'object',
  properties: {
    userId: {
      type: 'string',
    },
  },
  required: [
    'userId',
  ],
} as const;

export type Input = FromSchema<typeof inputSchema>;
export const isInput: (subject:unknown)=>subject is Input = ajv.compile(inputSchema);

export type Output =
  { ok: false, error: string } |
  { ok: true , user : User   }
  ;

@Service()
export class GetUserQuery {
  constructor(
    private userRepository: UserRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    if (!isInput(input)) return { ok: false, error: 'invalid-input' };
    if (!input.userId) return { ok: false, error: 'invalid-input' };

    const user = await this.userRepository.getById(input.userId);
    if (!user) return { ok: false, error: 'not-found' };

    return {
      ok: true,
      user,
    };
  }
}
