import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
const ajv = new Ajv();

export const configSchema = {
  title     : 'NVR config schema',
  type      : 'object',
  properties: {
    recordPath: {
      type: 'string',
    },
    recordFormat: {
      enum: ['fmp4', 'mpegts']
    },
    recordSegmentDuration: {
      enum: ['10m', '1h']
    }
  },
  required: [],
} as const;

export type Config = FromSchema<typeof configSchema>;
export const isConfig: (subject:any)=>subject is Config = ajv.compile(configSchema);
