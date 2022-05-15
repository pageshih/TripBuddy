import { useContext, useEffect, useState, useRef, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import {
  mediaQuery,
  palatte,
  styles,
  Loader,
} from './styledComponents/basicStyle';
import { FlexDiv } from './styledComponents/Layout';
import { SpotCard } from './styledComponents/Cards';
import { SelectAllCheckBox, SelectSmall } from './styledComponents/Form';
import {
  Button,
  ButtonSmallOutline,
  ButtonSmall,
} from './styledComponents/Button';
import { Confirm } from './styledComponents/Modal';
import {
  Notification,
  defaultNotification,
  notificationReducer,
  TooltipNotification,
} from './styledComponents/Notification';

function SavedSpots(props) {
  const { uid, map } = useContext(Context);
  const [savedSpots, setSavedSpots] = useState();
  const [selectedSpotList, setSelectedSpotList] = useState([]);
  const [addAction, setAddAction] = useState('');
  const [createdItineraries, setCreatedItineraries] = useState();
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState();
  const [notificationSetting, dispatchNotification] = useReducer(
    notificationReducer,
    defaultNotification
  );
  const [tooltipAlert, dispatchTooltipAlert] = useReducer(
    notificationReducer,
    defaultNotification
  );
  const navigate = useNavigate();
  const deleteSpots = () => {
    const newSavedSpots = savedSpots.filter((spot) => {
      return (
        selectedSpotList.every((selectedId) => selectedId !== spot.place_id) &&
        spot
      );
    });
    setSavedSpots(newSavedSpots);
    firestore
      .deleteSavedSpots(uid, selectedSpotList)
      .then(() => {
        dispatchNotification({
          type: 'fire',
          playload: {
            type: 'success',
            message: '景點已刪除',
            id: 'taostifyDeleted',
          },
        });
        dispatchNotification({ type: 'close' });
        setIsDeleteConfirm(false);
      })
      .catch((error) => console.error(error));
  };
  const addSelectSpotsToItinerary = () => {
    if (selectedSpotList?.length > 0 && addAction) {
      const waitingSpots = savedSpots.filter(
        (spot) =>
          selectedSpotList.some((selectedId) => spot.place_id === selectedId) &&
          spot
      );

      if (addAction === 'add') {
        props.setWaitingSpots(waitingSpots);
        navigate('/add');
      } else {
        firestore
          .setWaitingSpots(uid, addAction, waitingSpots)
          .then(() => navigate(`/add/${addAction}`))
          .catch((error) => console.error(error));
      }
    } else {
      console.log('no');
      const playload = {
        type: 'warn',
        message: '還沒有選擇景點喔！',
        id: 'addSpots',
      };
      if (selectedSpotList?.length <= 0) {
        dispatchTooltipAlert({
          type: 'fire',
          playload,
        });
      } else if (!addAction) {
        playload.message = '請選擇要加入景點的行程';
        dispatchTooltipAlert({
          type: 'fire',
          playload,
        });
      }
    }
  };
  useEffect(() => {
    if (map) {
      firestore
        .getSavedSpots(uid, map)
        .then((res) => setSavedSpots(res))
        .catch((error) => console.error(error));
      firestore
        .getItineraries(uid, new Date().getTime())
        .then((res) => setCreatedItineraries(res))
        .catch((error) => console.error(error));
    }
  }, [map]);
  return (
    <>
      <Notification
        type={notificationSetting.type}
        fire={notificationSetting.fire}
        message={notificationSetting.message}
        id={notificationSetting.id}
        resetFireState={() => dispatchNotification({ type: 'close' })}
      />
      <Confirm
        isShowState={isDeleteConfirm}
        setIsShowState={setIsDeleteConfirm}
        confirmMessage="確定要刪除這些景點嗎？"
        subMessage="(此動作無法復原）"
        yesMessage="刪除"
        yesBtnStyle="danger"
        noBtnStyle="gray"
        yesAction={deleteSpots}
      />
      <FlexDiv
        direction="column"
        gap="40px"
        addCss={css`
          ${styles.containerSetting};
          padding-bottom: 80px;
        `}>
        <FlexDiv
          gap="20px"
          justifyContent="space-between"
          padding="0 10px 20px 10px"
          addCss={css`
            border-bottom: 1px solid ${palatte.gray['400']};
          `}>
          <SelectAllCheckBox
            isSelectAll={isSelectAll}
            setIsSelectAll={setIsSelectAll}
            setAllChecked={() =>
              setSelectedSpotList(savedSpots.map((spot) => spot.place_id))
            }
            setAllUnchecked={() => setSelectedSpotList([])}
          />
          <FlexDiv gap="20px">
            <SelectSmall
              value={addAction}
              onChange={(e) => setAddAction(e.target.value)}>
              <option value="" disabled>
                ---選擇要加入景點的行程---
              </option>
              <option value="add">建立一個新行程</option>
              {createdItineraries?.map((itinerary) => (
                <option
                  key={itinerary.itinerary_id}
                  value={itinerary.itinerary_id}>
                  {itinerary.title}
                </option>
              ))}
            </SelectSmall>
            <TooltipNotification
              settingReducer={tooltipAlert}
              resetSettingReducer={dispatchTooltipAlert}
              isOpen={tooltipAlert.id === 'addSpots'}>
              <ButtonSmall
                styled="primary"
                type="click"
                onClick={addSelectSpotsToItinerary}>
                加入行程
              </ButtonSmall>
            </TooltipNotification>
            <TooltipNotification
              settingReducer={tooltipAlert}
              resetSettingReducer={dispatchTooltipAlert}
              isOpen={tooltipAlert.id === 'deleteSpots'}>
              <ButtonSmallOutline
                styled="danger"
                type="click"
                onClick={() => {
                  if (selectedSpotList?.length > 0) {
                    setIsDeleteConfirm(true);
                  } else {
                    dispatchTooltipAlert({
                      type: 'fire',
                      playload: {
                        type: 'warn',
                        message: '還沒有選擇景點喔！',
                        id: 'deleteSpots',
                      },
                    });
                  }
                }}>
                刪除景點
              </ButtonSmallOutline>
            </TooltipNotification>
          </FlexDiv>
        </FlexDiv>

        {savedSpots?.map((spot) => (
          <SpotCard
            key={spot.place_id}
            title={spot.name}
            address={spot.formatted_address}
            id={spot.place_id}
            selectedList={selectedSpotList}
            setSelectedList={setSelectedSpotList}
            imgSrc={spot.photos[0]}
            imgAlt={spot.name}
            rating={spot.rating}
            isEdit
          />
        ))}
        {!savedSpots && <Loader />}
        <Button
          styled="primary"
          type="click"
          addCss={css`
            margin: 20px auto;
            width: fit-content;
            ${mediaQuery[0]} {
              width: 100%;
            }
          `}
          onClick={() => navigate('/explore')}>
          新增景點
        </Button>
      </FlexDiv>
    </>
  );
}

export default SavedSpots;
