import { Service    } from '@finwo/di';
import { Credential } from '../model/credential';
import { User       } from '../model/user';

@Service()
export abstract class CredentialRepository {
  abstract findByUser(userId: string): Promise<Credential[]>;
  abstract getById(credentialId: string): Promise<Credential|undefined>;
  abstract deleteById(credentialId: string): Promise<boolean>;
  abstract save(credential: Credential): Promise<boolean>;
};
