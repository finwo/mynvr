import AuthControllers from './auth';
import UserControllers from './user';

export const Controllers = [
  ...AuthControllers,
  ...UserControllers,
];
