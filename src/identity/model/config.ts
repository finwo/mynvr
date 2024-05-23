import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
const ajv = new Ajv();

export const configSchema = {
  title     : 'Identity config schema',
  type      : 'object',
  properties: {
    authkey_alg: {
      enum: ['supercop']
    },
    authkey_pub: {
      type: 'string',
    },
    authkey_sec: {
      type: 'string',
    },
  },
  required: [],
} as const;

export type Config = FromSchema<typeof configSchema>;
export const isConfig: (subject:any)=>subject is Config = ajv.compile(configSchema);
