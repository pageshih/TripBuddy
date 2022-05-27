/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { palatte } from './basic/common';
import { P } from './basic/Text';

function Footer() {
  return (
    <div
      css={css`
        justify-content: center;
        padding: 15px;
        background-color: ${palatte.gray['800']};
        margin-top: auto;
      `}>
      <P
        css={css`
          color: ${palatte.white};
          font-size: 14px;
        `}>
        Copyright Ⓒ 2022, Page Shih. All right reserved.
      </P>
    </div>
  );
}

export default Footer;
