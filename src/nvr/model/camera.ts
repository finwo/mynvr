import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
const ajv = new Ajv();

export const cameraSchema = {
  title     : 'Camera',
  type      : 'object',
  properties: {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    source: {
      type: 'string',
    },
  },
  required: [
    'name',
  ],
} as const;

export type Camera = FromSchema<typeof cameraSchema>;
export const isCamera: (subject:any)=>subject is Camera = ajv.compile(cameraSchema);
