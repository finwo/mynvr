import { Service                  } from '@finwo/di';
import { v4 as uuidv4             } from 'uuid';
import { CredentialRepository     } from '@identity/repository/credential';
import { Credential, isCredential } from '@identity/model/credential';
import { readFileSync, existsSync, writeFileSync } from 'fs';

const storageFile = (process.env.STORAGE_DIR || '/data') + '/credentials.json';

@Service()
export class IdentityCredentialJsonRepository extends CredentialRepository {

  private getContents(): Credential[] {
    try {
      return JSON.parse(existsSync(storageFile) ? readFileSync(storageFile).toString() : '[]');
    } catch {
      return [];
    }
  }

  private putContents(contents: Credential[]) {
    writeFileSync(storageFile, JSON.stringify(contents));
  }

  async getById(credentialId: string): Promise<Credential|undefined> {
    return this
      .getContents()
      .find(entry => {
        if (!isCredential(entry)) return false;
        return entry.id == credentialId;
      })
      ;
  }

  async findByUser(userId: string): Promise<Credential[]> {
    return this
      .getContents()
      .filter(entry => {
        if (!isCredential(entry)) return false;
        return entry.userId == userId;
      })
  }

  async deleteById(credentialId: string): Promise<boolean> {
    this.putContents(this.getContents().filter(entry => {
      if (!isCredential(entry)) return false;
      return entry.id !== credentialId;
    }));
    return true;
  }

  async save(credential: Credential): Promise<boolean> {
    if (!credential.id) credential.id = uuidv4();
    const contents = this.getContents().filter(entry => {
      if (!isCredential(entry)) return false;
      return entry.id !== credential.id;
    });
    contents.push(credential);
    this.putContents(contents);
    return true;
  }

}
