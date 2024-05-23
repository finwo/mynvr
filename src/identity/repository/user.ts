import { Service } from '@finwo/di';
import { User    } from '@identity/model/user';

export type FindOptions = {
  limit?: number;
};

@Service()
export abstract class UserRepository {
  abstract findAll(options?: FindOptions): Promise<User[]>;
  abstract getByUsername(username: string): Promise<User|undefined>;
  abstract getById(userId: string): Promise<User|undefined>;
  abstract deleteById(userId: string): Promise<boolean>;
  abstract save(user: Partial<User>): Promise<boolean>;
};
