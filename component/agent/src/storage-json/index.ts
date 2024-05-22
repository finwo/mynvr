import { Container } from '@finwo/di';
import { CredentialRepository as IdentityCredentialRepository } from '../identity/repository/credential';
import { UserRepository       as IdentityUserRepository       } from '../identity/repository/user';

import { IdentityCredentialJsonRepository } from './repository/identity-credential';
import { IdentityUserJsonRepository       } from './repository/identity-user';

Container.set(IdentityCredentialRepository, Container.get(IdentityCredentialJsonRepository));
Container.set(IdentityUserRepository      , Container.get(IdentityUserJsonRepository      ));


// import { Sequelize, Model, ModelStatic, ModelAttributes, Optional, Attributes } from 'sequelize';
// type newable     = { new(...args: any[]): any } & ModelStatic<Model<any, any>>;
// const sequelize  = new Sequelize(process.env.DATABASE_URL || 'mysql://user:password@localhost:3306/mynvr');
//
// export const Entity = (schema: ModelAttributes<InstanceType<newable>, Optional<Attributes<InstanceType<newable>>, any>>) => {
//   return function<T extends newable>(constructor: T, context: ClassDecoratorContext<T>) {
//     constructor.init(schema, { sequelize });
//   };
// };
