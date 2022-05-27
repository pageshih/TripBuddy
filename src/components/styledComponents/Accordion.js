import { useRef, useState } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { palatte, styles } from './basic/common';
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
    color: ${(props) => (props.isExpand ? palatte.danger.basic : null)};
  }
`;
const AccordionContainer = styled.div`
  ${styles.flexColumn}
  padding: 20px;
  border-radius: 10px;
  background-color: ${palatte.gray['100']};
  width: 100%;
`;
const HeaderContainer = styled.div`
  ${styles.flex}
  justify-content:space-between;
  cursor: ${(props) => (props.pointerCursor ? 'pointer' : 'normal')};
`;
const TitleContainer = styled.div`
  ${styles.flexColumn}
  grow:1;
  gap: 3px;
`;
const Gap = styled.div`
  height: ${(props) => props.gap || '20px'};
`;
function Accordion({
  isDefualtExpand,
  addCss,
  isDisableExpand,
  isAllowEdit,
  titleElement,
  isFilledArrow,
  isHideContent,
  gap,
  children,
}) {
  const [isExpand, setIsExpand] = useState(isDefualtExpand || false);
  const contentRef = useRef();

  return (
    <AccordionContainer css={addCss}>
      <HeaderContainer
        pointerCursor={!isDisableExpand || isAllowEdit}
        onClick={() =>
          !isDisableExpand || isAllowEdit ? setIsExpand((prev) => !prev) : null
        }>
        <TitleContainer>{titleElement}</TitleContainer>
        {isAllowEdit ? (
          isDisableExpand ? (
            <ExpandAddIcon className="material-icons" isExpand={isExpand}>
              add_circle
            </ExpandAddIcon>
          ) : (
            <ExpandIcon className="material-icons" isExpand={isExpand}>
              expand_more
            </ExpandIcon>
          )
        ) : isDisableExpand ? null : (
          <ExpandIcon className="material-icons" isExpand={isExpand}>
            {isFilledArrow ? 'arrow_drop_down' : 'expand_more'}
          </ExpandIcon>
        )}
      </HeaderContainer>
      {(!isAllowEdit && !isHideContent) ||
      isAllowEdit ||
      isHideContent === undefined ? (
        <Collapse
          nodeRef={contentRef}
          in={isExpand}
          timeout={300}
          unmountOnExit>
          <div ref={contentRef}>
            <Gap gap={gap} />
            {children}
          </div>
        </Collapse>
      ) : null}
    </AccordionContainer>
  );
}
Accordion.propTypes = {
  addCss: PropTypes.object,
  isHideContent: PropTypes.bool,
  gap: PropTypes.string,
  isDefualtExpand: PropTypes.bool,
  isAllowEdit: PropTypes.bool,
  isDisableExpand: PropTypes.bool,
  isFilledArrow: PropTypes.bool,
  titleElement: PropTypes.any,
  children: PropTypes.any,
};

const AccordionSmallContainer = styled.div`
  ${styles.flexColumn};
`;
const AccordionSmallHeaderContainer = styled.div`
  ${styles.flex};
  justify-content: space-between;
  cursor: pointer;
`;
const AccordionSmallTitleWrapper = styled.div`
  ${styles.flexColumn};
  grow: 1;
  gap: 3px;
`;
const AccordionContentContainer = styled.div`
  ${styles.flexColumn};
  gap: ${(props) => props.gap || '10px'};
`;
function AccordionSmall({ titleElement, isFilledArrow, gap, children }) {
  const [isExpand, setIsExpand] = useState(false);
  const contentRef = useRef();
  return (
    <AccordionSmallContainer>
      <AccordionSmallHeaderContainer
        onClick={() => setIsExpand((prev) => !prev)}>
        <AccordionSmallTitleWrapper>{titleElement}</AccordionSmallTitleWrapper>
        <ExpandIcon
          className="material-icons"
          isExpand={isExpand}
          addCss={css`
            font-size: 20px;
          `}>
          {isFilledArrow ? 'arrow_drop_down' : 'expand_more'}
        </ExpandIcon>
      </AccordionSmallHeaderContainer>
      <Collapse nodeRef={contentRef} in={isExpand} timeout={300} unmountOnExit>
        <Gap gap={gap || '10px'} />
        <AccordionContentContainer gap={gap} ref={contentRef}>
          {children}
        </AccordionContentContainer>
      </Collapse>
    </AccordionSmallContainer>
  );
}
AccordionSmall.propTypes = {
  isFilledArrow: PropTypes.bool,
  gap: PropTypes.string,
  titleElement: PropTypes.any,
  children: PropTypes.any,
};

export { Accordion, AccordionSmall };
