import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../model/authenticated-request';

export default function(req: AuthenticatedRequest, res: FastifyReply, next: ()=>void) {
  if (!('auth' in req)) Object.assign(req, { auth: false });
  let handler = ()=>next();
  handler = require('./method/bearer-token').default.bind(null, req, res, handler);
  handler = require('./method/param-token').default.bind(null, req, res, handler);
  handler();
};
