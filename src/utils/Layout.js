import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';

const FlexDiv = styled.div`
  display: flex;
  align-items: ${(props) => props.alignItems || 'stretch'};
  flex-direction: ${(props) => props.direction || 'row'};
  gap: ${(props) => props.gap || 0};
`;

export { FlexDiv };
