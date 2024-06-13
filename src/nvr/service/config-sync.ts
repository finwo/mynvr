import { Service } from '@finwo/di';
import { Config } from '@nvr/model/config';
import { ConfigRepository } from '@nvr/repository/config';

// type MediamtxPath = {
//   name: string;
// };
// type GetPathsResponse = {
//   itemCount: number;
//   pageCount: number;
//   items: MediamtxPath[];
// };

@Service()
export class ConfigSyncService {
  private baseUrl: string;

  constructor(
    private configRepository: ConfigRepository
  ) {
    this.baseUrl = process.env.MEDIAMTX_API || '';
    if (!this.baseUrl) throw new Error('Missing MEDIAMTX_API env var');

    this.configRepository.on('post-put', () => this.refreshConfig());
    this.refreshConfig();
  }

  async refreshConfig() {
    const config = await this.configRepository.get();

    const globalConfigUrl = `${this.baseUrl}/v3/config/global/patch`;
    const globalConfigResponse = await (await fetch(globalConfigUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rtsp      : true,
        api       : true,
        hlsAddress: ':8088',
      }),
    })).text();

    const pathDefaultsUrl = `${this.baseUrl}/v3/config/pathdefaults/patch`;
    const pathDefaultsResponse = await (await fetch(pathDefaultsUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.assign({
        sourceOnDemand        : false,
        record                : true,
        recordFormat          : 'fmp4',
        recordPath            : '/data/recordings/%path/%Y-%m-%d_%H-%M-%S-%f',
        recordSegmentDuration : '10m',
        recordDeleteAfter     : '336h',
      }, config)),
    })).text();

  }

}
