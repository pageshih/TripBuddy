import { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast, cssTransition } from 'react-toastify';
import { CSSTransition } from 'react-transition-group';
import styled from '@emotion/styled';
import 'react-toastify/dist/ReactToastify.css';
import 'animate.css';
import '../../animation.css';
import '../../toastify.css';
import { palatte } from './basicStyle';
import { Container, FlexDiv } from './Layout';

const defaultNotification = {
  fire: false,
  type: 'warn',
  message: '',
  id: '',
};
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'fire':
      return {
        ...state,
        fire: true,
        ...action.playload,
      };
    case 'close':
      return {
        ...state,
        fire: false,
      };
    default:
      return state;
  }
};

function Notification(props) {
  const slideDown = cssTransition({
    enter: 'animate__animated animate__slideInDown',
    exit: 'animate__animated animate__slideOutUp',
  });
  useEffect(() => {
    console.log(props.fire);
    if (props.fire) {
      toast[props.type](props.message, {
        position: toast.POSITION.TOP_CENTER,
        toastId: props.id,
      });
      props.resetFireState();
    }
  }, [props.fire]);
  return <ToastContainer autoClose={3000} transition={slideDown} />;
}

const TooltipContent = styled.div`
  position: absolute;
  top: -130%;
  left: -25%;
  color: ${palatte.gray[900]};
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 2px;
  background-color: ${palatte.secondary.basic};
  white-space: nowrap;
  ${(props) => props.addCss}
`;
function TooltipNotification(props) {
  const tooltipRef = useRef();
  return (
    <Container position="relative">
      <CSSTransition
        nodeRef={tooltipRef}
        in={props.isOpen}
        classNames={{
          enter: 'animate__animated',
          enterActive: 'animate__fadeIn',
          exit: 'animate__animated',
          exitActive: 'animate__fadeOut',
        }}
        timeout={300}
        unmountOnExit>
        <TooltipContent ref={tooltipRef}>{props.label}</TooltipContent>
      </CSSTransition>
      {props.children}
    </Container>
  );
}

export {
  Notification,
  defaultNotification,
  notificationReducer,
  TooltipNotification,
};
