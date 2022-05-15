import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { palatte, H3, P } from './styledComponents/basicStyle';
import {
  timestampToString,
  setTimeToTimestamp,
  updateItineraryCoverPhoto,
} from '../utils/utilities';
import { Context } from '../App';
import { Container, FlexDiv, Image } from './styledComponents/Layout';
import { RoundButtonSmallWhite, ButtonSmall } from './styledComponents/Button';
import {
  SelectAllCheckBox,
  AddImageRoundBtn,
  SelectSmall,
} from './styledComponents/Form';
import { EditableText, EditableDate } from './styledComponents/EditableText';
import { TooltipNotification } from './styledComponents/Notification';
import PropTypes from 'prop-types';

function Overview(props) {
  const navigate = useNavigate();
  const { uid } = useContext(Context);
  const uploadCoverPhoto = (imageBuffer, setIsShowModal) => {
    const upload = new updateItineraryCoverPhoto({
      uid,
      itineraryId: props.overviews.itinerary_id,
      imageBuffer,
    });
    upload.uploadFirestore().then((cover_photo) => {
      setIsShowModal(false);
      props.updateOverviewsFields({ cover_photo });
    });
  };
  return (
    <>
      <Container position="relative" margin="0 0 30px 0">
        <Container addCss={props.containerCss} padding="40px 20px 50px 20px">
          <FlexDiv justifyContent="space-between">
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
              <FlexDiv gap="20px">
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
              </FlexDiv>
            )}
          </FlexDiv>
          <FlexDiv direction="column" gap="10px" alignItems="center">
            <EditableText
              level="2"
              padding="0 2px"
              color={palatte.white}
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
              color={palatte.white}
              start={props.overviews.start_date}
              end={props.overviews.end_date}
              onSubmit={props.updateDate}
              isAllowEdit={props.isAllowEdit}
              addCss={css`
                font-weight: 700;
              `}
              textAlign="center"
            />
            {props.hideDay ? null : (
              <H3 color={palatte.white}>Day {props.day + 1}</H3>
            )}
          </FlexDiv>
        </Container>
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
      </Container>
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

function DepartController(props) {
  const [time, setTime] = useState(props.departTimes[props.day]);
  useEffect(() => {
    setTime(props.departTimes[props.day]);
  }, [props.departTimes, props.day]);
  return (
    <FlexDiv direction="column" gap="5px">
      <FlexDiv
        justifyContent="space-between"
        maxWidth={props.isAllowEdit && '200px'}
        addCss={css`
          & > * {
            color: ${palatte.gray['700']};
          }
        `}>
        <P>出發時間</P>
        <P>{timestampToString(props.departTimes[props.day], 'simpleDate')}</P>
      </FlexDiv>
      <EditableDate
        time
        start={time}
        onSubmit={props.onSubmit}
        isAllowEdit={props.isAllowEdit}
        width="210px"
        fontSize="46px"
        inputFontSize="32px"
        color={palatte.info.basic}
        addCss={css`
          font-weight: 700;
        `}
      />
    </FlexDiv>
  );
}

function MoveScheduleController(props) {
  return (
    <FlexDiv alignItems="center" justifyContent="flex-end" gap="20px">
      <SelectAllCheckBox
        setAllChecked={() =>
          props.setSelectedSchedulesId(
            props.schedules.map((schedule) => schedule.schedule_id)
          )
        }
        setAllUnchecked={() => props.setSelectedSchedulesId([])}
        isSelectAll={props.isSelectAll}
        setIsSelectAll={props.setIsSelectAll}
      />
      <SelectSmall
        value={props.changeTime}
        onChange={(e) => props.setChangeTime(Number(e.target.value))}>
        <option value="" disabled>
          修改所選行程的日期
        </option>
        {props.departTimes
          ?.filter((time) => time !== props.departTimes[props.day])
          .map((timestamp) => (
            <option value={timestamp} key={timestamp}>
              {timestampToString(timestamp, 'date')}
            </option>
          ))}
      </SelectSmall>
      <TooltipNotification
        isOpen={
          props.notification.fire &&
          props.notification.id.match('tooltip')?.length > 0
        }
        settingReducer={props.notification}
        resetSettingReducer={props.dispatchNotification}>
        <ButtonSmall
          styled="primary"
          padding="5px 15px"
          type="button"
          onClick={props.changeSchedulesTime}>
          移動行程
        </ButtonSmall>
      </TooltipNotification>
    </FlexDiv>
  );
}

export { Overview, DepartController, MoveScheduleController };
