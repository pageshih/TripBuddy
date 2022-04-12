import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';

const FlexDiv = styled.div`
  display: flex;
  flex-wrap: ${(props) => props.wrap || 'nowrap'};
  align-items: ${(props) => props.alignItems || 'stretch'};
  justify-content: ${(props) => props.justifyContent || 'flex-start'};
  flex-direction: ${(props) => props.direction || 'row'};
  gap: ${(props) => props.gap || 0};
`;

const FlexChildDiv = styled.div`
  flex: ${(props) => props.flex || '0 1 auto'};
  flex-grow: ${(props) => props.grow || '0'};
  flex-shrink: ${(props) => props.shrink || '1'};
  flex-basis: ${(props) => props.basis || 'auto'};
  align-self: ${(props) => props.alignSelf || 'auto'};
  order: ${(props) => props.order || '0'};
`;
const cardStyle = css`
  border: 1px solid lightgray;
  padding: 10px;
  list-style: none;
  display: flex;
`;
const CardRow = styled.ul`
  ${cardStyle}
  gap: ${(props) => props.gap || '0px'}
`;

export { FlexDiv, CardRow, FlexChildDiv };
