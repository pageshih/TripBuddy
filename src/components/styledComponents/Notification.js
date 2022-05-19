import { useEffect, useState, useRef, useContext } from 'react';
import { ToastContainer, toast, cssTransition } from 'react-toastify';
import { CSSTransition } from 'react-transition-group';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import 'react-toastify/dist/ReactToastify.css';
import 'animate.css';
import '../../css/animation.css';
import '../../css/toastify.css';
import { Context } from '../../App';
import { palatte } from './basic/common';
import { P } from './basic/Text';
import TextWithIcon from './basic/TextWithIcon';
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
        fire: true,
        ...action.playload,
      };
    case 'close':
      return {
        ...state,
        fire: false,
      };
    case 'reset':
      return {
        ...defaultNotification,
      };
    default:
      return state;
  }
};

function Notification() {
  const { notification, dispatchNotification } = useContext(Context);
  const slideDown = cssTransition({
    enter: 'animate__animated animate__slideInDown',
    exit: 'animate__animated animate__slideOutUp',
  });
  useEffect(() => {
    if (
      notification.fire &&
      notification.type &&
      notification.id.match('toastify')?.length > 0
    ) {
      toast[notification.type](notification.message, {
        position: toast.POSITION.TOP_CENTER,
        toastId: notification.id,
      });
      dispatchNotification({ type: 'close' });
    }
  }, [notification, dispatchNotification]);
  return (
    <ToastContainer
      autoClose={notification?.duration || 3000}
      transition={slideDown}
    />
  );
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
  const [isOpen, setIsOpen] = useState(props.fire);
  const { notification, dispatchNotification } = useContext(Context);

  useEffect(() => {
    if (notification.fire && notification.id === `tooltip_${props.id}`) {
      setIsOpen(true);
      setTimeout(() => {
        setIsOpen(false);
        dispatchNotification({ type: 'close' });
      }, 3000);
    }
  }, [notification, dispatchNotification, props.id]);
  return (
    <div
      css={css`
        position: relative;
        ${props.addCss}
      `}>
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
        {tooltipMap[notification.type] && (
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
              type={notification.type}>
              <span className="material-icons">
                {tooltipMap[notification.type].icon}
              </span>
              <P>{notification.message}</P>
            </TooltipContent>
          </Container>
        )}
      </CSSTransition>
      {props.children}
    </div>
  );
}
function NotificationText(props) {
  const notificationRef = useRef();
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
      nodeRef={notificationRef}
      in={isOpen}
      classNames={{
        enter: 'animate__animated',
        enterActive: 'animate__shakeX',
        exit: 'animate__animated',
        exitActive: 'animate__fadeOutUp',
      }}
      timeout={400}
      unmountOnExit>
      <div ref={notificationRef}>
        <TextWithIcon
          iconName={tooltipMap[props.type].icon}
          addCss={{
            container: css`
              gap: 5px;
              font-size: 14px;
              color: ${tooltipMap[props.type].basicColor};
            `,
            icon: css`
              font-size: 18px;
            `,
          }}>
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
