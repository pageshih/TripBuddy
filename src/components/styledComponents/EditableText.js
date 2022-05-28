import { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { palatte, mediaQuery, styles } from './basic/common';
import { P, textComponents, headingFontSize } from './basic/Text';
import { TextInput, CustomDateRangePicker, CustomTimePicker } from './Form';
import { ButtonSmall } from './Buttons/Button';
import { timestampToString } from '../../utils/utilities';

const hoverEffect = css`
  width: fit-content;
  &:hover {
    background-color: ${palatte.shadow};
    border-radius: 5px;
    outline: 5px solid ${palatte.shadow};
  }
`;

const EditableTextInput = styled(TextInput)`
  width: auto;
  border: none;
  outline: 1px solid ${palatte.gray['400']};
  outline-offset: 2px;
  font-weight: 700;
  padding: 0;
  text-align: center;
  font-size: ${(props) => headingFontSize.desktop[props.level]};
  &:focus {
    outline: 2px solid ${palatte.primary.basic};
  }
  ${mediaQuery[0]} {
    font-size: ${(props) => headingFontSize.mobile[props.level]};
  }
  ${(props) => props.addCss}
  ${(props) => props.addInputCss}
`;
function EditableText({
  level,
  children,
  onSubmit,
  isDefaultShowText,
  isAllowEdit,
  as,
  addCss,
  addInputCss,
}) {
  const [isEdit, setIsEdit] = useState(true);
  const [value, setValue] = useState('');
  const inputRef = useRef();
  const Text = textComponents[level];
  useEffect(() => {
    setValue(children);
  }, [children]);
  const submit = (e) => {
    e?.preventDefault();
    setIsEdit(false);
    if (value && !value.match(/^ +$/)) {
      if (value !== children && value.length > 0) {
        onSubmit(value);
      }
    } else {
      setValue(children);
    }
  };

  useEffect(() => {
    if (isDefaultShowText) {
      setIsEdit(false);
    } else {
      setIsEdit(true);
    }
    if (!isAllowEdit) {
      setIsEdit(false);
      submit();
    }
  }, [isDefaultShowText, isAllowEdit]);

  useEffect(() => {
    if (inputRef.current && isEdit) {
      inputRef.current.select();
    }
  }, [inputRef, isEdit]);

  const countTextLength = (text) => {
    const encodedText = encodeURIComponent(text);
    return encodedText.replace(/%[A-F\d]{2}/g, 'U').length;
  };
  return (
    <>
      {isEdit && isAllowEdit ? (
        <form
          onSubmit={submit}
          css={css`
            display: flex;
            gap: 10px;
            align-items: center;
          `}>
          <EditableTextInput
            level={level}
            ref={inputRef}
            type="text"
            addInputCss={addInputCss}
            addCss={addCss}
            size={countTextLength(value) > 0 ? countTextLength(value) : 1}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
          />
        </form>
      ) : (
        <Text
          as={as}
          addCss={css`
            padding: 0 12px 0 0;
            ${isAllowEdit && hoverEffect}
            ${addCss}
          `}
          onClick={() => {
            if (isAllowEdit) setIsEdit(true);
          }}>
          {value}
        </Text>
      )}
    </>
  );
}
EditableText.propTypes = {
  children: PropTypes.string,
  level: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onSubmit: PropTypes.func,
  as: PropTypes.string,
  isDefaultShowText: PropTypes.bool,
  isAllowEdit: PropTypes.bool,
  addCss: PropTypes.object,
  addInputCss: PropTypes.object,
};

const UpdateDurationButton = ({ children }) => (
  <ButtonSmall
    styled="gray"
    css={css`
      width: fit-content;
      padding: 10px 15px;
      margin: auto auto auto 10px;
    `}>
    {children}
  </ButtonSmall>
);

const EditableDateContainer = styled.form`
  ${styles.flex};
  gap: 5px;
  align-items: center;
`;

function EditableDate({
  start,
  end,
  isDefaultShowText,
  isAllowEdit,
  isTime,
  onSubmit,
  inputFontSize,
  fontSize,
  color,
  width,
  addCss,
}) {
  const [isEdit, setIsEdit] = useState();
  const [startTimestamp, setStartTimestamp] = useState();
  const [endTimestamp, setEndTimestamp] = useState();
  useEffect(() => {
    setStartTimestamp(start);
    setEndTimestamp(end);
  }, [start, end]);
  useEffect(() => {
    if (isDefaultShowText) {
      setIsEdit(false);
    } else {
      setIsEdit(isAllowEdit);
    }
  }, [isAllowEdit]);

  const submit = useCallback(
    (e) => {
      e?.preventDefault();
      if (isTime) {
        onSubmit(startTimestamp);
        setIsEdit(false);
      } else if (start !== startTimestamp || end !== endTimestamp) {
        onSubmit(
          startTimestamp,
          endTimestamp,
          setEndTimestamp,
          setStartTimestamp,
          setIsEdit
        );
      }
    },
    [startTimestamp, endTimestamp, setEndTimestamp, setStartTimestamp]
  );

  return (
    <>
      {isEdit ? (
        <EditableDateContainer onSubmit={submit}>
          {isTime ? (
            <>
              <CustomTimePicker
                value={startTimestamp}
                onChange={(newTimestamp) => {
                  setStartTimestamp(newTimestamp);
                }}
                addCss={css`
                  font-size: ${inputFontSize || fontSize};
                  color: ${color};
                  width: ${width};
                  ${mediaQuery[0]} {
                    width: ${`calc(${width} - 30px)`};
                    font-size: ${`calc(${fontSize} - 20px)`};
                  }
                  ${addCss}
                `}
              />
              {startTimestamp !== start && (
                <UpdateDurationButton>更新時間</UpdateDurationButton>
              )}
            </>
          ) : (
            <>
              <CustomDateRangePicker
                startTimestamp={startTimestamp}
                endTimestamp={endTimestamp}
                setEndTimestamp={setEndTimestamp}
                setStartTimestamp={setStartTimestamp}
                color={color}
              />
              {(startTimestamp !== start || endTimestamp !== end) && (
                <UpdateDurationButton>更新日期</UpdateDurationButton>
              )}
            </>
          )}
        </EditableDateContainer>
      ) : (
        <>
          {isTime ? (
            <P
              fontSize={fontSize}
              color={color}
              addCss={css`
                ${isAllowEdit && hoverEffect}
                ${mediaQuery[0]} {
                  font-size: ${`calc(${fontSize} - 12px)`};
                }
                ${addCss}
              `}
              onClick={(e) => {
                if (e.target.id !== 'submit' && isAllowEdit) {
                  setIsEdit(true);
                }
              }}>
              {timestampToString(startTimestamp, 'time')}
            </P>
          ) : (
            <P
              color={color}
              addCss={css`
                ${isAllowEdit && hoverEffect}
                ${addCss}
              `}
              onClick={(e) => {
                if (e.target.id !== 'submit' && isAllowEdit) {
                  setIsEdit(true);
                }
              }}>
              {timestampToString(startTimestamp, 'date')} -{' '}
              {timestampToString(endTimestamp, 'date')}
            </P>
          )}
        </>
      )}
    </>
  );
}

EditableDate.propTypes = {
  start: PropTypes.number,
  end: PropTypes.number,
  isDefaultShowText: PropTypes.bool,
  isAllowEdit: PropTypes.bool,
  isTime: PropTypes.bool,
  onSubmit: PropTypes.func,
  inputFontSize: PropTypes.string,
  fontSize: PropTypes.string,
  color: PropTypes.string,
  width: PropTypes.string,
  addCss: PropTypes.object,
};

export { EditableText, EditableDate };
