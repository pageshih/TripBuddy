import styled from '@emotion/styled';

const Button = styled.button`
  background-color: ${(props) => (props.primary ? 'skyblue' : 'transparent')};
  border: none;
`;

export { Button };
