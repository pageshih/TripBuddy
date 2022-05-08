import { useEffect, useState, useRef } from 'react';
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
import { TextInput, inputBaseSmall } from './Form';
import { ButtonSmall } from './Button';
import { timestampToString, timestampToDateInput } from '../../utils/utilities';
import { FlexDiv } from './Layout';

const hoverEffect = css`
  width: fit-content;
  &:hover {
    background-color: ${palatte.shadow};
    border-radius: 5px;
    outline: 5px solid ${palatte.shadow};
  }
`;

function EditableText(props) {
  const [isEdit, setIsEdit] = useState();
  const [value, setValue] = useState();
  const inputRef = useRef();
  const Text = textComponents[props.level];
  useEffect(() => {
    setValue(props.children);
  }, [props.children]);
  useEffect(() => {
    if (inputRef.current && isEdit) {
      inputRef.current.select();
    }
  }, [inputRef, isEdit]);
  const submit = (e) => {
    e.preventDefault();
    setIsEdit(false);
    if (value && !value.match(/^ +$/)) {
      if (value !== props.children && value.length > 0) {
        props.onSubmit(value);
      }
    } else {
      setValue(props.children);
    }
  };

  const inputStyle = css`
    border: none;
    outline: 1px solid ${palatte.gray['400']};
    outline-offset: 2px;
    font-weight: 700;
    padding: 0;
    font-size: ${props.fontSize || headingFontSize.desktop[props.level]};
    &:focus {
      outline: 2px solid ${palatte.primary.basic};
    }
    ${mediaQuery[0]} {
      font-size: ${headingFontSize.mobile[props.level]};
    }
    ${props.addInputCss || props.addCss}
  `;
  return (
    <>
      {isEdit ? (
        props.inputElement(setIsEdit) || (
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
              size={value.length > 0 ? value.length : 1}
              value={value}
              width="auto"
              css={inputStyle}
              autoFocus
              onBlur={submit}
              onChange={(e) => {
                setValue(e.target.value);
              }}
            />
          </form>
        )
      ) : (
        <Text
          as={props.as}
          fontSize={props.fontSize}
          addCss={css`
            ${hoverEffect}
            padding: ${props.padding || '0 12px 0 0 '};
            ${props.addCss}
          `}
          color={props.color}
          onClick={() => {
            if (!props.isBrowse) setIsEdit(true);
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
  isBrowse: PropTypes.bool,
  addCss: PropTypes.string,
};

function EditableDate(props) {
  const [isEdit, setIsEdit] = useState();
  const [startTimestamp, setStartTimestamp] = useState();
  const [endTimestamp, setEndTimestamp] = useState();
  useEffect(() => {
    setStartTimestamp(props.start);
    setEndTimestamp(props.end);
  }, []);
  const submit = (e) => {
    e.preventDefault();
    setIsEdit(false);
    props.onSubmit(
      startTimestamp,
      endTimestamp,
      setEndTimestamp,
      setStartTimestamp
    );
  };
  return (
    <>
      {isEdit ? (
        <FlexDiv as="form" onSubmit={submit} gap="5px" alignItems="center">
          <input
            type="date"
            css={inputBaseSmall}
            value={timestampToDateInput(startTimestamp)}
            autoFocus
            onChange={(e) =>
              setStartTimestamp(new Date(e.target.value).getTime())
            }
          />
          <span
            css={css`
              color: ${props.color};
            `}>
            {' '}
            -{' '}
          </span>
          <input
            type="date"
            css={inputBaseSmall}
            value={timestampToDateInput(endTimestamp)}
            onChange={(e) =>
              setEndTimestamp(new Date(e.target.value).getTime())
            }
          />
          <ButtonSmall
            styled="gray"
            padding="5px 10px"
            margin="0 0 0 5px"
            width="fit-content"
            id="submit"
            type="submit">
            儲存
          </ButtonSmall>
        </FlexDiv>
      ) : (
        <P
          color={props.color}
          addCss={css`
            ${hoverEffect}
            ${props.addCss}
          `}
          textAlign={props.textAlign}
          onClick={(e) => {
            if (e.target.id !== 'submit' && !props.isBrowse) {
              setIsEdit(true);
            }
          }}>
          {timestampToString(startTimestamp, 'date')} -{' '}
          {timestampToString(endTimestamp, 'date')}
        </P>
      )}
    </>
  );
}

export { EditableText, EditableDate };
