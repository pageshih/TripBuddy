import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';

const layout = (props) => css`
  display: ${props.display};
  margin: ${props.margin};
  padding: ${props.padding};
  height: ${props.height};
  width: ${props.width};
  max-width: ${props.maxWidth};
  min-width: ${props.minWidth};
  height: ${props.height};
  max-height: ${props.maxHeight};
  min-height: ${props.minHeight};
  overflow: ${props.overflow};
  position: ${props.position};
  background-color: ${props.backgroundColor};
`;
const flexParent = (props) => css`
  display: flex;
  flex-wrap: ${props.wrap};
  align-items: ${props.alignItems};
  justify-content: ${props.justifyContent};
  flex-direction: ${props.direction};
  gap: ${props.gap};
`;
const flexChild = (props) => css`
  flex: ${props.flex};
  flex-grow: ${props.grow};
  flex-shrink: ${props.shrink};
  flex-basis: ${props.basis};
  align-self: ${props.alignSelf};
  order: ${props.order};
`;
const Container = styled('div')`
  ${layout}
  ${(props) => props.mediaQuery}
`;

const FlexDiv = styled('div')`
  ${layout}
  ${flexParent}
  ${(props) => props.css}
  ${(props) => props.mediaQuery}
`;

const FlexChildDiv = styled('div')`
  ${flexChild}
  ${flexParent}
  ${layout}
  ${(props) => props.css}
  ${(props) => props.mediaQuery}
`;
const CardWrapper = styled.ul`
  display: flex;
  gap: ${(props) => props.gap};
  flex-direction: ${(props) => props.column && 'column'};
  flex-grow: ${(props) => props.grow};
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

const Image = (props) => (
  <div
    css={css`
      width: ${props.width};
      height: ${props.height};
      ${props.mediaQuery}
    `}>
    <img
      src={props.src}
      alt={props.alt}
      css={css`
        width: 100%;
        height: 100%;
        object-fit: cover;
      `}
    />
  </div>
);

export { FlexDiv, FlexChildDiv, CardWrapper, Card, Container, cardCss, Image };
