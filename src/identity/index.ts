export * from './controller';

// Bootstrap imports
import { Container         } from '@finwo/di';
import { CreateUserCommand } from './command/create-user';
import { UserRepository    } from './repository/user';

// Do the actual bootstrap
// Creates admin:admin user
setTimeout(async () => {
  const userRepository = Container.get(UserRepository);
  const found          = await userRepository.findAll({ limit: 1 });
  if (!found.length) {
    const createUserCommand = Container.get(CreateUserCommand);
    createUserCommand.execute({ user: 'admin', password: 'admin' });
  }
}, 0);
