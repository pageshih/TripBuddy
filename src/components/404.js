import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { styles } from './styledComponents/basic/common';
import { Button } from './styledComponents/Buttons/Button';
import { Logo } from './styledComponents/basic/Logo';
import { H5 } from './styledComponents/basic/Text';
const Container = styled.div`
  ${styles.flexColumn};
  gap: 200px;
`;
const LogoWrapper = styled.div`
  padding: 30px;
  width: fit-content;
`;
const MessageWrapper = styled.div`
  ${styles.flexColumn};
  align-items: center;
  gap: 20px;
  height: 100vh;
  padding: 0 0 80px 0;
`;
function NotFound() {
  const navigate = useNavigate();
  return (
    <Container>
      <LogoWrapper>
        <Logo small />
      </LogoWrapper>
      <MessageWrapper>
        <H5>找不到相關的頁面</H5>
        <Button
          styled="primary"
          css={css`
            width: fit-content;
          `}
          onClick={() => navigate('/itineraries')}>
          回首頁
        </Button>
      </MessageWrapper>
    </Container>
  );
}

export default NotFound;
