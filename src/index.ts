import 'reflect-metadata';
import 'module-alias/register';

import Fastify from 'fastify';
import { plugin } from '@finwo/router-fastify';

const app = Fastify({
  ignoreTrailingSlash: true,
  ignoreDuplicateSlashes: true,
});

import { Controllers as IdentityControllers } from './identity';

// Register your routes
app.register(plugin, [
  ...IdentityControllers,
]);

// Setup persistent storage
let storageClass = process.env.STORAGE_CLASS || 'json-file';
switch(storageClass) {
  case 'json-file':
  default:
    require('./storage-json');
    break;
}

// And start listening
app.listen({
  host: '::',
  port: parseInt(process.env.PORT || '5000'),
}, (err: any, addr: any) => {
  if (err) throw err;
  console.log(`MyNVR listening on ${addr}`);
});

// Shutdown when receiving a sigterm
// Prevents being killed after timeout in ECS
process.on('SIGTERM', () => {
  if (!app) return;
  app.close();
});
