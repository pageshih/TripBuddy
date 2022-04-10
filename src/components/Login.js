import { Button } from '../utils/Button';
import { TextField } from '../utils/TextField';
import { useState } from 'react';

function Login() {
  const [email, setEmail] = useState();
  return (
    <>
      <TextField
        placeholder={'email@example.com'}
        value={email}
        onChange={(e) => setEmail(e.target.value)}>
        帳號
      </TextField>
      <Button primary>Login</Button>
    </>
  );
}

export default Login;
