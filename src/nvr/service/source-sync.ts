import { Service } from '@finwo/di';
import { CameraRepository } from '@nvr/repository/camera';

@Service()
export class SourceSyncService {
  constructor(
    private cameraRepository: CameraRepository
  ) {
    console.log('CONSTRUCTOR');
  }
}
