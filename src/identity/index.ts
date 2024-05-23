import { createSeed, KeyPair } from 'supercop';

export * from './controller';

// Bootstrap imports
import { Container         } from '@finwo/di';
import { CreateUserCommand } from './command/create-user';
import { ConfigRepository  } from './repository/config';
import { UserRepository    } from './repository/user';

// User bootstrap
// Creates admin:admin user
setTimeout(async () => {
  const userRepository = Container.get(UserRepository);
  const found          = await userRepository.findAll({ limit: 1 });
  if (!found.length) {
    const createUserCommand = Container.get(CreateUserCommand);
    createUserCommand.execute({ user: 'admin', password: 'admin' });
  }
}, 0);

// Authentication keypair bootstrap
setTimeout(async () => {
  const configRepository = Container.get(ConfigRepository);
  const found            = await configRepository.get();

  if (!(found.authkey_pub && found.authkey_sec)) {
    const kp = await KeyPair.create(createSeed());
    if (!kp.publicKey) throw new Error("Could not generate authentication key");
    if (!kp.secretKey) throw new Error("Could not generate authentication key");
    found.authkey_alg = 'supercop';
    found.authkey_pub = Buffer.from(kp.publicKey).toString('hex');
    found.authkey_sec = Buffer.from(kp.secretKey).toString('hex');
    await configRepository.put(found);
  }
  console.log({ found });
}, 0);
