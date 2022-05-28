import { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { palatte, styles, mediaQuery } from '../styledComponents/basic/common';
import { P, H2 } from '../styledComponents/basic/Text';
import { Image } from '../styledComponents/Layout';
import { Button } from '../styledComponents/Buttons/Button';
import HyperLink from '../styledComponents/Buttons/HyperLink';
import { AccordionSmall } from '../styledComponents/Accordion';
import { RatingText, AddressText } from '../styledComponents/Cards/SpotCard';
import TextWithIcon from '../styledComponents/basic/TextWithIcon';

const OpeningHoursText = ({ openingText }) => {
  const splitOpeningTextAry = useRef();
  const [today, setToday] = useState();
  useEffect(() => {
    if (openingText) {
      splitOpeningTextAry.current = openingText.split(/: |,/);
      setToday(
        splitOpeningTextAry.current.reduce((final, text, index) => {
          if (index === 0) {
            final.push(
              <span
                key={text}
                css={css`
                  margin-right: 6px;
                `}>
                {text}
              </span>
            );
          } else {
            final.push(text);
          }
          return final;
        }, [])
      );
    }
  }, [openingText]);
  return (
    <P
      fontSize="14px"
      color={palatte.gray[700]}
      addCss={css`
        & span {
          color: inherit;
        }
      `}>
      {today}
    </P>
  );
};

OpeningHoursText.propTypes = {
  openingText: PropTypes.string,
};

const Container = styled.div`
  ${styles.flexColumn}
  gap: 10px;
`;
const SpotImage = ({ src, alt }) => (
  <Image
    src={src}
    alt={alt}
    addCss={css`
      max-height: 300px;
      ${mediaQuery[0]} {
        flex-basis: 50%;
        height: 160px;
      }
    `}
  />
);
const ContentWrapper = styled.div`
  ${styles.flexColumn};
  gap: 20px;
  ${mediaQuery[0]} {
    flex-direction: row;
    justify-content: space-between;
    flex-basis: 200px;
    gap: 10px;
  }
`;
const TextWrapper = styled.div`
  ${styles.flexColumn}
  gap: 12px;
  padding: 0 20px;
  ${mediaQuery[0]} {
    order: -1;
    padding: 0;
  }
`;
const ModifyWaitingSpotsButton = styled(Button)`
  width: calc(100% - 60px);
  margin: 0 30px;
  ${mediaQuery[0]} {
    width: 100%;
    margin: 0;
  }
`;
const ModifyWaitingSpotsIcon = styled.span`
  color: inherit;
  font-size: 28px;
`;
const OpeningHours = ({ children }) => (
  <TextWithIcon
    iconName="access_time"
    iconLabel="營業時間"
    addCss={{
      container: css`
        align-items: flex-start;
        gap: 6px;
        font-size: 14px;
      `,
      iconContainer: css`
        gap: 4px;
        color: ${palatte.gray[600]};
      `,
      icon: css`
        font-size: 18px;
      `,
      text: css`
        color: ${palatte.gray[700]};
        & span {
          color: inherit;
        }
      `,
      iconLabel: css`
        ${mediaQuery[0]} {
          display: none;
        }
      `,
    }}>
    {children}
  </TextWithIcon>
);
const PlaceName = styled(H2)`
  font-size: 22px;
  ${mediaQuery[0]} {
    font-size: 16px;
  }
`;
function PlaceOverview({
  imgUrl,
  openingHours,
  spotName,
  address,
  rating,
  website,
  buttonAction,
  isSavedSpot,
}) {
  let today = new Date().getDay();
  today = today ? today - 1 : 6;
  const restOpeningText = () => {
    const restDays = openingHours.filter((_, index) => index !== today);
    const newOrderRestDays =
      today < 6
        ? [
            ...[...restDays].splice(0, today - 1),
            ...[...restDays].splice(today),
          ]
        : restDays;
    return newOrderRestDays;
  };
  return (
    <Container>
      <ContentWrapper>
        {imgUrl ? (
          <SpotImage src={imgUrl} alt={spotName} />
        ) : (
          <div
            css={css`
              height: 20px;
              width: 100%;
            `}
          />
        )}
        <TextWrapper>
          <PlaceName>{spotName}</PlaceName>
          {openingHours && (
            <OpeningHours>
              <AccordionSmall
                isFilledArrow
                titleElement={
                  <OpeningHoursText
                    key={openingHours[today]}
                    openingText={openingHours[today]}
                  />
                }>
                {restOpeningText().map((text) => (
                  <OpeningHoursText key={text} openingText={text} />
                ))}
              </AccordionSmall>
            </OpeningHours>
          )}
          <AddressText withRating isSmall>
            {address}
          </AddressText>

          {rating && <RatingText rating={rating} isSmall />}
          {website && (
            <HyperLink
              href={website}
              addCss={css`
                align-self: flex-start;
              `}
              iconName="open_in_new">
              官方網站
            </HyperLink>
          )}
        </TextWrapper>
      </ContentWrapper>
      <ModifyWaitingSpotsButton
        styled={isSavedSpot ? 'danger' : 'primary'}
        type="button"
        onClick={buttonAction}>
        <ModifyWaitingSpotsIcon className="material-icons">
          {isSavedSpot ? 'wrong_location' : 'add_location_alt'}
        </ModifyWaitingSpotsIcon>
        {isSavedSpot ? '從候補景點中移除' : '加入候補景點'}
      </ModifyWaitingSpotsButton>
    </Container>
  );
}

PlaceOverview.propTypes = {
  imgUrl: PropTypes.string,
  openingHours: PropTypes.array,
  spotName: PropTypes.string,
  address: PropTypes.string,
  rating: PropTypes.number,
  website: PropTypes.string,
  buttonAction: PropTypes.func,
  isSavedSpot: PropTypes.bool,
};

export default PlaceOverview;
