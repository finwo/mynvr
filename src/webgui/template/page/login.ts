import commonLayout from '../layout/common';

export default function() {
  return commonLayout('Login', `
<style>
  body {
    background-image   : url('/ui/assets/authentication.jpeg');
    background-size    : cover;
    background-position: center;
  }
  #wrapper {
    background: transparent;
    min-height: 100%;
    width: 100%;
    text-align: center;
    position: absolute;
  }
  #wrapper > form {
    color: #222;
    display: inline-block;
    background: #fff;
    text-align: left;
    -webkit-box-shadow: 0 1em 3em 0 rgba(0,0,0,1);
    -moz-box-shadow: 0 1em 3em 0 rgba(0,0,0,1);
    box-shadow: 0 1em 3em 0 rgba(0,0,0,1);
    max-width: calc(100% - 2em);
    padding: 2em;
    margin-top: 4em;
  }
  input {
    max-width: 100%;
    width: 15em;
  }
  #wrapper > form h2 {
    text-align: center;
  }
  #wrapper > form > label {
    display: block;
    margin-top: 1em;
  }
  #wrapper > form > button {
    background: #222;
    color: #fff;
    padding: 0.5em;
    border: none;
    display: block;
    margin-top: 2em;
    width: 100%;
  }
  @media only screen and (max-width: 60rem) {
    #wrapper {
      background: #fff;
    }
    #wrapper > form {
      -webkit-box-shadow: unset;
      -moz-box-shadow: unset;
      box-shadow: unset;
    }
  }

</style>
<div id=wrapper>
  <form>
    <h2>Login</h2>

    <label for=username>Username</label>
    <input id=username type=text>

    <label for=password>Password</label>
    <input id=password type=password>

    <button type=submit>Login</button>
  </form>
</div>
  `);
};
