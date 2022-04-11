import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';

const FlexDiv = styled.div`
  display: flex;
  align-items: ${(props) => props.alignItems || 'stretch'};
  flex-direction: ${(props) => props.direction || 'row'};
  gap: ${(props) => props.gap || 0};
`;
const CardStyle = css`
  border: 1px solid lightgray;
  padding: 10px;
`;

export { FlexDiv };
