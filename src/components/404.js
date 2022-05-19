import { useNavigate } from 'react-router-dom';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { Button } from './styledComponents/Button';
import { H5, Logo } from './styledComponents/basicStyle';
import { Container, FlexDiv } from './styledComponents/Layout';
function NotFound(errorCode) {
  const navigate = useNavigate();
  return (
    <FlexDiv direction="column" gap="200px">
      <Container padding="30px" width="fit-content">
        <Logo small />
      </Container>
      <FlexDiv
        alignItems="center"
        direction="column"
        gap="20px"
        height="100vh"
        padding="0 0 80px 0">
        <H5>找不到相關的頁面</H5>
        <Button
          styled="primary"
          width="fit-content"
          onClick={() => navigate('/itineraries')}>
          回首頁
        </Button>
      </FlexDiv>
    </FlexDiv>
  );
}

export default NotFound;
