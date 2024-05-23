import { Service    } from '@finwo/di';
import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
import { CredentialRepository          } from '@identity/repository/credential';
import { UserRepository                } from '@identity/repository/user';
import { ValidateUsernamePasswordQuery } from '@identity/query/validate-username-password';

const ajv = new Ajv();

export const inputSchema = {
  title     : 'Auth mediamtx query input schema',
  type      : 'object',
  properties: {
    user: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
    ip: {
      type: 'string',
    },
    action: {
      enum: ['publish','read','playback','api','metrics','pprof'],
    },
    path: {
      type: 'string',
    },
    protocol: {
      enum: ['rtsp','rtmp','hls','webrtc','srt'],
    },
    id: {
      type: 'string',
    },
    query: {
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
  Ok                    = 200,
  BadRequest            = 400,
  AuthorizationRequired = 401,
  PermissionDenied      = 403,
};

@Service()
export class AuthMediamtxQuery {
  constructor(
    private credentialRepository         : CredentialRepository,
    private userRepository               : UserRepository,
    private validateUsernamePasswordQuery: ValidateUsernamePasswordQuery,
  ) {}
  async execute(input: Input): Promise<Output> {
    if (!isInput(input)) return Output.BadRequest;
    if (!(input.user && input.password)) return Output.AuthorizationRequired;

    const validateResponse = this.validateUsernamePasswordQuery.execute(input);
    if (!validateResponse) return Output.PermissionDenied;

    return Output.Ok;
  }
}
