/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { palatte } from './basic/common';
import { P } from './basic/Text';
import { FlexDiv } from './Layout';

function Footer() {
  return (
    <FlexDiv
      justifyContent="center"
      padding="15px"
      addCss={css`
        background-color: ${palatte.gray['800']};
        margin-top: auto;
      `}>
      <P color={palatte.white} fontSize="14px">
        Copyright Ⓒ 2022, Page Shih. All right reserved.
      </P>
    </FlexDiv>
  );
}

export default Footer;
