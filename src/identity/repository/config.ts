import { Service    } from '@finwo/di';
import { Config     } from '@identity/model/config';

@Service()
export abstract class ConfigRepository {
  abstract get(): Promise<Config>;
  abstract put(config: Partial<Config>): Promise<boolean>;
};
