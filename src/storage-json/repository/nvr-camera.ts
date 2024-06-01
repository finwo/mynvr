import { Service                                 } from '@finwo/di';
import { CameraRepository, FindOptions, Callback } from '@nvr/repository/camera';
import { Camera, isCamera                        } from '@nvr/model/camera';
import { readFileSync, existsSync, writeFileSync } from 'fs';

const storageFile = (process.env.STORAGE_DIR || '/data') + '/cameras.json';

@Service()
export class NvrCameraJsonRepository extends CameraRepository {
  private _listeners: Record<string, Callback<Partial<Camera>>[]> = {};

  private getContents(): Camera[] {
    try {
      return JSON.parse(existsSync(storageFile) ? readFileSync(storageFile).toString() : '[]');
    } catch {
      return [];
    }
  }

  private putContents(contents: Camera[]) {
    writeFileSync(storageFile, JSON.stringify(contents, null, 2));
  }

  async find(options?: FindOptions): Promise<Camera[]> {
    const opts: FindOptions = Object.assign({}, options);
    return this
      .getContents()
      .filter((entry, index) => {
        if ('undefined' === typeof opts.limit) return true;
        return index < opts.limit;
      })
      ;
  }

  async get(cameraName: string): Promise<Camera|undefined> {
    return this
      .getContents()
      .find(entry => {
        if (!isCamera(entry)) return false;
        return entry.name === cameraName;
      })
  }

  async delete(cameraName: string): Promise<boolean> {
    await this.emit('pre-delete', { name: cameraName });
    this.putContents(this.getContents().filter(entry => {
      if (!isCamera(entry)) return false;
      return entry.name !== cameraName;
    }));
    await this.emit('post-delete', { name: cameraName });
    return true;
  }

  async save(camera: Partial<Camera>): Promise<boolean> {
    await this.emit('pre-save', camera);
    if (!isCamera(camera)) return false;
    const contents = this.getContents().filter(entry => {
      if (!isCamera(entry)) return false;
      return entry.name !== camera.name;
    });
    contents.push(camera);
    this.putContents(contents);
    await this.emit('post-save', camera);
    return true;
  }

  on(name: string, fn: Callback<Partial<Camera>>): void {
    if (!(name in this._listeners)) this._listeners[name] = [];
    this._listeners[name].push(fn);
  }

  async emit(name: string, subject: Partial<Camera>): Promise<void> {
    for(const fn of (this._listeners[name]||[])) {
      await fn(subject);
    }
  }

}
