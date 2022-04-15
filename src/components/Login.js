import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseAuth } from '../utils/firebase';
import { Context } from '../App';
import { Button } from './styledComponents/Button';
import { TextField } from './styledComponents/TextField';

function Login(props) {
  const [email, setEmail] = useState('test@mail.com');
  const [password, setPassword] = useState('test123');
  const { setUid } = useContext(Context);
  const navigate = useNavigate();
  const signIn = () => {
    firebaseAuth.signIn(email, password).then((res) => {
      console.log(res);
      setUid(res.user.uid);
      props.setIsLogInOut(true);
      navigate(`/itineraries`);
    });
  };
  useEffect(() => {
    props?.setIsLogInOut(false);
  }, [props]);
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
