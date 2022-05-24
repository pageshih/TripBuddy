import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { palatte, styles } from '../styledComponents/basic/common';
import { H3 } from '../styledComponents/basic/Text';
import { firestore } from '../../utils/firebase';
import { Context } from '../../App';
import { Container, FlexDiv, Image } from '../styledComponents/Layout';
import { RoundButtonSmallWhite } from '../styledComponents/Button';
import { AddImageRoundBtn } from '../styledComponents/Form';
import { EditableText, EditableDate } from '../styledComponents/EditableText';
import PropTypes from 'prop-types';

const BackgroundContainer = styled.div`
  position: relative;
  margin-bottom: 30px;
`;
const ContentContainer = styled.div`
  ${styles.containerSetting}
  max-width: ${(props) => props.isAllowEdit && '1280px'};
  padding: 40px 20px 50px 20px;
`;
const ButtonWrapper = styled.div`
  ${styles.flex}
  justify-content: space-between;
  margin-bottom: 10px;
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
function Overview(props) {
  const navigate = useNavigate();
  const { uid } = useContext(Context);
  const uploadCoverPhoto = (imageBuffer, setIsShowModal) => {
    const upload = {
      uid,
      itineraryId: props.overviews.itinerary_id,
      imageBuffer,
    };
    firestore.uploadItinerariesCoverPhoto(upload).then((cover_photo) => {
      setIsShowModal(false);
      props.updateOverviewsFields({ cover_photo });
    });
  };
  return (
    <>
      <BackgroundContainer>
        <ContentContainer>
          <ButtonWrapper>
            <RoundButtonSmallWhite
              className="material-icons"
              type="button"
              onClick={() =>
                navigate(props.isJournal ? '/travel-journals' : '/itineraries')
              }>
              navigate_before
            </RoundButtonSmallWhite>
            {!props.isAllowEdit ? (
              <RoundButtonSmallWhite
                className="material-icons"
                type="button"
                onClick={() => props.setIsAllowEdit(true)}>
                edit
              </RoundButtonSmallWhite>
            ) : (
              <EditButtonWrapper>
                <AddImageRoundBtn
                  upload={uploadCoverPhoto}
                  white
                  icon="insert_photo"
                  confirmMessage="確定要將封面更換成這張圖嗎？"
                />
                {props.isShowCloseBtn && (
                  <RoundButtonSmallWhite
                    className="material-icons"
                    type="button"
                    addCss={css`
                      &:hover {
                        background-color: ${palatte.danger.basic};
                        color: ${palatte.white};
                      }
                    `}
                    onClick={() => props.setIsAllowEdit(false)}>
                    close
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
              defaultShowText={props.isJournal}
              isAllowEdit={props.isAllowEdit}
              onSubmit={(title) => {
                if (title !== props.overviews.title) {
                  props.updateOverviewsFields({ title });
                }
              }}>
              {props.overviews.title}
            </EditableText>
            <EditableDate
              defaultShowText={props.isJournal}
              start={props.overviews.start_date}
              end={props.overviews.end_date}
              onSubmit={props.updateDate}
              isAllowEdit={props.isAllowEdit}
              addCss={css`
                color: ${palatte.white};
                font-weight: 700;
                text-align: center;
              `}
            />
            {!props.hideDay && (
              <H3 color={palatte.white}>Day {props.day + 1}</H3>
            )}
          </TextContainer>
        </ContentContainer>
        <Image
          src={props.overviews.cover_photo}
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
  overviews: PropTypes.object,
  day: PropTypes.number,
  isAllowEdit: PropTypes.bool,
  setIsAllowEdit: PropTypes.func,
  updateDate: PropTypes.func,
  updateOverviewsFields: PropTypes.func,
};

export default Overview;
