import { Service } from '@finwo/di';
import { Camera  } from '@nvr/model/camera';

export type FindOptions = {
  limit?: number;
};

export type Callback<T> = (arg0:T)=>void;

@Service()
export abstract class CameraRepository {
  abstract find(opts?: FindOptions): Promise<Camera[]>;
  abstract get(cameraName: string): Promise<Camera|undefined>;
  abstract delete(cameraName: string): Promise<boolean>;
  abstract save(camera: Partial<Camera>): Promise<boolean>;
  abstract on(name: string, fn: Callback<Partial<Camera>>): void;
  abstract emit(name: string, subject: Partial<Camera>): Promise<void>;

};
