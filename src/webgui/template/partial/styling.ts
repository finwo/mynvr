import resetCss from './reset-css';

export default function() {
  return `
  ${resetCss()}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet">
  <style>
    html {
      font-family: Nunito, sans-serif;
    }
    html, body {
      min-height: 100%;
    }
    input[type=text],
    input[type=password] {
      background: #0001;
      border: none;
      padding: 0.5em;
    }
    button {
      background: #222;
      color: #fff;
      padding: 0.5em;
      border: none;
    }
    [onclick] {
      cursor: pointer;
    }
  </style>
`;
}
