import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { palatte, mediaQuery, P } from './basicStyle';
import { Container, FlexChildDiv, FlexDiv, Image } from './Layout';
import {
  RoundButtonSmallWhite,
  Button,
  ButtonOutline,
  RoundButtonSmall,
} from './Button';
import { compressImages } from '../../utils/utilities';
import { Modal } from './Modal';

const inputBase = css`
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  border: 1px solid ${palatte.gray['400']};
  &:focus {
    outline-color: ${palatte.primary.basic};
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
  width: ${(props) => props.width || '100%'};
`;
const Select = styled.select`
  ${inputBase}
  width: ${(props) => props.width || '100%'};
  min-width: fit-content;
  color: ${(props) => (props.value ? palatte.dark : palatte.gray[600])};
  & option:disabled {
    color: ${palatte.gray[400]};
  }
`;
const SelectSmall = styled(Select)`
  font-size: 14px;
  padding: 5px 10px;
`;
const checkboxCss = (props) => css`
  color: white;
  border: 1px solid ${palatte.primary.basic};
  border-radius: 6px;
  cursor: pointer;
  font-size: ${props.size || '24px'};
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
    <label
      css={css`
        width: ${props.size || '24px'};
        height: ${props.size || '24px'};
      `}
      name={props.isSelectAll !== undefined ? 'selectAll' : props.id}>
      {props.isSelectAll !== undefined ? (
        <CheckAllDiv
          size={props.size}
          css={props.addCss}
          checked={props.isSelectAll}
          className="material-icons">
          check
        </CheckAllDiv>
      ) : (
        <CheckboxDiv
          size={props.size}
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
        checked={
          props.isSelectAll ||
          props.selectedList?.some((id) => id === props.id) ||
          false
        }
        id={props.isSelectAll !== undefined ? 'selectAll' : props.id}
        onChange={(e) => {
          if (props.isSelectAll !== undefined) {
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
CheckboxCustom.propTypes = {
  id: PropTypes.string,
  selectedList: PropTypes.array,
  setSelectedList: PropTypes.func,
  selectAll: PropTypes.bool,
  onChange: PropTypes.func,
  addCss: PropTypes.object,
};
function SelectAllCheckBox(props) {
  const selectAllItems = (e) => {
    if (e.target.checked) {
      props.setIsSelectAll(true);
      props.setAllChecked();
    } else {
      props.setIsSelectAll(false);
      props.setAllUnchecked();
    }
  };
  return (
    <FlexDiv gap="12px" alignItems="center" padding={props.padding}>
      <CheckboxCustom
        size={props.size}
        isSelectAll={props.isSelectAll}
        onChange={selectAllItems}
      />
      <P
        fontSize={`calc(${props.size} - '6px')` || '18px'}
        color={palatte.gray[800]}>
        全選
      </P>
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
const ReviewTagContainer = styled.div`
  padding: 3px 15px 5px 15px;
  background-color: ${(props) =>
    props.selectedList?.some((item) => item === props.id)
      ? palatte.secondary.basic
      : palatte.white};
  border-radius: 20px;
  outline: ${(props) =>
    props.selectedList?.some((item) => item === props.id)
      ? 'none'
      : `1px solid${palatte.gray['500']}`};
  outline-offset: -1px;
  & > * {
    font-size: 14px;
    color: ${(props) =>
      props.selectedList?.some((item) => item === props.id)
        ? palatte.gray['900']
        : palatte.gray['500']};
  }
  &:hover {
    background-color: ${(props) =>
      props.selectedList?.some((item) => item === props.id)
        ? palatte.secondary['500']
        : palatte.gray['600']};
    & > * {
      color: ${(props) =>
        props.selectedList?.some((item) => item === props.id)
          ? palatte.gray['800']
          : palatte.white};
      font-weight: 700;
    }
    cursor: pointer;
  }
`;

const ReviewTag = (props) => {
  return (
    <label name={props.tag}>
      <ReviewTagContainer id={props.tag} selectedList={props.selectedList}>
        <p className="material-icons">{props.children}</p>
      </ReviewTagContainer>
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
  flex-basis: 250px;
  height: 200px;
  border-radius: 20px;
  overflow: hidden;
`;
const UploadImageBg = styled.div`
  ${uploadImageStyle};
  background-color: ${(props) =>
    props.isScroll ? 'transparent' : palatte.gray['200']};
  display: flex;
  justify-content: center;
  align-items: center;
  ${(props) =>
    props.isScroll &&
    css`
      max-width: fit-content;
      align-self: center;
      position: relative;
      overflow: visible;
      &::before {
        content: '';
        display: block;
        position: absolute;
        width: 10px;
        height: calc(100% + 10px);
        left: -30px;
        background: linear-gradient(90deg, rgba(0, 0, 0, 0), ${palatte.shadow});
      }
    `}
  & * {
    text-align: center;
    color: ${palatte.gray['700']};
  }

  &:hover {
    cursor: pointer;
    background-color: ${(props) =>
      props.isScroll ? 'transparent' : palatte.gray['300']};
    * {
      color: ${palatte.gray['800']};
    }
  }
  ${(props) => props.addCss};
`;

const UploadText = (props) => (
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

const FileInputHidden = (props) => (
  <input
    type="file"
    css={css`
      display: none;
    `}
    accept="image/*"
    multiple={props.multiple}
    onChange={async (e) => {
      let addCompressed = await compressImages(e.target.files);
      if (props.multiple) {
        if (props.imageBuffer?.length > 0) {
          addCompressed = [...props.imageBuffer, ...addCompressed];
        }
        props.setImageBuffer(addCompressed);
      } else {
        props.setImageBuffer(addCompressed);
      }
    }}
  />
);

function AddImages(props) {
  return (
    <UploadImageBg as="label" isScroll={props.isScroll}>
      <FileInputHidden
        multiple
        setImageBuffer={props.setImageBuffer}
        imageBuffer={props.imageBuffer}
      />
      <UploadText />
    </UploadImageBg>
  );
}
function AddImageRoundBtn(props) {
  const [imageBuffer, setImageBuffer] = useState([]);
  const [isShowModal, setIsShowModal] = useState();

  useEffect(() => {
    if (imageBuffer.length > 0) {
      setIsShowModal(true);
    } else {
      setIsShowModal(false);
    }
  }, [imageBuffer]);
  const button = css`
    cursor: pointer;
    ${props.addCss}
  `;
  return (
    <>
      {props.white ? (
        <RoundButtonSmallWhite
          as="label"
          size={props.size}
          className="material-icons"
          css={button}>
          <FileInputHidden
            setImageBuffer={setImageBuffer}
            imageBuffer={imageBuffer}
          />
          {props.icon}
        </RoundButtonSmallWhite>
      ) : (
        <RoundButtonSmall
          as="label"
          size={props.size}
          styled={props.styled}
          className="material-icons"
          css={button}>
          <FileInputHidden
            setImageBuffer={setImageBuffer}
            imageBuffer={imageBuffer}
          />
          {props.icon}
        </RoundButtonSmall>
      )}
      {isShowModal && (
        <Modal
          width="fit-content"
          height="fit-content"
          maxWidth="1000px"
          maxHeight="100vh"
          close={() => setIsShowModal(false)}>
          <Image
            src={
              imageBuffer.length > 0
                ? URL.createObjectURL(imageBuffer[0])
                : null
            }
            alt="preview-cover-photo"
          />
          <FlexDiv
            width="400px"
            gap="20px"
            margin="20px auto"
            alignItems="center"
            direction="column">
            <P fontSize="20px" textAlign="center">
              {props.confirmMessage}
            </P>
            <FlexChildDiv width="100%" justifyContent="center" gap="20px">
              <ButtonOutline
                styled="danger"
                onClick={() => setIsShowModal(false)}>
                取消
              </ButtonOutline>
              <Button
                styled="primary"
                onClick={() => props.upload(imageBuffer, setIsShowModal)}>
                確定
              </Button>
            </FlexChildDiv>
          </FlexDiv>
        </Modal>
      )}
    </>
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
  AddImageRoundBtn,
  Select,
  SelectSmall,
};
