import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { styles, palatte, mediaQuery, Rating } from '../basic/common';
import { timestampToString } from '../../../utils/utilities';
import { Image } from '../Layout';
import { RoundButtonSmall } from '../Buttons/RoundButton';
import { CheckboxCustom } from '../Form';
import TextWithIcon from '../basic/TextWithIcon';
import { H6, P } from '../basic/Text';
import Card from './Card';

const TimeTag = styled.div`
  font-weight: 700;
  color: ${palatte.white};
  font-size: 18px;
  background-color: ${palatte.info.basic};
  border-radius: 20px;
  padding: 5px 20px;
  z-index: 5;
`;
const AddressText = (props) => (
  <TextWithIcon
    iconName="location_on"
    addCss={{
      container: css`
        gap: ${props.withRating ? '4px' : '2px'};
        align-items: flex-start;
      `,
      text: css`
        font-size: ${!props.isSmall ? '17px' : '16px'};
      `,
      icon: css`
        color: ${palatte.danger.basic};
        font-size: ${props.isSmall ? '18px' : '22px'};
        margin: ${props.isSmall ? '3px 3px 3px 0' : '2px 0'};
        ${mediaQuery[0]} {
          font-size: 18px;
          margin: 3px 3px 3px 0;
        }
      `,
    }}>
    {props.children}
  </TextWithIcon>
);
const DurationText = (props) => (
  <TextWithIcon
    iconName="schedule"
    addCss={{
      container: css`
        gap: 4px;
        font-size: 14px;
        color: ${palatte.gray['700']};
      `,
      icon: css`
        font-size: 22px;
        color: ${palatte.gray['500']};
        margin: 1px 0;
      `,
    }}>
    停留 {Math.floor(props.duration / 6) / 10} 小時
  </TextWithIcon>
);
const RatingText = (props) => (
  <div
    css={css`
      ${styles.flex}
      gap:6px;
      align-items: center;
    `}>
    {!props.isNoText && (
      <P
        addCss={css`
          margin-bottom: 2px;
          line-height: 1;
        `}>
        {props.rating}
      </P>
    )}
    <Rating
      size={props.isSmall ? '18' : props.size || '24'}
      rating={props.rating}
    />
  </div>
);
const CardWrapper = styled.div`
  display: flex;
  position: relative;
  gap: 20px;
  width: ${(props) => props.width || '100%'};
  ${mediaQuery[0]} {
    min-width: 90%;
    height: 100%;
  }
`;

const TagAndCheckboxContainer = styled.div`
  ${styles.flex}
  gap: 10px;
  align-items: center;
  position: absolute;
  top: ${(props) => (props.time ? '-15px' : props.isEdit ? '20px' : null)};
  left: ${(props) =>
    props.isSmall
      ? props.time
        ? '-10px'
        : props.isEdit
        ? '20px'
        : null
      : props.time
      ? '30px'
      : props.isEdit
      ? '20px'
      : null};
  z-index: 1;
  ${mediaQuery[0]} {
    left: ${(props) => (props.time ? '-10px' : props.isEdit ? '20px' : null)};
  }
`;
const CloseButton = styled(RoundButtonSmall)`
  position: absolute;
  top: ${(props) => (props.isSmall ? '-8px' : '10px')};
  right: ${(props) => (props.isSmall ? '-10px' : '10px')};
  z-index: 1;
  background-color: ${palatte.white};
`;
const SpotImage = ({ src, alt, isSmall }) => (
  <Image
    src={src}
    alt={alt}
    addCss={css`
      flex-basis: ${isSmall ? '200px' : '40%'};
      min-width: ${isSmall ? '100%' : '40%'};
      height: 100%;
      ${mediaQuery[0]} {
        width: 100%;
        min-width: ${isSmall ? '30%' : '100%'};
        max-height: ${isSmall ? '100%' : '200px'};
      }
    `}
  />
);
const TextContainer = styled.div`
  ${styles.flexColumn}
  flex-shrink: 1;
  justify-content: center;
  gap: 15px;
  padding: 5px 5px 5px 0;
  width: ${(props) => (props.isSmall ? '100%' : null)};
  padding: ${(props) => (props.isSmall ? '20px' : null)};
  gap: ${(props) => (props.isSmall ? '10px' : null)};
  ${mediaQuery[0]} {
    width: 100%;
    padding: 15px;
    gap: 5px;
  }
`;
const SpotTitle = styled(H6)`
  font-size: ${(props) => (props.isSmall ? '20px' : null)};
  margin-bottom: ${(props) => (props.isSmall ? '0' : '10px')};
  ${mediaQuery[0]} {
    font-size: ${(props) => (props.isSmall ? '16px' : '20px')};
  }
`;
const SpotCardContainer = styled(Card)`
  gap: ${(props) => (props.isSmall ? '0px' : '40px')};
  ${mediaQuery[0]} {
    gap: 0px;
    flex-direction: ${(props) => (props.isSmall ? 'row' : null)};
    align-items: stretch;
    height: 100%;
  }
`;

function SpotCard(props) {
  return (
    <CardWrapper as={props.as} width={props.width}>
      {props.isShowCloseBtn && (
        <CloseButton
          className="material-icons"
          close
          type="button"
          isSmall={props.isSmall}
          onClick={props.onDeleteClick}>
          cancel
        </CloseButton>
      )}
      <TagAndCheckboxContainer
        isSmall={props.isSmall}
        isEdit={props.isEdit}
        time={props.time}>
        {props.isEdit && (
          <CheckboxCustom
            id={props.id}
            selectedList={props.selectedList}
            setSelectedList={props.setSelectedList}
            addCss={css`
              box-shadow: ${!props.time && props.isEdit
                ? `0 0 0 1px ${palatte.gray['300']}`
                : null};
            `}
          />
        )}
        {props.time && (
          <TimeTag>{timestampToString(props.time, 'time')}</TimeTag>
        )}
      </TagAndCheckboxContainer>
      <SpotCardContainer isSmall={props.isSmall} onClick={props.onClick}>
        <SpotImage
          isSmall={props.isSmall}
          src={props.imgSrc}
          alt={props.imgAlt}
        />
        <TextContainer isSmall={props.isSmall}>
          <SpotTitle isSmall={props.isSmall}>{props.title}</SpotTitle>
          <AddressText withRating={props.rating} isSmall={props.isSmall}>
            {props.address}
          </AddressText>
          {props.duration && <DurationText duration={props.duration} />}
          {props.rating && (
            <RatingText rating={props.rating} isSmall={props.isSmall} />
          )}
        </TextContainer>
      </SpotCardContainer>
    </CardWrapper>
  );
}
SpotCard.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  imgAlt: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  as: PropTypes.string,
  onClick: PropTypes.func,
  time: PropTypes.number,
  duration: PropTypes.number,
  isEdit: PropTypes.bool,
  isSmall: PropTypes.bool,
  isShowCloseBtn: PropTypes.bool,
  rating: PropTypes.number,
  id: PropTypes.string,
  selectedList: PropTypes.array,
  setSelectedList: PropTypes.func,
  onDeleteClick: PropTypes.func,
};

export { SpotCard, AddressText, DurationText, RatingText };
