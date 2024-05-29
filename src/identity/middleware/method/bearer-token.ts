import { Container } from '@finwo/di';
import { FastifyRequest, FastifyReply } from 'fastify';
import { RequestAuth } from '@identity/model/request-auth';
import { AuthenticatedRequest } from '@identity/model/authenticated-request';
import { ValidateAuthTokenQuery } from '@identity/query/validate-auth-token';

export default async function(req: AuthenticatedRequest, res: FastifyReply, next: ()=>void) {

  // Skip if already authenticated
  if (req.auth) return next();

  // Sanity checking
  if (!req.headers.authorization) return next();
  const [ scheme, token ] = req.headers.authorization.split(' ');
  if (scheme.toLowerCase() !== 'bearer') return next();

  // Do the actual check
  const validateAuthTokenQuery = Container.get(ValidateAuthTokenQuery);
  const validateResponse       = await validateAuthTokenQuery.execute({ token });
  if (!validateResponse.ok) return next();

  // Mark the request as authenticated
  const authData = validateResponse as RequestAuth & { ok?:boolean };
  delete authData.ok;
  Object.assign(req, {
    auth: authData,
  });

  next();
};
