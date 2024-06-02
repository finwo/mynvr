import { Service          } from '@finwo/di';
import { ConfigRepository, Callback } from '@nvr/repository/config';
import { Config, isConfig } from '@nvr/model/config';
import { TripleRepository, Triple } from './triple';

@Service()
export class NvrConfigJsonRepository extends ConfigRepository {
  private _listeners: Record<string, Callback<Partial<Config>>[]> = {};

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
    await this.emit('pre-put', config);
    let stillValid = true;
    for(const [key, value] of Object.entries(config)) {
      stillValid = await this.tripleRepository.put({
        subject  : 'nvr-config',
        predicate: key as string,
        object   : value as string,
      });
      if (!stillValid) {
        await this.emit('post-put', config);
        return false;
      }
    }
    await this.emit('post-put', config);
    return true;
  }

  on(name: string, fn: Callback<Partial<Config>>): void {
    if (!(name in this._listeners)) this._listeners[name] = [];
    this._listeners[name].push(fn);
  }

  async emit(name: string, subject: Partial<Config>): Promise<void> {
    for(const fn of (this._listeners[name]||[])) {
      await fn(subject);
    }
  }
}
