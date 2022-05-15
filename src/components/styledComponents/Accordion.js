import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import { palatte, mediaQuery } from './basicStyle';
import { FlexDiv, Container, FlexChildDiv, Image } from './Layout';
import '../../css/animation.css';
import Collapse from '@mui/material/Collapse';

const ExpandIcon = styled.span`
  color: ${palatte.gray['700']};
  align-self: flex-start;
  transform: ${(props) => (props.isExpand ? 'rotateZ(180deg)' : null)};
  transition: transform 0.4s ease;
  font-size: ${(props) => props.fontSize || '24px'};
  ${(props) => props.addCss}
`;
const ExpandAddIcon = styled(ExpandIcon)`
  transform: ${(props) => (props.isExpand ? 'rotateZ(135deg)' : null)};
  &:hover {
    color: ${(props) => props.isExpand && palatte.danger.basic};
  }
`;
const AccordionContainer = styled(FlexDiv)`
  flex-direction: column;
  padding: 20px;
  border-radius: 10px;
  background-color: ${palatte.gray['100']};
  width: 100%;
  ${(props) => props.addCss}
`;

function Accordion(props) {
  const [isExpand, setIsExpand] = useState(props.isDefualtExpand || false);
  const contentRef = useRef();

  return (
    <AccordionContainer addCss={props.addCss}>
      <FlexDiv
        justifyContent="space-between"
        addCss={css`
          cursor: ${!props.isDisableExpand || props.isAllowEdit
            ? 'pointer'
            : 'normal'};
        `}
        onClick={() =>
          !props.isDisableExpand || props.isAllowEdit
            ? setIsExpand((prev) => !prev)
            : null
        }>
        <FlexDiv direction="column" grow="1" gap="3px">
          {props.titleElement}
        </FlexDiv>
        {props.isAllowEdit ? (
          props.isDisableExpand ? (
            <ExpandAddIcon className="material-icons" isExpand={isExpand}>
              add_circle
            </ExpandAddIcon>
          ) : (
            <ExpandIcon className="material-icons" isExpand={isExpand}>
              expand_more
            </ExpandIcon>
          )
        ) : props.isDisableExpand ? null : (
          <ExpandIcon className="material-icons" isExpand={isExpand}>
            {props.filled ? 'arrow_drop_down' : 'expand_more'}
          </ExpandIcon>
        )}
      </FlexDiv>
      {(!props.isAllowEdit && props.isHideContent) ||
      props.isAllowEdit ||
      props.isHideContent === undefined ? (
        <Collapse
          nodeRef={contentRef}
          in={isExpand}
          timeout={300}
          unmountOnExit>
          <Container ref={contentRef}>
            <div
              css={css`
                height: ${props.gap || '20px'};
              `}></div>
            {props.children}
          </Container>
        </Collapse>
      ) : null}
    </AccordionContainer>
  );
}
Accordion.propTypes = {
  isDefualtExpand: PropTypes.bool,
  isAllowEdit: PropTypes.bool,
  isDisableExpand: PropTypes.bool,
  filled: PropTypes.bool,
  titleElement: PropTypes.any,
  children: PropTypes.any,
};
function AccordionSmall(props) {
  const [isExpand, setIsExpand] = useState(false);
  const contentRef = useRef();
  return (
    <FlexDiv direction="column">
      <FlexDiv
        justifyContent="space-between"
        addCss={css`
          cursor: pointer;
        `}
        onClick={() => setIsExpand((prev) => !prev)}>
        <FlexDiv direction="column" grow="1" gap="3px">
          {props.titleElement}
        </FlexDiv>
        <ExpandIcon
          className="material-icons"
          isExpand={isExpand}
          addCss={css`
            font-size: 20px;
          `}>
          {props.filled ? 'arrow_drop_down' : 'expand_more'}
        </ExpandIcon>
      </FlexDiv>
      <Collapse nodeRef={contentRef} in={isExpand} timeout={300} unmountOnExit>
        <div
          css={css`
            height: ${props.gap || '10px'};
          `}></div>
        <FlexDiv direction="column" gap={props.gap || '10px'} ref={contentRef}>
          {props.children}
        </FlexDiv>
      </Collapse>
    </FlexDiv>
  );
}

export { Accordion, AccordionSmall };
