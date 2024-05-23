import { FastifyRequest, FastifyReply } from 'fastify';

export default function(req: FastifyRequest, res: FastifyReply, next: ()=>void) {
  console.log('Auth called');
  next();
};
