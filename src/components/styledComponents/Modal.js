import { useEffect, useRef, useState, useContext } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import { palatte, mediaQuery, styles } from './basic/common';
import { P } from './basic/Text';
import 'animate.css';
import '../../css/animation.css';
import { Context } from '../../App';
import { Button, ButtonOutline } from './Buttons/Button';
import { Image } from './Layout';

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
const ContentWrapper = styled.div`
  overflow-y: auto;
  height: 100%;
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
function Modal({ isShowState, close, addCss, children }) {
  const [isFlyIn, setIsFlyIn] = useState();
  const [isShowBg, setIsShowBg] = useState();
  const bgRef = useRef();
  const containerRef = useRef();
  useEffect(() => {
    let clear;
    if (!isShowState && isFlyIn && isShowBg) {
      setIsFlyIn(false);
      clear = setTimeout(() => {
        setIsShowBg(false);
      }, 300);
    } else if (isShowState && !isFlyIn && !isShowBg) {
      setIsShowBg(true);
      clear = setTimeout(() => {
        setIsFlyIn(true);
      }, 0);
    }
    return () => {
      clearTimeout(clear);
    };
  }, [isShowState]);
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
            close();
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
          <CenterContainer ref={containerRef} css={addCss}>
            <CloseBtn type="button" onClick={close} className="material-icons">
              close
            </CloseBtn>
            <ContentWrapper>{children}</ContentWrapper>
          </CenterContainer>
        </CSSTransition>
      </FadeBg>
    </CSSTransition>
  );
}

Modal.propTypes = {
  isShowState: PropTypes.bool,
  close: PropTypes.func,
  addCss: PropTypes.object,
  children: PropTypes.any,
};

const ConfirmContainer = styled.div`
  ${styles.flexColumn}
  gap: 20px;
  padding: 30px 20px 15px 20px;
`;

const MessageWrapper = styled.div`
  ${styles.flexColumn}
  align-items:center;
  gap: 5px;
`;
const ButtonWrapper = styled.div`
  ${styles.flex}
  gap: 20px;
`;
const Message = styled(P)`
  font-size: 18px;
`;
const SubMessage = styled(P)`
  color: ${palatte.gray[600]};
`;
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
      {notification.imgSrc && (
        <Image
          height="400px"
          src={notification.imgSrc}
          alt={notification.imgAlt}
        />
      )}
      <ConfirmContainer>
        <MessageWrapper>
          <Message>{notification.message}</Message>
          <SubMessage>{notification.subMessage}</SubMessage>
        </MessageWrapper>
        <ButtonWrapper>
          <ButtonOutline
            styled={notification.noBtnStyle || 'gray'}
            onClick={close}>
            {notification.noMessage || '取消'}
          </ButtonOutline>
          <Button
            styled={notification.yesBtnStyle || notification.type}
            onClick={() => {
              notification.yesAction();
              close();
            }}>
            {notification.yesMessage || '刪除'}
          </Button>
        </ButtonWrapper>
      </ConfirmContainer>
    </Modal>
  );
}

function Alert() {
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
      <ConfirmContainer>
        <MessageWrapper
          css={css`
            width: 100%;
          `}>
          <Message>{notification.message}</Message>
          {notification.subMessage && (
            <SubMessage>{notification.subMessage}</SubMessage>
          )}
        </MessageWrapper>
        <Button styled={notification.btnStyle || 'primary'} onClick={close}>
          {notification.btnMessage || '確認'}
        </Button>
      </ConfirmContainer>
    </Modal>
  );
}

export { Modal, Confirm, Alert };
