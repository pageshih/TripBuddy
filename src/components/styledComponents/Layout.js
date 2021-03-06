import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { palatte, styles } from './basic/common';

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
  overflow-x: ${props.overflowX};
  overflow-y: ${props.overflowY};
  position: ${props.position};
  background-color: ${props.backgroundColor};
  box-shadow: ${props.boxShadow};
  border-radius: ${props.borderRadius};
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
  ${(props) => props.addCss}
`;

const FlexDiv = styled('div')`
  ${layout}
  ${flexParent}
  ${(props) => props.addCss}
`;

const FlexChildDiv = styled('div')`
  ${flexChild}
  ${flexParent}
  ${layout}
  ${(props) => props.addCss}
`;

const Image = (props) => (
  <div
    css={css`
      width: ${props.width};
      height: ${props.height};
      min-width: ${props.minWidth};
      max-width: ${props.maxWidth};
      min-height: ${props.minHeight};
      max-height: ${props.maxHeight};
      position: relative;
      overflow: hidden;
      ${props.round && props.size
        ? css`
            width: ${props.size};
            height: ${props.size};
            border-radius: 50%;
          `
        : null}
      ${props.shadow
        ? css`
            box-shadow: ${styles.shadow};
          `
        : null}
      ${props.addCss}
    `}>
    <img
      src={props.src}
      alt={props.alt}
      css={css`
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: ${props.blur && 'blur(3px)'};
      `}
    />
    {props.children}
    {props.blur && (
      <div
        css={css`
          position: absolute;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: ${palatte.gray['700']};
          opacity: 0.4;
        `}
      />
    )}
  </div>
);

export { FlexDiv, FlexChildDiv, Container, Image };
