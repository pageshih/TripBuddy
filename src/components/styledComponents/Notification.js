import { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast, cssTransition } from 'react-toastify';
import { CSSTransition } from 'react-transition-group';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import 'react-toastify/dist/ReactToastify.css';
import 'animate.css';
import '../../animation.css';
import '../../toastify.css';
import { palatte, styles, P, TextWithIcon } from './basicStyle';
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

const tooltipMap = {
  warn: {
    basicColor: palatte.secondary[500],
    color: palatte.gray[900],
    backgroundColor: palatte.secondary.basic,
    icon: 'warning',
  },
  error: {
    basicColor: palatte.danger.basic,
    icon: 'error',
  },
  success: {
    basicColor: palatte.primary.basic,
  },
  info: {
    basicColor: palatte.info.basic,
  },
};

const TooltipContent = styled(FlexDiv)`
  color: ${(props) => tooltipMap[props.type].color};
  padding: 6px 10px;
  border-radius: 2px;
  background-color: ${(props) => tooltipMap[props.type].backgroundColor};
  white-space: nowrap;
  box-shadow: 1px 1px 2px 1px ${palatte.shadow};
  & p {
    font-size: 14px;
  }
  & span {
    font-size: 18px;
  }
  ${(props) => props.addCss}
`;
function TooltipNotification(props) {
  const tooltipRef = useRef();
  const [isOpen, setIsOpen] = useState(props.isOpen);
  useEffect(() => {
    if (props.isOpen && props.settingReducer.fire) {
      setIsOpen(true);
      setTimeout(() => {
        setIsOpen(false);
        props.resetSettingReducer({ type: 'close' });
      }, 3000);
    }
  }, [props.isOpen, props.settingReducer.fire]);
  return (
    <Container position="relative">
      <CSSTransition
        nodeRef={tooltipRef}
        in={isOpen}
        classNames={{
          enter: 'animate__animated',
          enterActive: 'animate__fadeIn',
          exit: 'animate__animated',
          exitActive: 'animate__fadeOut',
        }}
        timeout={300}
        unmountOnExit>
        <Container
          addCss={css`
            position: absolute;
            top: -130%;
            left: -40%;
          `}>
          <TooltipContent
            gap="5px"
            alignItems="center"
            ref={tooltipRef}
            type={props.settingReducer.type}>
            <span className="material-icons">
              {tooltipMap[props.settingReducer.type].icon}
            </span>
            <P>{props.settingReducer.message}</P>
          </TooltipContent>
        </Container>
      </CSSTransition>
      {props.children}
    </Container>
  );
}
function NotificationText(props) {
  const notification = useRef();
  const [isOpen, setIsOpen] = useState();
  useEffect(() => {
    if (props.children) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [props.children]);
  return (
    <CSSTransition
      nodeRef={notification}
      in={isOpen}
      classNames={{
        enter: 'animate__animated',
        enterActive: 'animate__shakeX',
        exit: 'animate__animated',
        exitActive: 'animate__fadeOutUp',
      }}
      timeout={400}
      unmountOnExit>
      <div ref={notification}>
        <TextWithIcon
          iconName={tooltipMap[props.type].icon}
          color={tooltipMap[props.type].basicColor}
          textSize="14px"
          iconSize="18px"
          gap="5px">
          {props.children}
        </TextWithIcon>
      </div>
    </CSSTransition>
  );
}

export {
  Notification,
  defaultNotification,
  notificationReducer,
  TooltipNotification,
  NotificationText,
};
