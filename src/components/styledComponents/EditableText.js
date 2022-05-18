import { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import {
  textComponents,
  palatte,
  headingFontSize,
  mediaQuery,
  P,
} from './basicStyle';
import {
  TextInput,
  inputBaseSmall,
  CustomDateRangePicker,
  CustomTimePicker,
} from './Form';
import { ButtonSmall } from './Button';
import { timestampToString } from '../../utils/utilities';
import { Container, FlexDiv } from './Layout';

const hoverEffect = css`
  width: fit-content;
  &:hover {
    background-color: ${palatte.shadow};
    border-radius: 5px;
    outline: 5px solid ${palatte.shadow};
  }
`;

function EditableText(props) {
  const [isEdit, setIsEdit] = useState(true);
  const [value, setValue] = useState('');
  const inputRef = useRef();
  const Text = textComponents[props.level];
  useEffect(() => {
    setValue(props.children);
  }, [props.children]);
  const submit = (e) => {
    e?.preventDefault();
    setIsEdit(false);
    if (value && !value.match(/^ +$/)) {
      if (value !== props.children && value.length > 0) {
        console.log('submit');
        props.onSubmit(value);
      }
    } else {
      setValue(props.children);
    }
  };

  useEffect(() => {
    if (props.defaultShowText) {
      setIsEdit(false);
    } else {
      setIsEdit(true);
    }
    if (!props.isAllowEdit) {
      setIsEdit(false);
      submit();
    }
  }, [props.isAllowEdit]);

  useEffect(() => {
    if (inputRef.current && isEdit) {
      inputRef.current.select();
    }
  }, [inputRef, isEdit]);

  const inputStyle = css`
    border: none;
    outline: 1px solid ${palatte.gray['400']};
    outline-offset: 2px;
    font-weight: 700;
    padding: 0;
    text-align: center;
    font-size: ${props.fontSize || headingFontSize.desktop[props.level]};
    &:focus {
      outline: 2px solid ${palatte.primary.basic};
    }
    ${mediaQuery[0]} {
      font-size: ${headingFontSize.mobile[props.level]};
    }
    ${props.addInputCss || props.addCss}
  `;

  const countTextLength = (text) => {
    const encodedText = encodeURIComponent(text);
    return encodedText.replace(/%[A-F\d]{2}/g, 'U').length;
  };
  return (
    <>
      {isEdit && props.isAllowEdit ? (
        <form
          onSubmit={submit}
          css={css`
            display: flex;
            gap: 10px;
            align-items: center;
          `}>
          <TextInput
            ref={inputRef}
            type={props.type}
            size={countTextLength(value) > 0 ? countTextLength(value) : 1}
            value={value}
            width="auto"
            css={inputStyle}
            onChange={(e) => {
              setValue(e.target.value);
            }}
          />
        </form>
      ) : (
        <Text
          as={props.as}
          addCss={css`
            padding: 0 12px 0 0;
            ${props.isAllowEdit && hoverEffect}
            ${props.addCss}
          `}
          onClick={() => {
            if (props.isAllowEdit) setIsEdit(true);
          }}>
          {value}
        </Text>
      )}
    </>
  );
}
EditableText.propTypes = {
  children: PropTypes.string.isRequired,
  level: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onSubmit: PropTypes.func.isRequired,
  as: PropTypes.string,
  fontSize: PropTypes.string,
  color: PropTypes.string,
  isAllowEdit: PropTypes.bool,
  addCss: PropTypes.string,
};

function EditableDate(props) {
  const [isEdit, setIsEdit] = useState();
  const [startTimestamp, setStartTimestamp] = useState();
  const [endTimestamp, setEndTimestamp] = useState();
  useEffect(() => {
    setStartTimestamp(props.start);
    setEndTimestamp(props.end);
  }, [props.start, props.end]);
  useEffect(() => {
    if (props.defaultShowText) {
      setIsEdit(false);
    } else {
      setIsEdit(props.isAllowEdit);
    }
  }, [props.isAllowEdit]);

  const submit = useCallback(
    (e) => {
      e?.preventDefault();
      if (props.time) {
        props.onSubmit(startTimestamp);
        setIsEdit(false);
      } else if (props.start !== startTimestamp || props.end !== endTimestamp) {
        props.onSubmit(
          startTimestamp,
          endTimestamp,
          setEndTimestamp,
          setStartTimestamp,
          setIsEdit
        );
      }
    },
    [startTimestamp, endTimestamp, props, setEndTimestamp, setStartTimestamp]
  );

  return (
    <>
      {isEdit ? (
        <FlexDiv as="form" gap="5px" alignItems="center" onSubmit={submit}>
          {props.time ? (
            <>
              <CustomTimePicker
                value={startTimestamp}
                onChange={(newTimestamp) => {
                  setStartTimestamp(newTimestamp);
                }}
                addCss={css`
                  font-size: ${props.inputFontSize || props.fontSize};
                  color: ${props.color};
                  width: ${props.width};
                  ${mediaQuery[0]} {
                    width: ${`calc(${props.width} - 30px)`};
                    font-size: ${`calc(${props.fontSize} - 20px)`};
                  }
                  ${props.addCss}
                `}
              />
              {startTimestamp !== props.start && (
                <ButtonSmall
                  styled="gray"
                  width="fit-content"
                  padding="10px 15px"
                  margin="auto auto auto 10px">
                  更新時間
                </ButtonSmall>
              )}
            </>
          ) : (
            <>
              <CustomDateRangePicker
                startTimestamp={startTimestamp}
                endTimestamp={endTimestamp}
                setEndTimestamp={setEndTimestamp}
                setStartTimestamp={setStartTimestamp}
                color={props.color}
              />
              {(startTimestamp !== props.start ||
                endTimestamp !== props.end) && (
                <ButtonSmall
                  styled="gray"
                  width="fit-content"
                  padding="10px 15px"
                  margin="auto auto auto 10px">
                  更新日期
                </ButtonSmall>
              )}
            </>
          )}
        </FlexDiv>
      ) : (
        <>
          {props.time ? (
            <P
              fontSize={props.fontSize}
              color={props.color}
              addCss={css`
                ${props.isAllowEdit && hoverEffect}
                ${mediaQuery[0]} {
                  font-size: ${`calc(${props.fontSize} - 12px)`};
                }
                ${props.addCss}
              `}
              onClick={(e) => {
                if (e.target.id !== 'submit' && props.isAllowEdit) {
                  setIsEdit(true);
                }
              }}>
              {timestampToString(startTimestamp, 'time')}
            </P>
          ) : (
            <P
              color={props.color}
              addCss={css`
                ${props.isAllowEdit && hoverEffect}
                ${props.addCss}
              `}
              textAlign={props.textAlign}
              onClick={(e) => {
                if (e.target.id !== 'submit' && props.isAllowEdit) {
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

export { EditableText, EditableDate };
