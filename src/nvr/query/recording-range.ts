import { Service          } from '@finwo/di';
import { Ajv              } from 'ajv';
import { FromSchema       } from 'json-schema-to-ts';
import { CameraRepository } from '@nvr/repository/camera';

const ajv = new Ajv();

export const inputSchema = {
  title     : 'Validate auth token input schema',
  type      : 'string',
} as const;

export type Input = FromSchema<typeof inputSchema>;
export const isInput: (subject:unknown)=>subject is Input = ajv.compile(inputSchema);

export type Output =
  { ok: false, error: string } |
  { ok: true , range: { first: string, last: string } }
  ;

@Service()
export class RecordingRangeQuery {
  private baseUrl: string;

  constructor(
    private cameraRepository: CameraRepository,
  ) {
    this.baseUrl = process.env.MEDIAMTX_API || '';
    if (!this.baseUrl) throw new Error('Missing MEDIAMTX_API env var');
  }


  async execute(input: Input): Promise<Output> {
    if (!isInput(input)) return { ok: false, error: 'invalid-input' };
    if (!input) return { ok: false, error: 'invalid-input' };

    const camera = await this.cameraRepository.get(input);
    if (!camera) return { ok: false, error: 'not-found' };

    const rangeUrl      = `${this.baseUrl}/v3/recordings/get/${camera.name}`;
    const rangeResponse = (await (await fetch(rangeUrl)).json()) as {
      name: string,
      segments: { start: string }[],
    };
    if ((!rangeResponse) || (!rangeResponse.name)) {
      return { ok: false, error: 'not-found' };
    }

    const firstSegment = rangeResponse.segments.shift();
    if (!firstSegment) {
      return { ok: false, error: 'not-found' };
    }

    const lastSegment  = rangeResponse.segments.pop() || firstSegment;

    return {
      ok: true,
      range: {
        first: firstSegment.start,
        last : lastSegment.start,
      },
    };
  }
}
