import { useEffect, useState, useContext } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import PropTypes from 'prop-types';
import { Context } from '../../App';
import { palatte, mediaQuery, styles } from './basic/common';
import { P } from './basic/Text';
import { Image } from './Layout';
import { Button, ButtonOutline } from './Buttons/Button';
import { RoundButtonSmallWhite, RoundButtonSmall } from './Buttons/RoundButton';
import { compressImages, timestampToDateInput } from '../../utils/utilities';
import { Modal, Confirm } from './Modal';

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
  width:  100%;
`;
const Select = styled.select`
  ${inputBase}
  width: 100%;
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
  -webkit-border-radius: 6px;
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
      name={props.isSelectAllBox ? 'selectAll' : props.id}>
      {props.isSelectAllBox ? (
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
        id={props.isSelectAllBox ? 'selectAll' : props.id}
        onChange={(e) => {
          if (props.isSelectAllBox) {
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
    <div
      css={css`
        ${styles.flex}
        gap: 12px;
        align-items: center;
      `}>
      <CheckboxCustom
        size={props.size}
        isSelectAll={props.isSelectAll}
        isSelectAllBox
        onChange={selectAllItems}
      />
      <P
        css={css`
          font-size: ${`calc(${props.size} - '6px')` || '18px'};
          color: ${palatte.gray[800]};
          white-space: nowrap;
        `}>
        全選
      </P>
    </div>
  );
}

const TextAreaReview = styled.textarea`
  ${inputBase}
  width:100%;
  height: auto;
  margin: 10px 0;
  border-color: transparent;
  background-color: ${(props) =>
    props.isEmptyInput ? palatte.gray[200] : palatte.white};
  &:read-only {
    border-color: lightgray;
    height: auto;
    background-color: ${palatte.white};
  }
  &:hover {
    background-color: ${palatte.white};
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
        <P
          addCss={css`
            white-space: nowrap;
          `}>
          {props.children}
        </P>
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

const UploadText = () => (
  <div
    css={css`
      ${styles.flexColumn}
    `}>
    <span
      className="material-icons"
      css={css`
        font-size: 48px;
      `}>
      add_circle
    </span>
    <p>添加照片</p>
  </div>
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
  const { dispatchNotification } = useContext(Context);
  const [imageBuffer, setImageBuffer] = useState([]);

  useEffect(() => {
    if (imageBuffer.length > 0) {
      dispatchNotification({
        type: 'fire',
        playload: {
          type: 'primary',
          id: 'confirm_image',
          message: props.confirmMessage,
          imgSrc:
            imageBuffer.length > 0 ? URL.createObjectURL(imageBuffer[0]) : null,
          imgAlt: 'preview-cover-photo',
          yesMessage: '上傳圖片',
          yesAction: () => props.upload(imageBuffer),
        },
      });
    } else {
      dispatchNotification({
        type: 'close',
      });
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
    </>
  );
}
const ChangeTravelModeSelect = (props) => {
  return (
    <Select
      value={props.travelMode}
      onChange={() => props.onChange()}
      onBlur={props.onBlur}
      autoFocus={props.isEdit}>
      <option value="loading" disabled hidden>
        ...
      </option>
      <option value="DRIVING">開車</option>
      <option value="TRANSIT">大眾運輸</option>
      <option value="WALKING">走路</option>
      <option value="BICYCLING">騎自行車</option>
    </Select>
  );
};

const DateTimeTextInput = (props) => (
  <div
    css={css`
      position: relative;
      width: ${props.width};
    `}>
    <TextInput
      color={props.color}
      ref={props.inputRef}
      css={props.addCss}
      fontSize={props.fontSize}
      {...props.inputProps}
    />
    <div
      css={css`
        position: absolute;
        right: 15px;
        top: calc(50%);
      `}>
      {props.InputProps?.endAdornment}
    </div>
  </div>
);
function CustomDatePicker(props) {
  return (
    <DatePicker
      value={timestampToDateInput(props.value)}
      inputFormat="yyyy/MM/dd"
      onChange={(value) => {
        props.onChange(new Date(value).getTime());
      }}
      renderInput={(params) => (
        <DateTimeTextInput
          color={props.color}
          width={props.width}
          fontSize={props.fontSize}
          {...params}
        />
      )}
    />
  );
}
function CustomTimePicker(props) {
  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TimePicker
        value={new Date(props.value)}
        ampmInClock={true}
        onChange={(value) => {
          props.onChange(new Date(value).getTime());
        }}
        renderInput={(params) => (
          <DateTimeTextInput
            color={props.color}
            fontSize={props.fontSize}
            width={props.width}
            addCss={props.addCss}
            {...params}
          />
        )}
      />
    </LocalizationProvider>
  );
}
function CustomDateRangePicker(props) {
  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <CustomDatePicker
        width={props.width}
        value={props.startTimestamp}
        onChange={(newStartTimestamp) => {
          props.setStartTimestamp(newStartTimestamp);
        }}
      />
      <span
        css={css`
          color: ${props.color};
        `}>
        {props.conjunction || ' - '}
      </span>
      <CustomDatePicker
        value={props.endTimestamp}
        width={props.width}
        onChange={(newEndTimestamp) => {
          props.setEndTimestamp(newEndTimestamp);
        }}
      />
    </LocalizationProvider>
  );
}

export {
  inputBase,
  inputBaseSmall,
  TextInput,
  TextField,
  CheckboxCustom,
  TextAreaReview,
  SelectAllCheckBox,
  ReviewTag,
  AddImages,
  uploadImageStyle,
  AddImageRoundBtn,
  Select,
  SelectSmall,
  ChangeTravelModeSelect,
  CustomDateRangePicker,
  CustomDatePicker,
  CustomTimePicker,
};
