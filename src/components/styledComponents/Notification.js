import { useEffect, useState, useRef, useContext } from 'react';
import { ToastContainer, toast, cssTransition } from 'react-toastify';
import { CSSTransition } from 'react-transition-group';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import 'react-toastify/dist/ReactToastify.css';
import 'animate.css';
import '../../css/animation.css';
import '../../css/toastify.css';
import { Context } from '../../App';
import { palatte, styles } from './basic/common';
import { P } from './basic/Text';
import TextWithIcon from './basic/TextWithIcon';

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

const TooltipContainer = styled.div`
  position: absolute;
  top: -130%;
  left: -40%;
`;

const TooltipContent = styled.div`
  ${styles.flex}
  gap:5px;
  align-items: center;
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
function TooltipNotification({ fire, id, addCss, children }) {
  const tooltipRef = useRef();
  const [isOpen, setIsOpen] = useState(fire);
  const { notification, dispatchNotification } = useContext(Context);

  useEffect(() => {
    if (notification.fire && notification.id === `tooltip_${id}`) {
      setIsOpen(true);
      setTimeout(() => {
        setIsOpen(false);
        dispatchNotification({ type: 'close' });
      }, 3000);
    }
  }, [notification, dispatchNotification, id]);
  return (
    <div
      css={css`
        position: relative;
        ${addCss}
      `}>
      {tooltipMap[notification.type] && (
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
          <TooltipContainer>
            <TooltipContent ref={tooltipRef} type={notification.type}>
              <span className="material-icons">
                {tooltipMap[notification.type].icon}
              </span>
              <P>{notification.message}</P>
            </TooltipContent>
          </TooltipContainer>
        </CSSTransition>
      )}
      {children}
    </div>
  );
}
TooltipNotification.propsTypes = {
  fire: PropTypes.bool,
  id: PropTypes.string,
  addCss: PropTypes.object,
  children: PropTypes.any,
};
function NotificationText({ children, type }) {
  const notificationRef = useRef();
  const [isOpen, setIsOpen] = useState();
  useEffect(() => {
    if (children) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [children]);
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
          iconName={tooltipMap[type].icon}
          addCss={{
            container: css`
              gap: 5px;
              font-size: 14px;
              color: ${tooltipMap[type].basicColor};
            `,
            icon: css`
              font-size: 18px;
            `,
          }}>
          {children}
        </TextWithIcon>
      </div>
    </CSSTransition>
  );
}
Notification.propTypes = {
  type: PropTypes.string,
  children: PropTypes.any,
};

export {
  Notification,
  defaultNotification,
  notificationReducer,
  TooltipNotification,
  NotificationText,
};
