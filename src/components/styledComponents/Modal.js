import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { palatte } from './basicStyle';
import '../../animation.css';
import { useEffect, useState } from 'react';

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
  useEffect(() => {
    let clear;
    if (!props.isShowState && isFlyIn) {
      setIsFlyIn(false);
      clear = setTimeout(() => {
        setIsShowBg(false);
      }, 300);
    } else if (props.isShowState && !isFlyIn) {
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
    <CSSTransition in={isShowBg} classNames="fade" timeout={300} unmountOnExit>
      <FadeBg
        id="close"
        onClick={(e) => {
          if (e.target.id === 'close') {
            props.close();
          }
        }}>
        <CSSTransition
          in={isFlyIn}
          classNames="flyToBottom"
          timeout={1000}
          unmountOnExit>
          <CenterContainer
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
            {props.children}
          </CenterContainer>
        </CSSTransition>
      </FadeBg>
    </CSSTransition>
  );
}

function Confirm(props) {
  return (
    <CSSTransition
      in={props.isShowState}
      timeout={300}
      classNames="fade"
      unmountOnExit>
      <Modal close={props.close}>
        <p>confirm?</p>
      </Modal>
    </CSSTransition>
  );
}

export { Modal, Confirm };
