import { Service          } from '@finwo/di';
import { v4 as uuidv4     } from 'uuid';

import { ConfigRepository } from '@nvr/repository/config';
import { Config, isConfig } from '@nvr/model/config';
import { TripleRepository, Triple } from './triple';

@Service()
export class NvrConfigJsonRepository extends ConfigRepository {
  constructor(
    private tripleRepository: TripleRepository
  ) {
    super();
  }

  async get(): Promise<Config> {
    return (await this.tripleRepository.find({ subject: 'nvr-config' }))
      .reduce((r:Config,a) => {
        r[a.predicate] = a.object;
        return r;
      }, {}) as Config;
  }

  async put(config: Partial<Config>): Promise<boolean> {
    let stillValid = true;
    for(const [key, value] of Object.entries(config)) {
      stillValid = await this.tripleRepository.put({
        subject  : 'nvr-config',
        predicate: key as string,
        object   : value as string,
      });
      if (!stillValid) return false;
    }
    return true;
  }
}
