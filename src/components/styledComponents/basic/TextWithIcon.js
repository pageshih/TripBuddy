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

function TextWithIcon({ addCss, onClick, iconLabel, iconName, children }) {
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
        <span
          className="material-icons"
          css={css`
            color: inherit;
            font-size: inherit;
            ${addCss?.icon};
          `}>
          {iconName}
        </span>
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
  addCssWithShape: PropTypes.shape({
    container: PropTypes.string,
    iconContainer: PropTypes.string,
    iconLabel: PropTypes.string,
    icon: PropTypes.string,
    text: PropTypes.string,
  }),
  iconLabel: PropTypes.string,
  iconName: PropTypes.string,
};
export default TextWithIcon;
