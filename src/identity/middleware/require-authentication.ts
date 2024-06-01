import { FastifyRequest, FastifyReply } from 'fastify';
import { RequestAuth } from '../model/request-auth';
import * as qs from 'qs';

export default function(authUri = "/ui/login") {
  return function(req: FastifyRequest & { auth: RequestAuth }, res: FastifyReply, next: ()=>void) {
    const isHtmx    = (req.headers['hx-request'] && req.headers['hx-request'] == 'true');
    const returnUrl = (req.headers['hx-current-url'] || req.headers.referer || undefined);

    const redirectUri =
      authUri +
      (authUri.indexOf('?') >= 0 ? '&' : '?') +
      qs.stringify({
        redirectUri: returnUrl
      });

    if (!req.auth) {
      if (isHtmx) {
        res.statusCode = 204;
        res.header('HX-Redirect', redirectUri);
        return res.send();
      } else {
        res.statusCode = 302;
        res.header('Location', redirectUri);
        return res.send();
      }
    }

    return next();
  }
};
