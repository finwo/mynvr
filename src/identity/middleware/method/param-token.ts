import { Container } from '@finwo/di';
import { FastifyRequest, FastifyReply } from 'fastify';
import { RequestAuth } from '@identity/model/request-auth';
import { AuthenticatedRequest } from '@identity/model/authenticated-request';
import { ValidateAuthTokenQuery } from '@identity/query/validate-auth-token';

export default async function(req: AuthenticatedRequest, res: FastifyReply, next: ()=>void) {
  console.log('param-token called');

  // Skip if already authenticated
  if (req.auth) return next();

  // Sanity checking
  const query = req.query as Record<string, string>;
  if (!query.auth) return next();

  // Do the actual check
  const validateAuthTokenQuery = Container.get(ValidateAuthTokenQuery);
  const validateResponse       = await validateAuthTokenQuery.execute({ token: query.auth });
  if (!validateResponse.ok) return next();

  // Mark the request as authenticated
  const authData = validateResponse as RequestAuth & { ok?:boolean };
  delete authData.ok;
  Object.assign(req, {
    auth: authData,
  });

  next();
};