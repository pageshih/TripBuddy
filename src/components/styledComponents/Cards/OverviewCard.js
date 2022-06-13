import { Schedule } from '@mui/icons-material';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { styles, palatte, mediaQuery } from '../basic/common';
import { timestampToString } from '../../../utils/utilities';
import { Image } from '../Layout';
import { H5, P } from '../basic/Text';
import Card from './Card';

const Container = styled(Card)`
  flex-basis: ${(props) => (props.row ? '300px' : 'calc(50% - 60px)')};
  height: 300px;
  min-height: 300px;
  flex-direction: column;
  border-width: 2px;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  & > .darken {
    background-color: ${palatte.shadow};
  }
  &:hover {
    & > .darken {
      background-color: ${palatte.darkerShadow};
    }
  }
  ${mediaQuery[0]} {
    flex-basis: 100%;
    margin: auto;
  }
`;
const TextWrapper = styled.div`
  ${styles.flex}
  gap:3px;
  align-items: center;
  z-index: 1;
  & > * {
    z-index: 1;
    color: ${palatte.white};
  }
`;
const ContentWrapper = styled.div`
  ${styles.flexColumn};
  gap: 20px;
  align-items: center;
`;
const Title = styled(H5)`
  font-size: 36px;
  color: ${palatte.white};
  z-index: 1;
`;
const BackgroundImage = ({ src, alt }) => (
  <Image
    src={src}
    alt={alt}
    addCss={css`
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
    `}
  />
);

const Darken = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
`;
function OverviewCard(props) {
  return (
    <Container as={props.as} css={props.addCss} onClick={props.onClick}>
      <ContentWrapper>
        <Title>{props.title}</Title>
        <TextWrapper>
          <Schedule sx={{ fontSize: 20 }} />
          <P>
            {timestampToString(props.startDate, 'date')} -{' '}
            {timestampToString(props.endDate, 'date')}
          </P>
        </TextWrapper>
      </ContentWrapper>
      <BackgroundImage src={props.src} alt={props.alt} />
      <Darken className="darken" />
    </Container>
  );
}
OverviewCard.propTypes = {
  as: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
  startDate: PropTypes.number,
  endDate: PropTypes.number,
  src: PropTypes.string,
  alt: PropTypes.string,
};

export default OverviewCard;
