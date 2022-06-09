import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { RoundButtonSmall } from './Buttons/RoundButton';
import { palatte, styles } from './basic/common';
import { P } from './basic/Text';

const PaginationButton = ({ onClick, disabled, children: Icon }) => (
  <RoundButtonSmall
    size="18px"
    styled="gray700"
    type="button"
    onClick={onClick}
    disabled={disabled}
    css={css`
      border-radius: 7px;
      &:disabled {
        background-color: ${palatte.gray[200]};
        &:hover {
          box-shadow: none;
          color: ${palatte.gray[100]};
          cursor: unset;
        }
      }
    `}>
    <Icon sx={{ color: 'inherit', fontSize: 18 }} />
  </RoundButtonSmall>
);
PaginationButton.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.any,
};

const PaginationContainer = styled.div`
  ${styles.flex}
  justify-content:flex-end;
  align-items: center;
  padding: 5px 0;
  gap: 8px;
`;
function Pagination({ switchDay, day, finalDay }) {
  return (
    <PaginationContainer>
      <PaginationButton onClick={() => switchDay(day - 1)} disabled={day === 0}>
        {NavigateBefore}
      </PaginationButton>
      <P
        css={css`
          margin-bottom: 2px;
        `}>
        Day{day + 1}
      </P>
      <PaginationButton
        onClick={() => switchDay(day + 1)}
        disabled={day === finalDay}>
        {NavigateNext}
      </PaginationButton>
    </PaginationContainer>
  );
}

Pagination.propTypes = {
  switchDay: PropTypes.func,
  day: PropTypes.number,
  finalDay: PropTypes.number,
};
export { Pagination };
