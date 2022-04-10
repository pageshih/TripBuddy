import { Button } from '../utils/Button';
import { TextField } from '../utils/TextField';
import { useState } from 'react';

function Login() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  return (
    <>
      <TextField
        placeholder={'email@example.com'}
        value={email}
        onChange={(e) => setEmail(e.target.value)}>
        帳號
      </TextField>
      <TextField
        placeholder={'密碼至少6個字'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}>
        密碼
      </TextField>
      <Button primary>Login</Button>
    </>
  );
}

export default Login;
