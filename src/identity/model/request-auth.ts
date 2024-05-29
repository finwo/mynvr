import { User } from './user';

export type RequestAuth =
  false |
  {
    user: User,
  };
