import { Container } from '@finwo/di';
import { CredentialRepository as IdentityCredentialRepository } from '@identity/repository/credential';
import { UserRepository       as IdentityUserRepository       } from '@identity/repository/user';

import { IdentityCredentialJsonRepository } from '@storage-json/repository/identity-credential';
import { IdentityUserJsonRepository       } from '@storage-json/repository/identity-user';

Container.set(IdentityCredentialRepository, Container.get(IdentityCredentialJsonRepository));
Container.set(IdentityUserRepository      , Container.get(IdentityUserJsonRepository      ));
