import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { firebaseAuth } from '../utils/firebase';
import { Context } from '../App';
import {
  Logo,
  P,
  styles,
  palatte,
  mediaQuery,
} from './styledComponents/basicStyle';
import { Button, ButtonOutline } from './styledComponents/Button';
import { TextInput } from './styledComponents/Form';
import { FlexDiv, FlexChildDiv, Image } from './styledComponents/Layout';

const ContainerTopLine = styled.div`
  display: flex;
  border-top: ${styles.border};
  padding-top: 20px;
  gap: 20px;
  flex-direction: column;
  align-items: center;
  ${mediaQuery[0]} {
    gap: 15px;
  }
`;

function Login(props) {
  const [email, setEmail] = useState('test@mail.com');
  const [password, setPassword] = useState('test123');
  const { setUid } = useContext(Context);
  const [isSignUp, setIsSignUp] = useState();
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const signIn = () => {
    firebaseAuth.signIn(email, password).then((res) => {
      console.log(res);
      setUid(res.user.uid);
      props.setIsLogInOut(true);
      navigate(`/itineraries`);
    });
  };
  const signUp = () => {
    firebaseAuth.signUp(email, password, userName).then((uid) => {
      console.log(uid);
      setUid(uid);
      props.setIsLogInOut(true);
      navigate(`/itineraries`);
    });
  };
  const logInWithGoogle = () => {
    firebaseAuth
      .googleLogIn()
      .then((uid) => {
        console.log(uid);
        setUid(uid);
        props.setIsLogInOut(true);
        navigate(`/itineraries`);
      })
      .catch((error) => alert(error.message));
  };
  useEffect(() => {
    props?.setIsLogInOut(false);
  }, [props]);
  return (
    <FlexDiv
      css={css`
        ${mediaQuery[0]} {
          display: block;
          position: relative;
          background-color: ${palatte.secondary['100']};
          height: 100vh;
        }
      `}>
      <Image
        src="https://images.unsplash.com/photo-1551918120-9739cb430c6d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
        alt="TripBuddy"
        width="52%"
        height="100vh"
        addCss={css`
          ${mediaQuery[0]} {
            height: 200px;
            width: 100%;
          }
        `}
      />
      <FlexChildDiv
        grow="1"
        height="100vh"
        justifyContent="center"
        alignItems="center"
        addCss={css`
          ${mediaQuery[0]} {
            position: absolute;
            top: 120px;
            width: 100%;
            height: fit-content;
            align-items: flex-start;
            padding: 0 20px;
          }
        `}>
        <FlexChildDiv
          direction="column"
          gap="60px"
          basis="450px"
          padding="30px"
          addCss={css`
            ${mediaQuery[0]} {
              background-color: ${palatte.white};
              flex-basis: 400px;
              padding: 40px 30px;
              border-radius: 30px;
              box-shadow: ${styles.shadow};
              gap: 40px;
            }
          `}>
          <Logo />
          <FlexDiv
            direction="column"
            gap="30px"
            addCss={css`
              gap: 20px;
            `}>
            <FlexDiv
              direction="column"
              gap="20px"
              addCss={css`
                gap: 15px;
              `}>
              {isSignUp && (
                <TextInput
                  placeholder={'請輸入用戶名稱'}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              )}
              <TextInput
                placeholder={'email@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextInput
                placeholder={'密碼至少6個字'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
            </FlexDiv>
            <Button styled="primary" onClick={isSignUp ? signUp : signIn}>
              {isSignUp ? '註冊' : ' Email 登入'}
            </Button>
            <ContainerTopLine>
              <P color={palatte.gray['700']}>
                {isSignUp ? '已經有帳號了嗎？' : '還沒有帳號嗎？'}
              </P>
              <ButtonOutline
                styled="primary"
                onClick={() => setIsSignUp((prev) => !prev)}>
                {isSignUp ? 'Email 登入' : 'Email 註冊'}
              </ButtonOutline>
              <ButtonOutline styled="primary" onClick={logInWithGoogle}>
                使用 Google 登入
              </ButtonOutline>
            </ContainerTopLine>
          </FlexDiv>
        </FlexChildDiv>
      </FlexChildDiv>
    </FlexDiv>
  );
}

export default Login;
