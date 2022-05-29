import { useContext, useReducer, useState } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { firestore } from '../../utils/firebase';
import { Context } from '../../App';
import { Modal } from '../styledComponents/Modal';
import { Loader, styles } from '../styledComponents/basic/common';
import { Select, TextInput, CustomTimePicker } from '../styledComponents/Form';
import { Button, ButtonSmall } from '../styledComponents/Buttons/Button';
import GoogleMapSearchBar from '../styledComponents/GoogleMapSearchBar';
import { SpotCard } from '../styledComponents/Cards/SpotCard';
import { timestampToString } from '../../utils/utilities';
import { P } from '../styledComponents/basic/Text';

const initialSchedule = {
  start_time: '',
  end_time: 0,
  duration: 30,
  placeDetail: undefined,
  place_id: '',
  travel_mode: 'DRIVING',
  transit_detail: '',
};
const addScheduleReducer = (state, action) => {
  switch (action.type) {
    case 'changePlace':
      return {
        ...state,
        placeDetail: action.playload,
        place_id: action.playload.place_id,
      };
    case 'choseDate':
      return {
        ...state,
        start_time: action.playload,
      };
    case 'choseTime':
      const defaultStartTime = new Date(state.start_time);
      const startTime = new Date(action.playload).setFullYear(
        defaultStartTime.getFullYear(),
        defaultStartTime.getMonth(),
        defaultStartTime.getDate()
      );
      return {
        ...state,
        start_time: startTime,
        end_time: startTime + state.duration * 60 * 1000,
      };
    case 'addDuration':
      return {
        ...state,
        duration: action.playload,
        end_time: state.start_time + action.playload * 60 * 1000,
      };
    case 'reset':
      return initialSchedule;
    default:
      return state;
  }
};

const ModalContentWrapper = styled.div`
  ${styles.flexColumn}
  height: 100%;
`;

const FormWrapper = styled.div`
  ${styles.flexColumn}
  gap:20px;
  padding: 20px;
  grow: 1;
`;

const DurationInputWrapper = styled.div`
  ${styles.flex}
  gap:10px;
  align-items: center;
`;
const DurationInput = styled(TextInput)`
  width: fit-content;
`;
const AddScheduleContorllerWrapper = styled.div`
  ${styles.flex}
  align-items:center;
  gap: 10px;
  justify-content: flex-end;
`;
function AddScheduleController({
  departTimes,
  itineraryId,
  allSchedules,
  setScheduleList,
  day,
}) {
  const { uid, map, dispatchNotification } = useContext(Context);
  const [showAddSchedule, setShowAddSchedule] = useState();
  const [isAddingSchedule, setIsAddingSchedule] = useState();
  const [addSchedule, dispatchAddSchedule] = useReducer(
    addScheduleReducer,
    initialSchedule
  );
  const uploadNewSchedule = () => {
    if (addSchedule.start_time && addSchedule.placeDetail) {
      setIsAddingSchedule(true);
      firestore
        .addSchedule(uid, itineraryId, addSchedule)
        .then((newSchedule) => {
          setShowAddSchedule(false);
          dispatchNotification({
            type: 'fire',
            playload: {
              type: 'success',
              message: '已加入行程',
              id: 'toastify_upload',
            },
          });
          setIsAddingSchedule(false);
          departTimes.forEach((timestamp, index) => {
            const newDate = new Date(newSchedule.start_time);
            const currentDate = new Date(timestamp);
            if (
              newDate.getFullYear() >= currentDate.getFullYear() &&
              newDate.getMonth() >= currentDate.getMonth() &&
              newDate.getDate() >= currentDate.getDate()
            ) {
              allSchedules.current[index].push(newSchedule);
              allSchedules.current[index].sort(
                (a, b) => a.start_time - b.start_time
              );
            }
            setScheduleList([...allSchedules.current[day]]);
            dispatchAddSchedule({ type: 'reset' });
          });
        })
        .catch((error) => console.error(error));
    }
  };
  return (
    <>
      <Modal
        isShowState={showAddSchedule}
        close={() => setShowAddSchedule(false)}
        addCss={css`
          min-width: 80%;
          height: 80%;
        `}>
        <ModalContentWrapper>
          {isAddingSchedule ? (
            <Loader />
          ) : (
            <>
              <GoogleMapSearchBar
                placeholder="輸入要加入的景點"
                dispatch={(place) =>
                  dispatchAddSchedule({
                    type: 'changePlace',
                    playload: place,
                  })
                }
                map={map}
                addCss={{
                  container: css`
                    position: relative;
                    width: 100%;
                  `,
                }}
                placeDetailOption={{
                  fields: [
                    'name',
                    'place_id',
                    'formatted_address',
                    'photos',
                    'url',
                  ],
                }}
              />
              {addSchedule.placeDetail && (
                <div
                  css={css`
                    padding: 20px;
                  `}>
                  <SpotCard
                    imgSrc={addSchedule.placeDetail.photos[0]}
                    imgAlt={addSchedule.placeDetail.name}
                    title={addSchedule.placeDetail.name}
                    address={addSchedule.placeDetail.formatted_address}
                    onClick={() =>
                      window.open(addSchedule.placeDetail.url, '_blank')
                    }
                  />
                </div>
              )}
              <FormWrapper>
                <Select
                  defaultValue=""
                  value={addSchedule.start_time}
                  onChange={(e) =>
                    dispatchAddSchedule({
                      type: 'choseDate',
                      playload: Number(e.target.value),
                    })
                  }>
                  <option value="" disabled>
                    ---請選擇日期---
                  </option>
                  {departTimes.map((timestamp) => (
                    <option value={timestamp} key={timestamp}>
                      {timestampToString(timestamp, 'date')}
                    </option>
                  ))}
                </Select>
                <CustomTimePicker
                  value={addSchedule.start_time}
                  onChange={(newValue) => {
                    dispatchAddSchedule({
                      type: 'choseTime',
                      playload: newValue,
                    });
                  }}
                />
                <DurationInputWrapper>
                  <P>停留時間</P>
                  <DurationInput
                    type="number"
                    min="30"
                    max="1440"
                    value={addSchedule.duration}
                    step="30"
                    onChange={(e) =>
                      dispatchAddSchedule({
                        type: 'addDuration',
                        playload: Number(e.target.value),
                      })
                    }
                  />
                  <P>分鐘</P>
                </DurationInputWrapper>
                <Button
                  styled="primary"
                  margin="auto 0 0 0"
                  onClick={uploadNewSchedule}>
                  新增行程
                </Button>
              </FormWrapper>
            </>
          )}
        </ModalContentWrapper>
      </Modal>
      <AddScheduleContorllerWrapper>
        <P
          css={css`
            white-space: nowrap;
          `}>
          有計畫外的行程？
        </P>
        <ButtonSmall
          styled="primary"
          width="fit-content"
          type="button"
          onClick={() => {
            setShowAddSchedule(true);
          }}>
          加入行程
        </ButtonSmall>
      </AddScheduleContorllerWrapper>
    </>
  );
}

AddScheduleController.propTypes = {
  departTimes: PropTypes.arrayOf(PropTypes.number),
  itineraryId: PropTypes.string,
  allSchedules: PropTypes.shape({
    current: PropTypes.objectOf(PropTypes.array),
  }),
  setScheduleList: PropTypes.func,
  day: PropTypes.number,
};

export default AddScheduleController;
