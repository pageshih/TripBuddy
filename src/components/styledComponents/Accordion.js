import styled from '@emotion/styled';
import { useState } from 'react';
import { css } from '@emotion/react';
import { palatte, mediaQuery } from './basicStyle';
import { FlexDiv, Container, FlexChildDiv, Image } from './Layout';

const ExpandIcon = styled.span`
  color: ${palatte.gray['700']};
  align-self: flex-start;
  transform: ${(props) => (props.isExpand ? 'rotateZ(180deg)' : null)};
  transition: transform 0.4s ease;
`;
const AccordionContainer = styled(FlexDiv)`
  flex-direction: column;
  padding: 20px;
  border-radius: 10px;
  background-color: ${palatte.gray['100']};
  gap: 20px;
  width: 100%;
  ${(props) => props.addCss}
`;

function Accordion(props) {
  const [isExpand, setIsExpand] = useState(false);
  return (
    <AccordionContainer>
      <FlexDiv
        justifyContent="space-between"
        addCss={css`
          cursor: pointer;
        `}
        onClick={() => setIsExpand((prev) => !prev)}>
        <FlexDiv direction="column" grow="1" gap="3px">
          {props.titleElement}
        </FlexDiv>
        <ExpandIcon className="material-icons" isExpand={isExpand}>
          expand_more
        </ExpandIcon>
      </FlexDiv>
      {isExpand && props.children}
    </AccordionContainer>
  );
}

export { Accordion };
