import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { P } from './Text';

const flex = css`
  display: flex;
`;
const TextContainer = styled.div`
  ${flex}
  align-items: center;
  ${(props) => props.addCss}
`;

const IconContainer = styled.div`
  ${flex}
  align-items:center;
  ${(props) => props.addCss};
`;

function TextWithIcon({
  addCss,
  onClick,
  iconLabel,
  iconName: Icon,
  children,
}) {
  return (
    <TextContainer addCss={addCss?.container} onClick={onClick}>
      <IconContainer addCss={addCss?.iconContainer}>
        {iconLabel && (
          <P
            addCss={css`
              color: inherit;
              font-size: inherit;
              ${addCss?.iconLabel}
            `}>
            {iconLabel}
          </P>
        )}
        <Icon sx={addCss?.icon} />
      </IconContainer>
      {typeof children === 'string' ? (
        <P
          addCss={css`
            color: inherit;
            font-size: inherit;
            ${addCss?.text}
          `}>
          {children}
        </P>
      ) : (
        children
      )}
    </TextContainer>
  );
}

TextWithIcon.propTypes = {
  onClick: PropTypes.func,
  addCss: PropTypes.object,
  iconLabel: PropTypes.string,
  iconName: PropTypes.any,
};
export default TextWithIcon;
