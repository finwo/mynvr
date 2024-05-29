import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../model/authenticated-request';

export default function(req: AuthenticatedRequest, res: FastifyReply, next: ()=>void) {
  let handler = ()=>next();
  handler = require('./method/bearer-token').default.bind(null, req, res, handler);
  handler();
};
