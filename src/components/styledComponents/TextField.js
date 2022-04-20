import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';

const inputBase = css`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid gray;
`;
const labelBase = css`
  margin-bottom: 5px;
  font-size: 14px;
`;
const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

function TextField({ children, placeholder, value, onChange, type }) {
  return (
    <div
      css={css`
        ${flexColumn}
        margin-bottom: 10px;
      `}>
      <label css={labelBase}>{children}</label>
      <input
        css={inputBase}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        type={type}
      />
    </div>
  );
}

const TextInput = styled.input`
  ${inputBase}
  width: 100%;
`;

const CheckboxDiv = styled.div`
  color: white;
  border: 1px solid lightgray;
  border-radius: 5px;
  align-self: flex-start;
  position: absolute;
  top: -10px;
  left: -10px;
  background-color: ${(props) =>
    props.selectedList?.some((item) => item === props.id)
      ? 'skyblue'
      : 'white'};
  cursor: pointer;
`;
const CheckboxCustom = (props) => {
  return (
    <label name={props.id}>
      <CheckboxDiv
        id={props.id}
        selectedList={props.selectedList}
        className="material-icons">
        check
      </CheckboxDiv>
      <input
        type="checkbox"
        style={{ display: 'none' }}
        id={props.id}
        onChange={(e) => {
          if (e.target.checked) {
            props.setSelectedList([...props.selectedList, props.id]);
          } else {
            props.setSelectedList(
              props.selectedList.filter((item) => item !== props.id)
            );
          }
        }}
      />
    </label>
  );
};

export { TextField, TextInput, CheckboxCustom };
