import { useState } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { FlexDiv } from './Layout';

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
const checkboxCss = css`
  color: white;
  border: 1px solid lightgray;
  border-radius: 5px;
  cursor: pointer;
`;
const CheckboxDiv = styled.div`
  ${checkboxCss}
  position: absolute;
  top: -10px;
  left: -10px;
  align-self: flex-start;
  background-color: ${(props) =>
    props.selectedList?.some((item) => item === props.id)
      ? 'skyblue'
      : 'white'};
`;
const CheckAllDiv = styled.div`
  ${checkboxCss}
  background-color: ${(props) => (props.checked ? 'skyblue' : 'white')};
`;
const CheckboxCustom = (props) => {
  return (
    <label name={props.selectAll !== undefined ? 'selectAll' : props.id}>
      {props.selectAll !== undefined ? (
        <CheckAllDiv checked={props.selectAll} className="material-icons">
          check
        </CheckAllDiv>
      ) : (
        <CheckboxDiv
          id={props.id}
          selectedList={props.selectedList}
          className="material-icons">
          check
        </CheckboxDiv>
      )}
      <input
        type="checkbox"
        style={{ display: 'none' }}
        id={props.selectAll !== undefined ? 'selectAll' : props.id}
        onChange={(e) => {
          if (props.selectAll !== undefined) {
            props.onChange(e);
          } else {
            if (e.target.checked) {
              props.setSelectedList([...props.selectedList, props.id]);
            } else {
              props.setSelectedList(
                props.selectedList.filter((item) => item !== props.id)
              );
            }
          }
        }}
      />
    </label>
  );
};
function SelectAllCheckBox(props) {
  const [selectAll, setSelectAll] = useState(false);

  const selectAllItems = (e) => {
    if (e.target.checked) {
      setSelectAll(true);
      props.setAllChecked();
    } else {
      setSelectAll(false);
      props.setAllUnchecked();
    }
  };
  return (
    <FlexDiv gap="10px" alignItems="center" padding={props.padding}>
      <CheckboxCustom selectAll={selectAll} onChange={selectAllItems} />
      <p>全選</p>
    </FlexDiv>
  );
}

const TextAreaReview = styled.textarea`
  ${inputBase}
  width:100%;
  height: 100px;
  margin: 10px 0;
  &:read-only {
    border-color: lightgray;
    height: auto;
    padding-bottom: 1.4em;
    background-color: #fffced;
  }
`;

export {
  TextField,
  TextInput,
  CheckboxCustom,
  TextAreaReview,
  SelectAllCheckBox,
};
