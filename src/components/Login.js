import { useContext, useEffect, useState, useReducer, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { firebaseAuth } from '../utils/firebase';
import { Context } from '../App';
import { styles, palatte, mediaQuery } from './styledComponents/basic/common';
import { Logo } from './styledComponents/basic/Logo';
import { P } from './styledComponents/basic/Text';
import { Button, ButtonOutline } from './styledComponents/Buttons/Button';
import { TextInput } from './styledComponents/Form';
import { Image } from './styledComponents/Layout';
import { NotificationText } from './styledComponents/Notification';

const Container = styled.div`
  ${styles.flex}
  ${mediaQuery[0]} {
    display: block;
    position: relative;
    background-color: ${palatte.secondary['100']};
    height: 100vh;
  }
`;

const EntryImage = ({ src }) => (
  <Image
    src={src}
    alt="TripBuddy"
    addCss={css`
      width: 52%;
      height: 100vh;
      ${mediaQuery[0]} {
        height: 200px;
        width: 100%;
      }
    `}
  />
);

const EntryContainer = styled.div`
  ${styles.flex}
  flex-grow: 1;
  height: 100vh;
  justify-content: center;
  align-items: center;
  ${mediaQuery[0]} {
    position: absolute;
    top: 120px;
    width: 100%;
    height: fit-content;
    align-items: flex-start;
    padding: 0 20px;
  }
`;
const EntryContentWrapper = styled.div`
  ${styles.flexColumn}
  gap:60px;
  flex-basis: 450px;
  padding: 30px;
  ${mediaQuery[0]} {
    background-color: ${palatte.white};
    flex-basis: 400px;
    padding: 40px 30px;
    border-radius: 30px;
    box-shadow: ${styles.shadow};
    gap: 40px;
  }
`;

const EntryFormWrapper = styled.div`
  ${styles.flexColumn};
  gap: 20px;
`;
const EntryInputWrapper = styled.div`
  ${styles.flexColumn};
  gap: 15px;
`;
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

const textNotificationReducer = (state, action) => {
  switch (action.type) {
    case 'fire':
      return {
        fire: [...state.fire, action.playload.fire],
        message: {
          ...state.message,
          [action.playload.fire]: action.playload.message,
        },
      };
    case 'close':
      return {
        ...state,
        fire: state.fire.filter((id) => id !== action.playload.close),
      };
    default:
      return state;
  }
};

function Login() {
  const { dispatchNotification } = useContext(Context);
  const [email, setEmail] = useState('test@mail.com');
  const [password, setPassword] = useState('test123');
  const { setUid, setIsLogInOut, goLogin, isLogInOut } = useContext(Context);
  const [isSignUp, setIsSignUp] = useState();
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const [textNotification, dispatchTextNotification] = useReducer(
    textNotificationReducer,
    { fire: [], message: {} }
  );
  const authErrorMessage = useRef({
    'auth/email-already-exists': 'Email 已被人使用，請重新輸入',
    'auth/internal-error': '伺服器發生錯誤，請稍後再試',
    'auth/invalid-password': '密碼錯誤，請重新輸入至少六個字的密碼',
    'auth/invalid-email': '無效的 Email，請重新輸入',
    'auth/wrong-password': '密碼錯誤，請重新輸入至少六個字的密碼',
    'auth/popup-closed-by-user': '您已取消 google 登入',
    'auth/cancelled-popup-request': '您已取消 google 登入',
    'auth/popup-blocked': '登入視窗被阻擋，請關閉廣告阻擋套件',
  });
  useEffect(() => {
    if (email) {
      dispatchTextNotification({ type: 'close', playload: { close: 'email' } });
    }
    if (password) {
      dispatchTextNotification({
        type: 'close',
        playload: { close: 'password' },
      });
    }
    if (userName) {
      dispatchTextNotification({
        type: 'close',
        playload: { close: 'userName' },
      });
    }
  }, [email, password, userName]);
  const emptyVerify = () => {
    if (!email) {
      dispatchTextNotification({
        type: 'fire',
        playload: {
          fire: 'email',
          message: '請輸入 Email',
        },
      });
    }
    if (!password) {
      dispatchTextNotification({
        type: 'fire',
        playload: {
          fire: 'password',
          message: '請輸入密碼',
        },
      });
    }
    if (!userName) {
      dispatchTextNotification({
        type: 'fire',
        playload: {
          fire: 'userName',
          message: '請輸入用戶名稱',
        },
      });
    }
  };
  const errorVerify = (error) => {
    if (error.code.match('password')?.length > 0) {
      dispatchTextNotification({
        type: 'fire',
        playload: {
          fire: 'password',
          message: authErrorMessage.current[error.code],
        },
      });
    } else if (error.code.match('email')?.length > 0) {
      dispatchTextNotification({
        type: 'fire',
        playload: {
          fire: 'email',
          message: authErrorMessage.current[error.code],
        },
      });
    } else {
      dispatchNotification({
        type: 'fire',
        playload: {
          type: 'warn',
          message: authErrorMessage.current[error.code] || error.message,
          id: 'toastify_errorMessage',
        },
      });
    }
  };
  const signIn = () => {
    if (email && password) {
      firebaseAuth
        .signIn(email, password)
        .then((res) => {
          setUid(res.user.uid);
          setIsLogInOut(false);
          navigate(`/itineraries`);
        })
        .catch((error) => {
          errorVerify(error);
        });
    } else {
      emptyVerify();
    }
  };
  const signUp = () => {
    if (email && password && userName) {
      firebaseAuth
        .signUp(email, password, userName)
        .then((uid) => {
          setUid(uid);
          setIsLogInOut(false);
          navigate(`/itineraries`);
        })
        .catch((error) => {
          errorVerify(error);
        });
    } else {
      emptyVerify();
    }
  };
  const logInWithGoogle = () => {
    firebaseAuth
      .googleLogIn()
      .then((uid) => {
        setUid(uid);
        setIsLogInOut(false);
        navigate(`/itineraries`);
      })
      .catch((error) => {
        dispatchNotification({
          type: 'fire',
          playload: {
            type: 'warn',
            message: authErrorMessage.current[error.code],
            id: 'toastify_errorMessage',
          },
        });
      });
  };

  useEffect(() => {
    if (goLogin || isLogInOut) {
      dispatchNotification({
        type: 'fire',
        playload: {
          type: isLogInOut ? 'success' : 'warn',
          message: isLogInOut ? '您已登出' : '請先登入',
          id: 'toastify_loginFirst',
        },
      });
    }
  }, []);
  return (
    <>
      <Container>
        <EntryImage src="https://images.unsplash.com/photo-1551918120-9739cb430c6d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" />
        <EntryContainer>
          <EntryContentWrapper>
            <Logo />
            <EntryFormWrapper>
              <EntryInputWrapper>
                {isSignUp && (
                  <>
                    <TextInput
                      placeholder={'請輸入用戶名稱'}
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                    <NotificationText type="error">
                      {textNotification.fire?.some((id) => id === 'userName') &&
                        textNotification.message.userName}
                    </NotificationText>
                  </>
                )}
                <TextInput
                  placeholder={'email@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <NotificationText type="error">
                  {textNotification.fire?.some((id) => id === 'email') &&
                    textNotification.message.email}
                </NotificationText>

                <TextInput
                  placeholder={'密碼至少6個字'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                />
                <NotificationText type="error">
                  {textNotification.fire?.some((id) => id === 'password') &&
                    textNotification.message.password}
                </NotificationText>
              </EntryInputWrapper>
              <Button styled="primary" onClick={isSignUp ? signUp : signIn}>
                {isSignUp ? '註冊' : ' Email 登入'}
              </Button>
              <ContainerTopLine>
                <P color={palatte.gray['700']}>
                  {isSignUp ? '已經有帳號了嗎？' : '還沒有帳號嗎？'}
                </P>
                <ButtonOutline
                  styled="primary"
                  onClick={() => {
                    if (!isSignUp) {
                      setEmail('');
                      setPassword('');
                    } else {
                      setEmail('test@mail.com');
                      setPassword('test123');
                    }
                    setIsSignUp((prev) => !prev);
                  }}>
                  {isSignUp ? 'Email 登入' : 'Email 註冊'}
                </ButtonOutline>
                <ButtonOutline styled="primary" onClick={logInWithGoogle}>
                  使用 Google 登入
                </ButtonOutline>
              </ContainerTopLine>
            </EntryFormWrapper>
          </EntryContentWrapper>
        </EntryContainer>
      </Container>
    </>
  );
}

export default Login;
