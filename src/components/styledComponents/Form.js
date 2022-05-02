import { useState } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { palatte, mediaQuery } from './basicStyle';
import { FlexDiv } from './Layout';
import { compressImages } from '../../utils/utilities';

const inputBase = css`
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  border: 1px solid ${palatte.gray['400']};
  &:focus {
    outline: none;
    border: 2px solid ${palatte.primary.basic};
  }
  ${mediaQuery[0]} {
    font-size: 14px;
  }
`;
const inputBaseSmall = css`
  ${inputBase}
  padding: 5px 10px;
  font-size: 14px;
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
  border: 1px solid ${palatte.primary.basic};
  border-radius: 6px;
  cursor: pointer;
`;
const CheckboxDiv = styled.div`
  ${checkboxCss}
  background-color: ${(props) =>
    props.selectedList?.some((item) => item === props.id)
      ? palatte.primary.basic
      : palatte.white};
`;
const CheckAllDiv = styled.div`
  ${checkboxCss}
  background-color: ${(props) =>
    props.checked ? palatte.primary.basic : palatte.white};
`;
const CheckboxCustom = (props) => {
  return (
    <label name={props.selectAll !== undefined ? 'selectAll' : props.id}>
      {props.selectAll !== undefined ? (
        <CheckAllDiv
          css={props.addCss}
          checked={props.selectAll}
          className="material-icons">
          check
        </CheckAllDiv>
      ) : (
        <CheckboxDiv
          css={props.addCss}
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
              props.setSelectedList((prev) =>
                prev.filter((item) => item !== props.id)
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

const ReviewTagText = styled.p`
  padding: 5px 15px 8px 15px;
  font-size: 14px;
  background-color: ${(props) =>
    props.selectedList?.some((item) => item === props.id)
      ? palatte.secondary.basic
      : palatte.white};
  color: ${(props) =>
    props.selectedList?.some((item) => item === props.id)
      ? palatte.gray['900']
      : palatte.gray['500']};
  border-radius: 20px;
  border: ${(props) =>
    props.selectedList?.some((item) => item === props.id)
      ? 'none'
      : `1px solid${palatte.gray['500']}`};
  &:hover {
    background-color: ${(props) =>
      props.selectedList?.some((item) => item === props.id)
        ? palatte.secondary['500']
        : palatte.gray['600']};
    color: ${(props) =>
      props.selectedList?.some((item) => item === props.id)
        ? palatte.gray['800']
        : palatte.white};
    font-weight: 700;
  }
  &:hover {
    cursor: pointer;
  }
`;

const ReviewTag = (props) => {
  return (
    <label name={props.tag}>
      <ReviewTagText
        id={props.tag}
        selectedList={props.selectedList}
        className="material-icons">
        {props.children}
      </ReviewTagText>
      <input
        type="checkbox"
        value={props.tag}
        checked={
          props.selectedList?.some((checked) => props.tag === checked)
            ? true
            : false
        }
        style={{ display: 'none' }}
        id={props.tag}
        onChange={(e) => {
          const setChecked = (prev) => {
            if (e.target.checked) {
              return prev ? [...prev, props.tag] : [props.tag];
            } else {
              return prev.filter((tag) => e.target.value !== tag);
            }
          };
          props.setSelectedList((prev) => setChecked(prev));
        }}
      />
    </label>
  );
};
const uploadImageStyle = css`
  width: 250px;
  height: 200px;
  border-radius: 20px;
  overflow: hidden;
`;
const uploadImageBg = (props) => css`
  ${uploadImageStyle};
  background-color: ${palatte.gray['200']};
  display: flex;
  justify-content: center;
  align-items: center;
  & * {
    text-align: center;
    color: ${palatte.gray['700']};
  }
  &:hover {
    cursor: pointer;
    background-color: ${palatte.gray['300']};
    * {
      color: ${palatte.gray['800']};
    }
  }
`;

const UploadBtn = (props) => (
  <FlexDiv direction="column">
    <span
      className="material-icons"
      css={css`
        font-size: 48px;
      `}>
      add_circle
    </span>
    <p>添加照片</p>
  </FlexDiv>
);

function AddImages(props) {
  return (
    <label css={uploadImageBg}>
      <input
        type="file"
        style={{ display: 'none' }}
        accept="image/*"
        multiple
        onChange={async (e) => {
          let addCompressed = await compressImages(e.target.files);
          if (props.imageBuffer?.length > 0) {
            addCompressed = [...props.imageBuffer, ...addCompressed];
          }
          props.setImageBuffer(addCompressed);
        }}
      />
      <UploadBtn />
    </label>
  );
}

export {
  TextField,
  TextInput,
  CheckboxCustom,
  TextAreaReview,
  SelectAllCheckBox,
  inputBase,
  ReviewTag,
  inputBaseSmall,
  AddImages,
  uploadImageStyle,
};
