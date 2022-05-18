import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { palatte, P } from './basicStyle';
import 'animate.css';
import '../../css/animation.css';
import { useEffect, useRef, useState } from 'react';
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
  max-width: ${(props) => props.maxWidth};
  max-height: ${(props) => props.maxHeight};
  min-width: ${(props) => props.minWidth};
  min-height: ${(props) => props.minHeight};
  flex-basis: ${(props) => props.width || '350px'};
  height: ${(props) => props.height || '400px'};
  background-color: ${palatte.white};
  border-radius: 30px 20px 30px 30px;
  position: relative;
  padding: ${(props) => props.padding || '20px'};
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
          <CenterContainer
            ref={containerRef}
            padding={props.padding}
            width={props.width}
            height={props.height}
            minWidth={props.minWidth}
            minHeight={props.minHeight}
            maxHeight={props.maxHeight}
            maxWidth={props.maxWidth}>
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

function Confirm(props) {
  const close = () => {
    if (props.setIsShowState) {
      props.setIsShowState(false);
    } else if (props.dispatchIsShowReducer) {
      props.dispatchIsShowReducer({ type: 'close' });
    }
  };
  return (
    <Modal close={close} isShowState={props.isShowState} height="fit-content">
      <FlexDiv
        direction="column"
        gap="20px"
        padding="30px 20px 15px 20px"
        width={props.width}>
        <FlexDiv direction="column" alignItems="center" gap="5px">
          <P fontSize="20px">{props.confirmMessage}</P>
          <P color={palatte.gray[600]}>{props.subMessage}</P>
        </FlexDiv>
        <FlexChildDiv gap="20px">
          <ButtonOutline styled={props.noBtnStyle || 'danger'} onClick={close}>
            {props.noMessage || '取消'}
          </ButtonOutline>
          <Button
            styled={props.yesBtnStyle || 'primary'}
            onClick={() => {
              props.yesAction();
            }}>
            {props.yesMessage || '確認'}
          </Button>
        </FlexChildDiv>
      </FlexDiv>
    </Modal>
  );
}

function Alert(props) {
  const close = () => {
    if (props.setIsShowState) {
      props.setIsShowState(false);
    } else if (props.dispatchIsShowReducer) {
      props.dispatchIsShowReducer({ type: 'close' });
    }
  };
  return (
    <Modal
      close={close}
      isShowState={props.isShowState}
      height="fit-content"
      maxWidth="90%">
      <FlexDiv
        direction="column"
        gap="20px"
        padding="30px 20px 15px 20px"
        width={props.width}>
        <FlexDiv direction="column" alignItems="center" gap="5px">
          <P fontSize="20px">{props.alertMessage}</P>
          {props.subMessage && (
            <P color={palatte.gray[600]}>{props.subMessage}</P>
          )}
        </FlexDiv>
        <Button styled={props.btnStyle || 'primary'} onClick={close}>
          {props.btnMessage || '確認'}
        </Button>
      </FlexDiv>
    </Modal>
  );
}

export { Modal, Confirm, Alert };
