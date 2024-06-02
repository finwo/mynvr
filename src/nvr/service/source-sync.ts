import { Service } from '@finwo/di';
import { Camera } from '@nvr/model/camera';
import { CameraRepository } from '@nvr/repository/camera';

type MediamtxPath = {
  name: string;
};
type GetPathsResponse = {
  itemCount: number;
  pageCount: number;
  items: MediamtxPath[];
};

@Service()
export class SourceSyncService {
  private baseUrl: string;

  constructor(
    private cameraRepository: CameraRepository
  ) {
    this.baseUrl = process.env.MEDIAMTX_API || '';
    if (!this.baseUrl) throw new Error('Missing MEDIAMTX_API env var');

    this.cameraRepository.on('post-save'  , () => this.refreshCameras() );
    this.cameraRepository.on('post-delete', () => this.refreshCameras() );
    this.refreshCameras();
  }

  async refreshCameras() {
    const cameras = await this.cameraRepository.find();

    const getPathsUrl = `${this.baseUrl}/v3/paths/list`;
    const response = await (await fetch(getPathsUrl)).json() as GetPathsResponse;

    // Build mutation lists
    const addList = cameras.filter(need => {
      return !response.items.find(found => need.name == found.name);
    });
    const removeList = response.items.filter(found => {
      return !cameras.find(need => need.name == found.name);
    });

    // Add new cameras
    for(const need of addList) {
      const addPathUrl = `${this.baseUrl}/v3/config/paths/add/${need.name}`;
      const addResponse = await fetch(addPathUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name           : need.name,
          source         : need.source,
        }),
      });
    }

    // Remove old cameras
    for(const found of removeList) {
      const removePathUrl = `${this.baseUrl}/v3/config/paths/delete/${found.name}`;
      const removeResponse = await fetch(removePathUrl, {
        method: 'DELETE',
      });
    }

    // TODO: update existing
  }

}
