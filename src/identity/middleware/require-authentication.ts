import { FastifyRequest, FastifyReply } from 'fastify';
import { RequestAuth } from '../model/request-auth';

export default function(redirectUri: string) {
  return function(req: FastifyRequest & { auth: RequestAuth }, res: FastifyReply, next: ()=>void) {
    return next();
  }
};
