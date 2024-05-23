import { Container } from '@finwo/di';

import { ConfigRepository     as IdentityConfigRepository     } from '@identity/repository/config';
import { CredentialRepository as IdentityCredentialRepository } from '@identity/repository/credential';
import { UserRepository       as IdentityUserRepository       } from '@identity/repository/user';

import { IdentityConfigJsonRepository     } from '@storage-json/repository/identity-config';
import { IdentityCredentialJsonRepository } from '@storage-json/repository/identity-credential';
import { IdentityUserJsonRepository       } from '@storage-json/repository/identity-user';

Container.set(IdentityConfigRepository    , Container.get(IdentityConfigJsonRepository    ));
Container.set(IdentityCredentialRepository, Container.get(IdentityCredentialJsonRepository));
Container.set(IdentityUserRepository      , Container.get(IdentityUserJsonRepository      ));
