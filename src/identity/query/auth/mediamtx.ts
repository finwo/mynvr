import { Service } from '@finwo/di';
import { CredentialRepository } from '@identity/repository/credential';

export type AuthMediamtxQueryData = {
  user     : string;
  password : string;
  ip      ?: string;
  action  ?: "publish"|"read"|"playback"|"api"|"metrics"|"pprof";
  path    ?: string;
  protocol?: "rtsp"|"rtmp"|"hls"|"webrtc"|"srt";
  id      ?: string;
  query   ?: string;
};

export type AuthMediamtxQueryResponse = boolean;

@Service()
export class AuthMediamtxQuery {
  constructor(
    private credentialRepository: CredentialRepository
  ) {}
  async execute(data: AuthMediamtxQueryData): Promise<AuthMediamtxQueryResponse> {
    return false;
  }
}
