import { Button } from '../utils/Button';
import { TextField } from '../utils/TextField';
import { useState } from 'react';
import { firebaseAuth } from '../utils/firebase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('test@mail.com');
  const [password, setPassword] = useState('test123');
  const navigate = useNavigate();
  const signIn = () => {
    firebaseAuth.signIn(email, password).then((res) => {
      console.log(res);
      navigate(`/${res.user.uid}`);
    });
  };
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
        onChange={(e) => setPassword(e.target.value)}
        type={password}>
        密碼
      </TextField>
      <Button primary onClick={signIn}>
        Login
      </Button>
    </>
  );
}

export default Login;
