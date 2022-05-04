import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { palatte } from './basicStyle';

const FadeBg = styled.div`
  background-color: rgba(0, 0, 0, 0.8);
  padding: 30px;
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const CenterContainer = styled.div`
  flex-basis: ${(props) => props.width || '350px'};
  height: ${(props) => props.height || '400px'};
  max-width: ${(props) => props.maxWidth || '350px'};
  max-height: ${(props) => props.maxHeight || '400px'};
  background-color: ${palatte.white};
  border-radius: 10px;
  position: relative;
  padding: 20px;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  padding: 0px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  font-size: 16px;
  color: white;
  background-color: darkgray;
  z-index: 1;
  &:hover {
    background-color: crimson;
  }
`;
function Modal(props) {
  return (
    <FadeBg
      id="close"
      onClick={(e) => {
        if (e.target.id === 'close') {
          props.close();
        }
      }}>
      <CenterContainer
        width={props.width}
        height={props.height}
        maxHeight={props.maxHeight}
        maxWidth={props.maxWidth}>
        <CloseBtn
          type="button"
          onClick={props.close}
          className="material-icons">
          close
        </CloseBtn>
        {props.children}
      </CenterContainer>
    </FadeBg>
  );
}

export { Modal };
