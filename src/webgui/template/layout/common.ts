import styling from '../partial/styling';

export default function(title?: string, body?: string) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${title || 'foobar'}</title>
    ${styling()}
  </head>
  <body>
    <script src="/ui/assets/htmx.js"></script>
    ${body || ''}
  </body>
</html>
  `;
};
