import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { palatte, styles, mediaQuery } from '../styledComponents/basic/common';
import PropTypes from 'prop-types';
import { P, H3 } from '../styledComponents/basic/Text';
import { Image } from '../styledComponents/Layout';
import { RatingText } from '../styledComponents/Cards';
const Container = styled.div`
  ${styles.flexColumn}
  padding: 0 30px 30px 30px;
  gap: 20px;
  ${mediaQuery[0]} {
    padding: 0;
  }
`;
const MainTitle = styled(H3)`
  font-size: 18px;
  ${mediaQuery[0]} {
    font-size: 18px;
  }
`;
const ReviewsWrapper = styled.ul`
  ${styles.flexColumn}
  gap: 20px;
`;
const ReviewContainer = styled.li`
  ${styles.flexColumn}
  padding:20px;
  gap: 10px;
  background-color: ${palatte.white};
  border-radius: 10px;
  border: 1px solid ${palatte.gray[400]};
`;
const ProfileWrapper = styled.div`
  ${styles.flex}
  gap:12px;
  align-items: center;
`;
const ProfileImage = ({ src, alt }) => (
  <Image
    size="40px"
    round
    shadow
    addCss={css`
      border: 1px solid ${palatte.gray['100']};
    `}
    src={src}
    alt={alt}
  />
);
const RatingWrapper = styled.div`
  ${styles.flex}
  align-items:center;
  gap: 6px;
`;
const RatingTimeText = styled(P)`
  font-size: 14px;
  color: ${palatte.gray[700]};
`;
function PlaceReview({ reviews }) {
  return (
    <Container>
      <MainTitle>評論</MainTitle>
      <ReviewsWrapper>
        {reviews ? (
          reviews.map((review) => (
            <ReviewContainer key={review.time}>
              <ProfileWrapper>
                <ProfileImage
                  src={review.profile_photo_url}
                  alt={review.author_name}
                />
                <a
                  css={css`
                    text-decoration: none;
                  `}
                  href={review.author_url}>
                  {review.author_name}
                </a>
              </ProfileWrapper>
              <RatingWrapper>
                <RatingText rating={review.rating} size="18" isNoText />
                <RatingTimeText>
                  {review.relative_time_description}
                </RatingTimeText>
              </RatingWrapper>
              <P>{review.text}</P>
            </ReviewContainer>
          ))
        ) : (
          <P>找不到評論</P>
        )}
      </ReviewsWrapper>
    </Container>
  );
}

PlaceReview.propTypes = {
  reviews: PropTypes.array,
};

export default PlaceReview;
