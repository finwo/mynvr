import { Service } from '@finwo/di';
import { readFileSync } from 'fs';
import * as nunjucks from 'nunjucks';

class Loader {
  getSource(name: string) {
    const path = __dirname + '/' + name + '.html';
    return {
      path,
      noCache: false,
      src: readFileSync(path, 'utf-8'),
    };
  }
}

@Service()
export class Template extends nunjucks.Environment {
  constructor() {
    super(new Loader());
  }
}
