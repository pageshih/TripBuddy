import { useEffect, useRef, useState, useContext } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { palatte, P, mediaQuery } from './basicStyle';
import 'animate.css';
import '../../css/animation.css';
import { Context } from '../../App';
import { Button, ButtonOutline } from './Button';
import { FlexChildDiv, FlexDiv, Container } from './Layout';

const FadeBg = styled.div`
  background-color: rgba(0, 0, 0, 0.8);
  padding: 30px;
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const CenterContainer = styled.div`
  flex-basis: fit-content;
  height: fit-content;
  max-height: 95%;
  background-color: ${palatte.white};
  border-radius: 30px 20px 30px 30px;
  position: relative;
  padding: 20px;
  ${mediaQuery[0]} {
    flex-basis: 95%;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  padding: 0px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 20px;
  color: white;
  background-color: ${palatte.gray['500']};
  z-index: 1;
  &:hover {
    background-color: ${palatte.danger.basic};
  }
`;
function Modal(props) {
  const [isFlyIn, setIsFlyIn] = useState();
  const [isShowBg, setIsShowBg] = useState();
  const bgRef = useRef();
  const containerRef = useRef();
  useEffect(() => {
    let clear;
    if (!props.isShowState && isFlyIn && isShowBg) {
      setIsFlyIn(false);
      clear = setTimeout(() => {
        setIsShowBg(false);
      }, 300);
    } else if (props.isShowState && !isFlyIn && !isShowBg) {
      setIsShowBg(true);
      clear = setTimeout(() => {
        setIsFlyIn(true);
      }, 0);
    }
    return () => {
      clearTimeout(clear);
    };
  }, [props.isShowState]);
  return (
    <CSSTransition
      in={isShowBg}
      nodeRef={bgRef}
      classNames={{
        enter: 'animate__animated',
        enterActive: 'animate__fadeIn',
        exit: 'animate__animated',
        exitActive: 'animate__fadeOut',
      }}
      timeout={300}
      unmountOnExit>
      <FadeBg
        id="close"
        ref={bgRef}
        onClick={(e) => {
          if (e.target.id === 'close') {
            props.close();
          }
        }}>
        <CSSTransition
          in={isFlyIn}
          nodeRef={containerRef}
          classNames={{
            enter: 'animate__animated',
            enterActive: 'animate__fadeInDown',
            exit: 'animate__animated',
            exitActive: 'animate__fadeOutUp',
          }}
          timeout={1000}
          unmountOnExit>
          <CenterContainer ref={containerRef} css={props.addCss}>
            <CloseBtn
              type="button"
              onClick={props.close}
              className="material-icons">
              close
            </CloseBtn>
            <Container overflowY="auto" height="100%">
              {props.children}
            </Container>
          </CenterContainer>
        </CSSTransition>
      </FadeBg>
    </CSSTransition>
  );
}

function Confirm() {
  const { dispatchNotification, notification } = useContext(Context);
  const close = () => {
    dispatchNotification({ type: 'close' });
  };
  return (
    <Modal
      close={close}
      isShowState={
        notification.fire && notification.id.match('confirm')?.length > 0
      }
      addCss={css`
        height: fit-content;
      `}>
      <FlexDiv
        addCss={css`
          flex-direction: column;
          gap: 20px;
          padding: 30px 20px 15px 20px;
        `}>
        <FlexDiv direction="column" alignItems="center" gap="5px">
          <P fontSize="18px">{notification.message}</P>
          <P color={palatte.gray[600]}>{notification.subMessage}</P>
        </FlexDiv>
        <FlexChildDiv gap="20px">
          <ButtonOutline
            styled={notification.noBtnStyle || 'gray'}
            onClick={close}>
            {notification.noMessage || '取消'}
          </ButtonOutline>
          <Button
            styled={notification.yesBtnStyle || 'danger'}
            onClick={() => {
              notification.yesAction();
              close();
            }}>
            {notification.yesMessage || '刪除'}
          </Button>
        </FlexChildDiv>
      </FlexDiv>
    </Modal>
  );
}

function Alert(props) {
  const { dispatchNotification, notification } = useContext(Context);
  const close = () => {
    dispatchNotification({ type: 'close' });
  };
  return (
    <Modal
      close={close}
      isShowState={
        notification.fire && notification.id.match('alert')?.length > 0
      }
      addCss={css`
        height: fit-content;
        max-width: 90%;
      `}>
      <FlexDiv
        addCss={css`
          flex-direction: column;
          gap: 20px;
          padding: 30px 20px 15px 20px;
          width: 100%;
        `}>
        <FlexDiv direction="column" alignItems="center" gap="5px">
          <P fontSize="20px">{notification.message}</P>
          {notification.subMessage && (
            <P color={palatte.gray[600]}>{notification.subMessage}</P>
          )}
        </FlexDiv>
        <Button styled={notification.btnStyle || 'primary'} onClick={close}>
          {notification.btnMessage || '確認'}
        </Button>
      </FlexDiv>
    </Modal>
  );
}

export { Modal, Confirm, Alert };
