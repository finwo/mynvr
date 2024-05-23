import { Service          } from '@finwo/di';
import { v4 as uuidv4     } from 'uuid';
import { ConfigRepository } from '@identity/repository/config';
import { Config, isConfig } from '@identity/model/config';
import { TripleRepository, Triple } from './triple';

const storageFile = (process.env.STORAGE_DIR || '/data') + '/users.json';

@Service()
export class IdentityConfigJsonRepository extends ConfigRepository {
  constructor(
    private tripleRepository: TripleRepository
  ) {
    super();
  }

  async get(): Promise<Config> {
    return (await this.tripleRepository.find({ subject: 'identity-config' }))
      .reduce((r:Config,a) => {
        r[a.predicate] = a.object;
        return r;
      }, {}) as Config;
  }

  async put(config: Partial<Config>): Promise<boolean> {
    let stillValid = true;
    for(const [key, value] of Object.entries(config)) {
      stillValid = await this.tripleRepository.put({
        subject  : 'identity-config',
        predicate: key as string,
        object   : value as string,
      });
      if (!stillValid) return false;
    }
    return true;
  }
}
