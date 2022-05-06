import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import {
  headingComponents,
  palatte,
  headingFontSize,
  mediaQuery,
} from './basicStyle';
import { TextInput } from './Form';

const EditableHeading = (props) => {
  const [isEdit, setIsEdit] = useState();
  const [value, setValue] = useState();
  const inputRef = useRef();
  const Heading = headingComponents[props.level];
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
  const hoverEffect = css`
    width: fit-content;
    padding-right: 12px;
    &:hover {
      background-color: ${palatte.shadow};
      border-radius: 5px;
      outline: 5px solid ${palatte.shadow};
    }
  `;
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
    ${props.addCss}
  `;
  return (
    <>
      {isEdit ? (
        <form
          onSubmit={submit}
          css={css`
            display: flex;
            gap: 10px;
            align-items: center;
          `}>
          <TextInput
            ref={inputRef}
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
      ) : (
        <Heading
          as={props.as}
          fontSize={props.fontSize}
          addCss={css`
            ${hoverEffect}
            ${props.addCss}
          `}
          color={props.color}
          onClick={() => {
            if (!props.isBrowse) setIsEdit(true);
          }}>
          {value}
        </Heading>
      )}
    </>
  );
};
EditableHeading.propTypes = {
  children: PropTypes.string.isRequired,
  level: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onSubmit: PropTypes.func.isRequired,
  as: PropTypes.string,
  fontSize: PropTypes.string,
  color: PropTypes.string,
  isBrowse: PropTypes.bool,
  addCss: PropTypes.string,
};

export { EditableHeading };
