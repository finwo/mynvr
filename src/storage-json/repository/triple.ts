import { Service } from '@finwo/di';
import { readFileSync, existsSync, writeFileSync } from 'fs';

const storageFile = (process.env.STORAGE_DIR || '/data') + '/triples.json';

export type Triple = {
  subject  : string;
  predicate: string;
  object   : string;
};

@Service()
export class TripleRepository {

  private getContents(): Triple[] {
    try {
      return JSON.parse(existsSync(storageFile) ? readFileSync(storageFile).toString() : '[]');
    } catch {
      return [];
    }
  }

  private putContents(contents: Triple[]): boolean {
    try {
      writeFileSync(storageFile, JSON.stringify(contents, null, 2));
      return true;
    } catch {
      return false;
    }
  }

  async put(triple: Triple): Promise<boolean> {
    const contents = this
      .getContents()
      .filter(entry => {
        if (entry.subject   != triple.subject  ) return true;
        if (entry.predicate != triple.predicate) return true;
        if (entry.object    != triple.object   ) return true;
        return false;
      });
    contents.push(triple);
    return this.putContents(contents);
  }

  async find(pattern: Partial<Triple>): Promise<Triple[]> {
    return this
      .getContents()
      .filter(entry => {
        if (('subject'   in pattern) && (pattern.subject   != entry.subject  )) return false;
        if (('predicate' in pattern) && (pattern.predicate != entry.predicate)) return false;
        if (('object'    in pattern) && (pattern.object    != entry.object   )) return false;
        return true;
      });
  }

}
