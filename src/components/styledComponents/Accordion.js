import styled from '@emotion/styled';
import { useState } from 'react';
import { css } from '@emotion/react';
import { palatte, mediaQuery } from './basicStyle';
import { FlexDiv, Container, FlexChildDiv, Image } from './Layout';

function Accordion(props) {
  const [isExpand, setIsExpand] = useState(false);
  return (
    <FlexDiv
      direction="column"
      padding="20px"
      borderRadius="10px"
      backgroundColor={palatte.gray['100']}
      gap="20px"
      addCss={css`
        width: 100%;
        transition-duration: 0.1s;
        ${props.addCss}
      `}>
      <FlexDiv
        justifyContent="space-between"
        addCss={css`
          cursor: pointer;
        `}
        onClick={() => setIsExpand((prev) => !prev)}>
        <FlexDiv direction="column" grow="1" gap="3px">
          {props.titleElement}
        </FlexDiv>
        <span
          className="material-icons"
          css={css`
            color: ${palatte.gray['500']};
          `}>
          {isExpand ? 'expand_less' : 'expand_more'}
        </span>
      </FlexDiv>
      {isExpand && props.children}
    </FlexDiv>
  );
}

export { Accordion };
