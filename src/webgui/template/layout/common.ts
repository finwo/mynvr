import styling from '../partial/styling';

export default function(title?: string, body?: string) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title || 'foobar'}</title>
    ${styling()}
    <style>
      #cookiewrapper {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #8888;
      }
      #cookiebanner {
        display: block;
        position: fixed;
        background: #fff;
        text-align: center;
        -webkit-box-shadow: 0 1em 3em 0 rgba(0,0,0,1);
        -moz-box-shadow: 0 1em 3em 0 rgba(0,0,0,1);
        box-shadow: 0 1em 3em 0 rgba(0,0,0,1);
        padding: 1em;
        width: 100%;
      }
      #cookiebanner button {
        margin: 0 0.5em;
      }
    </style>
  </head>
  <body>
    <script src="/ui/assets/htmx.js"></script>
    ${body || ''}
    <div id=cookiewrapper>
      <div id=cookiebanner>
        We make use of technical cookies.
        <a href="/ui/use-of-cookies">Read more about it here</a>
        <button onclick="acceptCookies();">Accept</button>
      </div>
    </div>
    <script>
      // Cookie consent only applies for 400 days here
      if ((parseInt(localStorage.cookieConsent)||0) < (Date.now() - (1000 * 3600 * 24 * 400))) {
        delete localStorage.cookieConsent;
      }
      // Handle already-accepted
      if ((parseInt(localStorage.cookieConsent)|0) || (document.location.pathname == "/ui/use-of-cookies")) {
        document.body.removeChild(cookiewrapper);
      }
      // Accept action
      function acceptCookies() {
        localStorage.cookieConsent = Date.now();
        document.body.removeChild(cookiewrapper);
      }
    </script>
  </body>
</html>
  `;
};
