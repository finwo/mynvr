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
      }, config)),
    })).text();

    console.log({ config, pathDefaultsResponse });

          // sourceOnDemand : false,
          // record         : true,

    // const cameras = await this.cameraRepository.find();
    //
    // const getPathsUrl = `${this.baseUrl}/v3/paths/list`;
    // const response = await (await fetch(getPathsUrl)).json() as GetPathsResponse;
    //
    // // Build mutation lists
    // const addList = cameras.filter(need => {
    //   return !response.items.find(found => need.name == found.name);
    // });
    // const removeList = response.items.filter(found => {
    //   return !cameras.find(need => need.name == found.name);
    // });
    //
    // // Add new cameras
    // for(const need of addList) {
    //   const addPathUrl = `${this.baseUrl}/v3/config/paths/add/${need.name}`;
    //   const addResponse = await fetch(addPathUrl, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       name           : need.name,
    //       source         : need.source,
    //       sourceOnDemand : false,
    //       record         : true,
    //       recordPath     : `${process.env.RECORDING_DIR}/%path/%Y-%m-%d_%H-%M-%S-%f`,
    //     }),
    //   });
    // }
    //
    // // Remove old cameras
    // for(const found of removeList) {
    //   const removePathUrl = `${this.baseUrl}/v3/config/paths/delete/${found.name}`;
    //   const removeResponse = await fetch(removePathUrl, {
    //     method: 'DELETE',
    //   });
    // }
    //
    // // TODO: update existing
  }

}
