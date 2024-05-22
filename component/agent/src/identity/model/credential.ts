import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
const ajv = new Ajv();

export const credentialSchema = {
  title     : 'Credential',
  type      : 'object',
  properties: {
    id: {
      type: 'string',
    },
    userId: {
      type: 'string',
    },
    type: {
      enum: ['password','apikey'],
    },
    descriptor: {
      type: 'string',
    },
  },
  required: [
    'userId',
    'type',
    'descriptor',
  ],
} as const;

export type Credential = FromSchema<typeof credentialSchema>;
export const isCredential: (subject:any)=>subject is Credential = ajv.compile(credentialSchema);
