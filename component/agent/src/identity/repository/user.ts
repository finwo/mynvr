import { Service } from '@finwo/di';
import { User    } from '../model/user';

@Service()
export abstract class UserRepository {
  abstract getByUsername(username: string): Promise<User|undefined>;
  abstract getById(userId: string): Promise<User|undefined>;
  abstract deleteById(userId: string): Promise<boolean>;
  abstract save(user: User): Promise<boolean>;
};
