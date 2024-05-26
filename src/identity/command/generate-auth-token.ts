import { Service    } from '@finwo/di';
import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
import   base64url    from 'base64url';
import { ConfigRepository } from '@identity/repository/config';
import { KeyPair          } from 'supercop';
import { userSchema       } from '../model/user';
import { credentialSchema } from '../model/credential';

// import { CredentialRepository } from '@identity/repository/credential';
// import { UserRepository       } from '@identity/repository/user';
// import { Credential           } from '@identity/model/credential';
// import { User, isUser         } from '@identity/model/user';

const ajv = new Ajv();

export const inputSchema = {
  title     : 'Generate auth token input schema',
  type      : 'object',
  properties: {
    user      : userSchema,
    credential: credentialSchema,
  },
  required: [
    'user',
    'credential',
  ],
} as const;

export type Input = FromSchema<typeof inputSchema>;
export const isInput: (subject:unknown)=>subject is Input = ajv.compile(inputSchema);

@Service()
export class GenerateAuthTokenCommand {
  private kp: Promise<KeyPair>;

  constructor(
    private configRepository: ConfigRepository
  ) {
    this.kp = (async () => {
      const cfg = await this.configRepository.get();
      if (!cfg.authkey_pub) throw new Error("Error loading auth key");
      if (!cfg.authkey_sec) throw new Error("Error loading auth key");
      return KeyPair.from({
        publicKey: Buffer.from(cfg.authkey_pub, 'hex'),
        secretKey: Buffer.from(cfg.authkey_sec, 'hex'),
      });
    })();
  }

  async execute(input: Input) {
    if (!isInput(input)) return false;

    const kp  = await this.kp;
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (3600 * 24 * 7);

    const headerData: Record<string, string|number> = {
      alg: 'ED25519',
      typ: 'JWT',
    };
    const bodyData: Record<string, string|number> = {
      sub: input.user.id,
      iat: now,
      exp: exp,
    };

    const header    = base64url.encode(JSON.stringify(headerData));
    const body      = base64url.encode(JSON.stringify(bodyData));
    const signature = base64url.encode(await kp.sign(header + '.' + body));

    return {
      token : header + '.' + body + '.' + signature,
      claims: bodyData,
    };
  }
}
