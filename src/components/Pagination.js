import { FlexDiv } from './styledComponents/Layout';
function Pagination(props) {
  return (
    <FlexDiv justifyContent="flex-end" padding="5px 0">
      {props.day > 0 && (
        <FlexDiv
          as="button"
          alignItems="center"
          margin="auto auto auto 0"
          type="button"
          onClick={() => props.switchDay(props.day - 1)}>
          <span className="material-icons">navigate_before</span>第{props.day}天
        </FlexDiv>
      )}
      {props.day < props.finalDay && (
        <FlexDiv
          as="button"
          alignItems="center"
          type="button"
          onClick={() => props.switchDay(props.day + 1)}>
          第{props.day + 2}天
          <span className="material-icons">navigate_next</span>
        </FlexDiv>
      )}
    </FlexDiv>
  );
}
export { Pagination };
