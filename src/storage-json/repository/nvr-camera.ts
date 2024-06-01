import { Service                       } from '@finwo/di';
import { v4 as uuidv4                  } from 'uuid';
import { CameraRepository, FindOptions } from '@nvr/repository/camera';
import { Camera, isCamera              } from '@nvr/model/camera';
import { readFileSync, existsSync, writeFileSync } from 'fs';

const storageFile = (process.env.STORAGE_DIR || '/data') + '/cameras.json';

@Service()
export class NvrCameraJsonRepository extends CameraRepository {

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

  async get(cameraId: string): Promise<Camera|undefined> {
    return this
      .getContents()
      .find(entry => {
        if (!isCamera(entry)) return false;
        return entry.id === cameraId;
      })
      ;
  }

  async getByName(cameraName: string): Promise<Camera|undefined> {
    return this
      .getContents()
      .find(entry => {
        if (!isCamera(entry)) return false;
        return entry.name === cameraName;
      })
  }

  async deleteById(cameraId: string): Promise<boolean> {
    this.putContents(this.getContents().filter(entry => {
      if (!isCamera(entry)) return false;
      return entry.id !== cameraId;
    }));
    return true;
  }

  async save(camera: Partial<Camera>): Promise<boolean> {
    if (!camera.id) camera.id = uuidv4();
    if (!isCamera(camera)) return false;
    const contents = this.getContents().filter(entry => {
      if (!isCamera(entry)) return false;
      return entry.id !== camera.id;
    });
    contents.push(camera);
    this.putContents(contents);
    return true;
  }


}
