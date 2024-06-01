import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
const ajv = new Ajv();

export const cameraSchema = {
  title     : 'Camera',
  type      : 'object',
  properties: {
    name: {
      type: 'string',
    },
    type: {
      enum: ['rtsp'],
    },
    source: {
      type: 'string',
    },
  },
  required: [
    'name',
    'type',
  ],
} as const;

export type Camera = FromSchema<typeof cameraSchema>;
export const isCamera: (subject:any)=>subject is Camera = ajv.compile(cameraSchema);
