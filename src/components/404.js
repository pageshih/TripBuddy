import { useNavigate } from 'react-router-dom';
import { Button } from './styledComponents/Buttons/Button';
import { Logo } from './styledComponents/basic/Logo';
import { H5 } from './styledComponents/basic/Text';
import { Container, FlexDiv } from './styledComponents/Layout';
function NotFound() {
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
