import { FastifyRequest } from 'fastify';
import { RequestAuth } from './request-auth';

export type AuthenticatedRequest = FastifyRequest & { auth: RequestAuth };
