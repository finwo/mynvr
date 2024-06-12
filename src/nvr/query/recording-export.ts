import { Service          } from '@finwo/di';
import { Ajv              } from 'ajv';
import { FromSchema       } from 'json-schema-to-ts';
import { CameraRepository } from '@nvr/repository/camera';
import { readdirSync, writeFileSync, unlinkSync } from 'fs';
import { spawn            } from 'child_process';
import { Readable         } from 'stream';

const ajv = new Ajv();

export const inputSchema = {
  title     : 'Validate auth token input schema',
  type      : 'object',
  properties: {
    camera: {
      type: 'string',
      minLength: 1,
    },
    range: {
      type: 'object',
      properties: {
        start: {
          type: 'string',
          pattern: "^\\d{4}-((0[1-9])|(1[012]))-((0[1-9])|([12]\\d)|(3[01]))$",
        },
        end: {
          type: 'string',
          pattern: "^\\d{4}-((0[1-9])|(1[012]))-((0[1-9])|([12]\\d)|(3[01]))$",
        },
      },
      required: [
        'start',
        'end',
      ],
    },
  },
  required: [
    'camera',
    'range',
  ],
} as const;

export type Input = FromSchema<typeof inputSchema>;
export const isInput: (subject:unknown)=>subject is Input = ajv.compile(inputSchema);

export type Output =
  { ok: false, error: string } |
  { ok: true , data: Readable }
  ;

@Service()
export class RecordingExportQuery {
  private baseUrl: string;
  private recordingsDir: string;

  constructor(
    private cameraRepository: CameraRepository,
  ) {
    this.baseUrl = process.env.MEDIAMTX_API || '';
    if (!this.baseUrl) throw new Error('Missing MEDIAMTX_API env var');
    this.recordingsDir = process.env.RECORDING_DIR || '';
    if (!this.recordingsDir) throw new Error('Missing RECORDING_DIR env var');
  }

  async execute(input: Input): Promise<Output> {
    if (!isInput(input)) return { ok: false, error: 'invalid-input' };

    const camera = await this.cameraRepository.get(input.camera);
    if (!camera) return { ok: false, error: 'not-found' };

    const pathRecordingsDir = `${this.recordingsDir}/${camera.name}`;
    let   entries;
    try {
      entries = readdirSync(pathRecordingsDir);
    } catch(e: any) {
      if (e instanceof Error) {
        return { ok: false, error: e.message };
      } else {
        return { ok: false, error: 'internal-error' };
      }
    }

    entries = entries.filter(entry => {
      if (entry.slice(0,input.range.start.length) < input.range.start) return false;
      if (entry.slice(0,input.range.end.length  ) > input.range.end  ) return false;
      return true;
    });

    const listfile = `${this.recordingsDir}/${camera.name}/export.txt`;
    writeFileSync(listfile, entries.map(entry => `file '${entry}'`).join('\n'));

    const ffmpeg = spawn('ffmpeg', [
      '-f', 'concat',
      '-i', listfile,
      '-c:a', 'copy',
      '-c:v', 'copy',
      // '-movflags', 'frag_keyframe+empty_moov',
      // '-f', 'mp4',
      '-f', 'ismv',
      'pipe:',
    ]);

    ffmpeg.stderr.on('data', chunk => {
      process.stderr.write(chunk);
    });
    ffmpeg.on('close', () => {
      console.log('close');
      unlinkSync(listfile);
    });

    return {
      ok: true,
      data: ffmpeg.stdout,
    };
  }
}
