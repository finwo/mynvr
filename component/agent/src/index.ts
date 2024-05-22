import 'reflect-metadata';
import './identity';

let storageClass = process.env.STORAGE_CLASS || 'json-file';

switch(storageClass) {
  case 'json-file':
  default:
    require('./storage-json');
    break;
}
