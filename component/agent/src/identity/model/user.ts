import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
const ajv = new Ajv();

export const userSchema = {
  title     : 'User',
  type      : 'object',
  properties: {
    id: {
      type: 'string',
    },
    username: {
      type: 'string',
    },
  },
  required: [
    'username',
  ],
} as const;

export type User = FromSchema<typeof userSchema>;
export const isUser: (subject:any)=>subject is User = ajv.compile(userSchema);
