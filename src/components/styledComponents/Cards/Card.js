import styled from '@emotion/styled';
import { styles, palatte, mediaQuery } from '../basic/common';

const Card = styled.div`
  border: 1px solid ${palatte.primary.basic};
  border-radius: 30px;
  display: flex;
  overflow: hidden;
  background-color: ${palatte.white};
  align-items: center;
  position: relative;
  width: 100%;
  height: ${(props) => !props.isSmall && '200px'};
  flex-direction: ${(props) =>
    props.isSmall || props.column ? 'column' : 'row'};
  border-radius: ${(props) => props.isSmall && '10px'};
  &:hover {
    cursor: pointer;
    box-shadow: ${styles.shadow};
  }
  ${mediaQuery[0]} {
    flex-direction: column;
    border-radius: 10px;
    height: fit-content;
  }
`;

export default Card;
