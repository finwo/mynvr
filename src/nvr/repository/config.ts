import { Service    } from '@finwo/di';
import { Config     } from '@nvr/model/config';

export type Callback<T> = (arg0:T)=>void;

@Service()
export abstract class ConfigRepository {
  abstract get(): Promise<Config>;
  abstract put(config: Partial<Config>): Promise<boolean>;
  abstract on(name: string, fn: Callback<Partial<Config>>): void;
  abstract emit(name: string, subject: Partial<Config>): Promise<void>;
};
