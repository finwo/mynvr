import { Service        } from '@finwo/di';
import { v4 as uuidv4   } from 'uuid';
import { UserRepository } from '../../identity/repository/user';
import { User, isUser   } from '../../identity/model/user';
import { readFileSync, existsSync, writeFileSync } from 'fs';

const storageFile = (process.env.STORAGE_DIR || '/data') + '/users.json';

@Service()
export class IdentityUserJsonRepository extends UserRepository {

  private getContents(): User[] {
    return JSON.parse(existsSync(storageFile) ? readFileSync(storageFile).toString() : '[]');
  }

  private putContents(contents: User[]) {
    writeFileSync(storageFile, JSON.stringify(contents));
  }

  async getById(userId: string): Promise<User|undefined> {
    return this
      .getContents()
      .find(entry => {
        if (!isUser(entry)) return false;
        return entry.id === userId;
      })
      ;
  }

  async getByUsername(username: string): Promise<User|undefined> {
    return this
      .getContents()
      .find(entry => {
        if (!isUser(entry)) return false;
        return entry.username === username;
      })
  }

  async deleteById(userId: string): Promise<boolean> {
    this.putContents(this.getContents().filter(entry => {
      if (!isUser(entry)) return false;
      return entry.id !== userId;
    }));
    return true;
  }

  async save(user: User): Promise<boolean> {
    if (!user.id) user.id = uuidv4();
    const contents = this.getContents().filter(entry => {
      if (!isUser(entry)) return false;
      return entry.id !== user.id;
    });
    contents.push(user);
    this.putContents(contents);
    return true;
  }

}
