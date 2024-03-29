import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Close, Edit, NavigateBefore, InsertPhoto } from '@mui/icons-material';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { mediaQuery, palatte, styles } from '../styledComponents/basic/common';
import { H3 } from '../styledComponents/basic/Text';
import { firestore } from '../../utils/firebase';
import { Context } from '../../App';
import { Image } from '../styledComponents/Layout';
import { RoundButtonSmallWhite } from '../styledComponents/Buttons/RoundButton';
import { AddImageRoundBtn } from '../styledComponents/Form';
import { EditableText, EditableDate } from '../styledComponents/EditableText';

const BackgroundContainer = styled.div`
  position: relative;
  margin-bottom: 30px;
`;
const ContentContainer = styled.div`
  ${styles.containerSetting}
  max-width: ${(props) => (props.isAllowEdit ? '1280px' : null)};
  padding: 40px 20px 50px 20px;
`;
const ButtonWrapper = styled.div`
  ${styles.flex}
  justify-content: space-between;
  margin-bottom: 10px;
  ${mediaQuery[0]} {
    margin-bottom: 30px;
  }
`;
const EditButtonWrapper = styled.div`
  ${styles.flex}
  gap: 20px;
`;
const TextContainer = styled.div`
  ${styles.flexColumn};
  gap: 10px;
  align-items: center;
`;
function Overview({
  overviews,
  setOverviews,
  updateOverviewsFields,
  isJournal,
  isAllowEdit,
  setIsAllowEdit,
  isShowCloseBtn,
  updateDate,
  isHideDay,
  day,
}) {
  const navigate = useNavigate();
  const { uid } = useContext(Context);
  const uploadCoverPhoto = (imageBuffer, setIsShowModal, setIsPending) => {
    const upload = {
      uid,
      itineraryId: overviews.itinerary_id,
      imageBuffer,
    };
    firestore.uploadItinerariesCoverPhoto(upload).then((cover_photo) => {
      setIsPending(false);
      setIsShowModal(false);
      setOverviews({ ...overviews, cover_photo });
    });
  };
  return (
    <>
      <BackgroundContainer>
        <ContentContainer>
          <ButtonWrapper>
            <RoundButtonSmallWhite
              type="button"
              onClick={() =>
                navigate(isJournal ? '/travel-journals' : '/itineraries')
              }>
              <NavigateBefore fontSize="inherit" />
            </RoundButtonSmallWhite>
            {!isAllowEdit ? (
              <RoundButtonSmallWhite
                type="button"
                onClick={() => setIsAllowEdit(true)}>
                <Edit fontSize="inherit" />
              </RoundButtonSmallWhite>
            ) : (
              <EditButtonWrapper>
                <AddImageRoundBtn
                  upload={uploadCoverPhoto}
                  white
                  icon={InsertPhoto}
                  confirmMessage="確定要將封面更換成這張圖嗎？"
                />
                {isShowCloseBtn && (
                  <RoundButtonSmallWhite
                    type="button"
                    css={css`
                      &:hover {
                        background-color: ${palatte.danger.basic};
                        color: ${palatte.white};
                      }
                    `}
                    onClick={() => setIsAllowEdit(false)}>
                    <Close fontSize="inherit" />
                  </RoundButtonSmallWhite>
                )}
              </EditButtonWrapper>
            )}
          </ButtonWrapper>
          <TextContainer>
            <EditableText
              level="2"
              addCss={css`
                padding: 0 2px;
                color: ${palatte.white};
              `}
              addInputCss={css`
                color: ${palatte.gray[800]};
              `}
              isDefaultShowText={isJournal}
              isAllowEdit={isAllowEdit}
              onSubmit={(title) => {
                if (title !== overviews.title) {
                  updateOverviewsFields({ title });
                }
              }}>
              {overviews.title}
            </EditableText>
            <EditableDate
              isDefaultShowText={isJournal}
              start={overviews.start_date}
              end={overviews.end_date}
              onSubmit={updateDate}
              isAllowEdit={isAllowEdit}
              color={palatte.white}
              addCss={{
                text: css`
                  font-weight: 700;
                  text-align: center;
                `,
              }}
            />
            {!isHideDay && (
              <H3
                css={css`
                  color: ${palatte.white};
                `}>
                Day {day + 1}
              </H3>
            )}
          </TextContainer>
        </ContentContainer>
        <Image
          src={overviews.cover_photo}
          alt="cover"
          blur
          addCss={css`
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            z-index: -1;
          `}
        />
      </BackgroundContainer>
    </>
  );
}
Overview.propTypes = {
  isJournal: PropTypes.bool,
  isShowCloseBtn: PropTypes.bool,
  isHideDay: PropTypes.bool,
  isAllowEdit: PropTypes.bool,
  overviews: PropTypes.object,
  day: PropTypes.number,
  setIsAllowEdit: PropTypes.func,
  updateDate: PropTypes.func,
  updateOverviewsFields: PropTypes.func,
};

export default Overview;
