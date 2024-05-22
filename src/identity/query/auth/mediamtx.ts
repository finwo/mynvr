import { Service    } from '@finwo/di';
import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
import { CredentialRepository } from '@identity/repository/credential';
import { UserRepository       } from '@identity/repository/user';

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
    private credentialRepository: CredentialRepository,
    private userRepository      : UserRepository
  ) {}
  async execute(input: Input): Promise<Output> {
    if (!isInput(input)) return Output.BadRequest;
    if (!(input.user && input.password)) return Output.AuthorizationRequired;

    const user = await this.userRepository.getByUsername(input.user);
    if (!user) return Output.PermissionDenied;
    if (!user.id) return Output.PermissionDenied;

    const credentials = await this.credentialRepository.findByUser(user.id);
    if (!credentials.length) return Output.PermissionDenied;

    // for(const credential of credentials) {
    //   switch(credential.type) {
    //     case 'password':
    //     case
    //   }
    // }

    return Output.Ok;
  }
}
