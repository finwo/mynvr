import authControllers from './auth';
import userControllers from './user';

export const controllers = [
  ...authControllers,
  ...userControllers,
];
