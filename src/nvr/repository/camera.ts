import { Service } from '@finwo/di';
import { Camera  } from '@nvr/model/camera';

export type FindOptions = {
  limit?: number;
};

export type Callback<T> = (arg0:T)=>void;

@Service()
export abstract class CameraRepository {
  abstract find(opts?: FindOptions): Promise<Camera[]>;
  abstract get(cameraId: string): Promise<Camera|undefined>;
  abstract getByName(cameraName: string): Promise<Camera|undefined>;
  abstract deleteById(cameraId: string): Promise<boolean>;
  abstract save(camera: Partial<Camera>): Promise<boolean>;
  abstract onSave(fn:Callback<Camera>): void;
};
