import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';

const FadeBg = styled.div`
  background-color: rgba(0, 0, 0, 0.8);
  width: 100%;
  height: 100vh;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CenterContainer = styled.div`
  flex-basis: 350px;
  height: 400px;
  background-color: #fff;
  border-radius: 10px;
  position: relative;
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
      <CenterContainer>
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
