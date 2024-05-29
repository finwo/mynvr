import { Service    } from '@finwo/di';
import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
import { pbkdf2Sync } from 'pbkdf2';
import   base64url    from 'base64url';
import { KeyPair          } from 'supercop';
import { ConfigRepository     } from '@identity/repository/config';
import { CredentialRepository } from '@identity/repository/credential';
import { UserRepository       } from '@identity/repository/user';
import { Credential           } from '@identity/model/credential';
import { User                 } from '@identity/model/user';

const ajv = new Ajv();

export const inputSchema = {
  title     : 'Validate auth token input schema',
  type      : 'object',
  properties: {
    token: {
      type: 'string',
    },
  },
  required: [
    'token',
  ],
} as const;

export type Input = FromSchema<typeof inputSchema>;
export const isInput: (subject:unknown)=>subject is Input = ajv.compile(inputSchema);

// export type Output = false | { user: User, credential: Credential };
export type Output =
  { ok: false, error: string } |
  { ok: true , user : User   }
  ;

@Service()
export class ValidateAuthTokenQuery {
  private kp: Promise<KeyPair>;

  constructor(
    private credentialRepository: CredentialRepository,
    private userRepository      : UserRepository,
    private configRepository    : ConfigRepository
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

  async execute(input: Input): Promise<Output> {
    if (!isInput(input)) return { ok: false, error: 'invalid-input' };
    if (!input.token) return { ok: false, error: 'invalid-input' };

    const now = Math.floor(Date.now() / 1000);
    const year = 3600 * 24 * 365;

    // Encoding structure checking
    const [header, body, signature] = input.token.split('.');
    if (!(header && body && signature)) return { ok: false, error: 'invalid-structure' };

    // Check header info
    // Note: this only supports ed25519 jwt tokens
    const headerData = JSON.parse(base64url.decode(header));
    if ((!headerData) || ('object' !== typeof headerData)) return { ok: false, error: 'invalid-header' };
    if (headerData.typ !== 'JWT'    ) return { ok: false, error: 'invalid-type'      };
    if (headerData.alg !== 'ED25519') return { ok: false, error: 'invalid-algorithm' };

    // Validate signature
    // No point fetching info from db if invalid
    const kp             = await this.kp;
    const signContent    = header + '.' + body;
    const validSignature = await kp.verify(base64url.toBuffer(signature), signContent);
    if (!validSignature) return { ok: false, error: 'invalid-signature' };

    // Here = confirmed token to be from us
    const bodyData = JSON.parse(base64url.decode(body));
    if ((!bodyData) || ('object' !== typeof bodyData)) return { ok: false, error: 'invalid-body' };

    // Ensure the token has expiry
    if (!('iat' in bodyData)) return { ok: false, error: 'missing-iat' };
    if (!('exp' in bodyData)) return { ok: false, error: 'missing-exp' };

    // Reject tokens valid for too long
    if ((parseInt(bodyData.exp) - parseInt(bodyData.iat)) > year) return { ok: false, error: 'too-long' };

    // Timing validation
    if (parseInt(bodyData.exp) < now) return { ok: false, error: 'expired' };
    if (parseInt(bodyData.iat) > now) return { ok: false, error: 'too-soon' };

    const user = await this.userRepository.getById(bodyData.sub);
    if (!user) return { ok: false, error: 'invalid-body-sub' };

    return {
      ok: true,
      user,
    };
  }
}
