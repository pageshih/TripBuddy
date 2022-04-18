import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';

const Container = styled.div`
  max-width: ${(props) => props.maxWidth};
  margin: ${(props) => props.margin};
`;

const FlexDiv = styled.div`
  display: flex;
  flex-wrap: ${(props) => props.wrap};
  align-items: ${(props) => props.alignItems};
  justify-content: ${(props) => props.justifyContent};
  flex-direction: ${(props) => props.direction};
  gap: ${(props) => props.gap};
  height: ${(props) => props.height};
  min-height: ${(props) => props.minHeight};
`;

const FlexChildDiv = styled.div`
  flex: ${(props) => props.flex};
  flex-grow: ${(props) => props.grow};
  flex-shrink: ${(props) => props.shrink};
  flex-basis: ${(props) => props.basis};
  align-self: ${(props) => props.alignSelf};
  order: ${(props) => props.order};
  height: ${(props) => props.height};
  overflow: ${(props) => props.overflow};
  padding: ${(props) => props.padding};
`;
const CardWrapper = styled.ul`
  display: flex;
  gap: ${(props) => props.gap};
  flex-direction: ${(props) => props.column && 'column'};
  max-width: ${(props) => props.maxWidth};
  background-color: ${(props) => props.backgroundColor};
  padding: ${(props) => props.padding};
`;
const cardCss = css`
  border: 1px solid lightgray;
  padding: 10px;
  display: flex;
  &:hover {
    cursor: pointer;
    box-shadow: 0px 0px 5px lightgray;
  }
`;
const Card = styled.li`
  ${cardCss}
  gap: ${(props) => props.gap};
  flex-basis: ${(props) => props.basis};
  flex-direction: ${(props) => props.column && 'column'};
  position: ${(props) => props.position};
`;

export { FlexDiv, FlexChildDiv, CardWrapper, Card, Container, cardCss };
