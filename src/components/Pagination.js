/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { FlexDiv } from './styledComponents/Layout';
import { RoundButtonSmall } from './styledComponents/Button';
import { P, palatte } from './styledComponents/basicStyle';

const PaginationButton = (props) => (
  <RoundButtonSmall
    className="material-icons"
    size="18px"
    borderRadius="7px"
    styled="gray700"
    alignItems="center"
    margin="auto auto auto 0"
    type="button"
    onClick={props.onClick}
    disabled={props.disabled}
    addCss={css`
      &:disabled {
        background-color: ${palatte.gray[200]};
        &:hover {
          box-shadow: none;
          color: ${palatte.gray[100]};
          cursor: unset;
        }
      }
    `}>
    {props.children}
  </RoundButtonSmall>
);
function Pagination(props) {
  return (
    <FlexDiv
      justifyContent="flex-end"
      alignItems="center"
      padding="5px 0"
      gap="8px">
      <PaginationButton
        onClick={() => props.switchDay(props.day - 1)}
        disabled={props.day === 0}>
        navigate_before
      </PaginationButton>
      <P
        addCss={css`
          margin-bottom: 2px;
        `}>
        Day{props.day + 1}
      </P>
      <PaginationButton
        onClick={() => props.switchDay(props.day + 1)}
        disabled={props.day === props.finalDay}>
        navigate_next
      </PaginationButton>
    </FlexDiv>
  );
}
export { Pagination };
