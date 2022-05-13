import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { googleMapApiKey } from '../utils/apiKey';
import { firestore } from '../utils/firebase';
import { googleMap, SearchBar } from '../utils/googleMap';
import { Context } from '../App';
import { AccordionSmall } from './styledComponents/Accordion';
import {
  RoundButton,
  Button,
  ButtonSmall,
  RoundButtonSmall,
  HyperLink,
} from './styledComponents/Button';
import { FlexDiv, FlexChildDiv, Image } from './styledComponents/Layout';
import { SpotCard, RatingText, AddressText } from './styledComponents/Cards';
import { SelectAllCheckBox, SelectSmall } from './styledComponents/Form';
import {
  P,
  H2,
  H3,
  palatte,
  TextWithIcon,
} from './styledComponents/basicStyle';
import { NotificationText } from './styledComponents/Notification';

function Map({
  setMap,
  map,
  marker,
  setIsShowSavedSpots,
  resetMap,
  getPlaceShowOnMap,
}) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current && !map) {
      setMap(googleMap.initMap(ref.current));
    } else {
      googleMap.setMapStyle(map, 'default');
    }
  }, [ref, map]);

  useEffect(() => {
    if (ref.current && map) {
      window.google.maps.event.addListener(map, 'click', (e) => {
        if (e.placeId) {
          setIsShowSavedSpots(false);
          if (marker) {
            googleMap.deleteMarker(marker);
          } else {
            googleMap
              .getPlaceDetails(map, e.placeId)
              .then((detail) => {
                getPlaceShowOnMap(detail);
              })
              .catch((status) => {
                console.log(status);
              });
          }
        } else {
          if (marker) {
            resetMap(true);
          }
        }
        e.stop();
      });
    }
  }, [map, marker]);

  return <div style={{ width: '100%', height: '100vh' }} ref={ref} />;
}

const GetTodayOpeningHours = (props) => {
  const splitOpeningTextAry = useRef();
  const [today, setToday] = useState();
  useEffect(() => {
    if (props.openingText) {
      splitOpeningTextAry.current = props.openingText.split(/: |,/);
      setToday(
        splitOpeningTextAry.current.reduce((final, text, index) => {
          if (index === 0) {
            final.push(
              <span
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
  }, [props.openingText]);
  return (
    <P
      key={props.key}
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
function PlaceDetail({
  placeDetail,
  removeFromSavedSpots,
  addToSavedSpots,
  checkIsSavedSpot,
}) {
  let today = new Date().getDay();
  today = today ? today - 1 : 6;
  const restOpeningText = () => {
    const restDays = placeDetail.opening_hours.weekday_text.filter(
      (_, index) => index !== today
    );
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
    <FlexDiv
      height="100%"
      direction="column"
      gap="20px"
      overflowY="auto"
      addCss={css`
        &::-webkit-scrollbar {
          display: none;
        }
      `}>
      <Image
        minHeight="250px"
        maxHeight="250px"
        src={placeDetail.photos[0]}
        alt="placePhoto"
      />
      <FlexChildDiv direction="column" padding="0 30px" gap="12px">
        <H2 fontSize="22px">{placeDetail.name}</H2>

        {placeDetail.opening_hours.weekday_text !== '未提供' && (
          <TextWithIcon
            gap="6px"
            iconGap="4px"
            iconName="access_time"
            iconLabel="營業時間"
            iconSize="18px"
            iconColor={palatte.gray[600]}
            textSize="14px"
            textColor={palatte.gray[700]}
            addCss={{
              text: css`
                & span {
                  color: inherit;
                }
              `,
            }}>
            <AccordionSmall
              filled
              titleElement={
                <GetTodayOpeningHours
                  key={`opening_hours_day_today`}
                  openingText={placeDetail.opening_hours.weekday_text[today]}
                />
              }>
              {restOpeningText().map((text, index) => (
                <GetTodayOpeningHours
                  key={`opening_hours_day${index + 1}`}
                  openingText={text}
                />
              ))}
            </AccordionSmall>
          </TextWithIcon>
        )}
        <AddressText withRating isSmall>
          {placeDetail.formatted_address}
        </AddressText>

        <RatingText rating={placeDetail.rating} isSmall />
        {placeDetail.website !== '未提供' && (
          <HyperLink
            href={placeDetail.website}
            alignSelf="flex-start"
            iconName="open_in_new">
            官方網站
          </HyperLink>
        )}
        <Button
          styled={
            placeDetail.savedSpot || checkIsSavedSpot(placeDetail.place_id)
              ? 'danger'
              : 'primary'
          }
          type="button"
          margin="10px 0 0 0 "
          onClick={() =>
            placeDetail.savedSpot || checkIsSavedSpot(placeDetail.place_id)
              ? removeFromSavedSpots([placeDetail.place_id])
              : addToSavedSpots()
          }>
          <span
            className="material-icons"
            css={css`
              color: inherit;
              font-size: 28px;
            `}>
            {placeDetail.savedSpot || checkIsSavedSpot(placeDetail.place_id)
              ? 'wrong_location'
              : 'add_location_alt'}
          </span>
          {placeDetail.savedSpot || checkIsSavedSpot(placeDetail.place_id)
            ? '從候補景點中移除'
            : '加入候補景點'}
        </Button>
      </FlexChildDiv>
      <FlexChildDiv direction="column" padding="0 30px 30px 30px" gap="20px">
        <H3 fontSize="18px">評論</H3>
        <FlexDiv as="ul" direction="column" gap="20px">
          {placeDetail.reviews === '未提供' ? (
            <P>找不到評論</P>
          ) : (
            placeDetail.reviews.map((review) => (
              <FlexDiv
                as="li"
                direction="column"
                padding="20px"
                gap="10px"
                key={review.time}
                css={css`
                  background-color: ${palatte.white};
                  border-radius: 10px;
                  border: 1px solid ${palatte.gray[400]};
                `}>
                <FlexDiv gap="12px" alignItems="center">
                  <Image
                    size="40px"
                    round
                    shadow
                    addCss={css`
                      border: 1px solid ${palatte.gray['100']};
                    `}
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
                </FlexDiv>
                <FlexDiv alignItems="center" gap="6px">
                  <RatingText rating={review.rating} size="18" isNoText />
                  <P fontSize="14px" color={palatte.gray[700]}>
                    {review.relative_time_description}
                  </P>
                </FlexDiv>
                <P>{review.text}</P>
              </FlexDiv>
            ))
          )}
        </FlexDiv>
      </FlexChildDiv>
    </FlexDiv>
  );
}
const ShadowBottom = styled.div`
  position: absolute;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0), ${palatte.gray[800]});
  opacity: 0.4;
  width: 100%;
  height: 20px;
  top: -40px;
`;
function SavedSpotsList(props) {
  const { uid } = useContext(Context);
  const navigate = useNavigate();
  const [selectedSpotList, setSelectedSpotList] = useState([]);
  const [addAction, setAddAction] = useState('');
  const [createdItineraries, setCreatedItineraries] = useState();
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [showAlert, setShowAlert] = useState();

  useEffect(() => {
    firestore
      .getItineraries(uid, new Date().getTime())
      .then((res) => setCreatedItineraries(res))
      .catch((error) => console.error(error));
  }, []);
  useEffect(() => {
    if (
      selectedSpotList.length === props.savedSpots?.length &&
      selectedSpotList.length !== 0
    ) {
      setIsSelectAll(true);
    } else {
      setIsSelectAll(false);
    }
  }, [selectedSpotList, props.savedSpots]);
  const addSelectSpotsToItinerary = () => {
    if (selectedSpotList?.length > 0 && addAction) {
      const waitingSpots = props.savedSpots.filter(
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
      if (!addAction) {
        setShowAlert('請選擇要加入的行程');
      }
    }
  };

  return (
    <FlexDiv direction="column" maxHeight="calc(100% - 30px)" gap="25px">
      <FlexDiv justifyContent="space-between" alignItems="flex-end">
        <H2 fontSize="24px">候補景點</H2>
        <SelectAllCheckBox
          size="20px"
          isSelectAll={isSelectAll}
          setIsSelectAll={setIsSelectAll}
          setAllChecked={() =>
            setSelectedSpotList(props.savedSpots.map((spot) => spot.place_id))
          }
          setAllUnchecked={() => setSelectedSpotList([])}
        />
      </FlexDiv>
      <FlexChildDiv direction="column" height="calc(100% - 30px)" gap="20px">
        <FlexChildDiv
          direction="column"
          overflowY="auto"
          shrink="1"
          gap="30px"
          padding="0 4px 10px 0"
          position="relative"
          addCss={css`
            &::-webkit-scrollbar {
              display: none;
            }
          `}>
          {props.savedSpots.map((spot) => (
            <SpotCard
              isSmall
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
              onClick={() => props.getSavedSpotDetail(spot)}
            />
          ))}
        </FlexChildDiv>

        {selectedSpotList?.length > 0 && (
          <FlexChildDiv
            direction="column"
            gap="15px"
            padding="0 0 10px 0"
            position="relative">
            <ShadowBottom />
            <NotificationText type="error">{showAlert}</NotificationText>
            <SelectSmall
              value={addAction}
              onChange={(e) => {
                setAddAction(e.target.value);
                if (e.target.value) {
                  setShowAlert('');
                }
              }}>
              <option value="" disabled>
                ---請選擇要加入景點的行程---
              </option>
              <option value="add">新建一個行程</option>
              {createdItineraries?.map((itinerary) => (
                <option
                  value={itinerary.itinerary_id}
                  key={itinerary.itinerary_id}>
                  {itinerary.title}
                </option>
              ))}
            </SelectSmall>
            <ButtonSmall styled="primary" onClick={addSelectSpotsToItinerary}>
              加入行程
            </ButtonSmall>
            <ButtonSmall
              styled="danger"
              onClick={() => props.removeFromSavedSpots(selectedSpotList)}>
              刪除景點
            </ButtonSmall>
          </FlexChildDiv>
        )}
      </FlexChildDiv>
    </FlexDiv>
  );
}
const ButtonOnMap = (props) => (
  <FlexDiv
    direction="column"
    gap="2px"
    alignItems="center"
    addCss={css`
      &:hover {
        & p {
          color: ${palatte.primary[300]};
        }
      }
    `}>
    <RoundButton className="material-icons" size="60px" onClick={props.onClick}>
      {props.iconName}
    </RoundButton>
    <P fontSize="14px" fontWeight="500" color={palatte.gray[200]}>
      {props.children}
    </P>
  </FlexDiv>
);
function Explore({ setWaitingSpots }) {
  const { uid } = useContext(Context);
  const [map, setMap] = useState();
  const [marker, setMarker] = useState();
  const [placeDetail, setPlaceDetail] = useState();
  const [savedSpots, setSavedSpots] = useState();
  const [isShowSavedSpots, setIsShowSavedSpots] = useState(false);
  const [isShowSideColumn, setIsShowSideColumn] = useState(false);
  const sideWindowRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (map && !savedSpots && uid) {
      firestore
        .getSavedSpots(uid, map)
        .then((res) => {
          setSavedSpots(res);
        })
        .catch((error) => console.error(error));
    }
  }, [map, savedSpots, uid]);
  const addToSavedSpots = () => {
    if (savedSpots.every((spot) => spot.place_id !== placeDetail.place_id)) {
      firestore.setSavedSpots(uid, [placeDetail]);
      if (savedSpots?.length > 0) {
        setSavedSpots([...savedSpots, placeDetail]);
      } else {
        setSavedSpots([placeDetail]);
      }
      setIsShowSavedSpots(true);
      setIsShowSideColumn(true);
      sideWindowRef.current.scrollTop = sideWindowRef.current.scrollHeight;
    } else {
      alert('此景點已在候補清單中！');
    }
  };
  const removeFromSavedSpots = (idAry) => {
    let newSavedSpots = [...savedSpots];
    idAry.forEach((id) => {
      newSavedSpots.forEach((spot, index, array) => {
        if (spot.place_id === id) {
          array.splice(index, 1);
        }
      });
    });
    firestore
      .deleteSavedSpots(uid, idAry)
      .then(() => {
        setSavedSpots(newSavedSpots);
      })
      .catch((error) => console.log(error));
  };

  const getSavedSpotDetail = (spot) => {
    setIsShowSavedSpots(false);
    setPlaceDetail({ ...spot, savedSpot: true });
    if (marker) {
      googleMap.deleteMarker(marker);
    }
    map.panTo(spot.geometry);
    setMarker(googleMap.setSelectedMarker(map, spot.geometry, spot.name));
  };
  const getPlaceShowOnMap = (detail) => {
    setMarker(googleMap.setSelectedMarker(map, detail.geometry, detail.name));
    map.panTo(detail.geometry);
    setPlaceDetail(detail);
    setIsShowSideColumn(true);
  };
  const resetMap = (closeSideColumn) => {
    googleMap.deleteMarker(marker);
    googleMap.setMapStyle(map, 'default');
    if (closeSideColumn) {
      setIsShowSideColumn(false);
    }
  };
  const expandButton = css`
    position: absolute;
    right: -15px;
    top: 10px;
    z-index: 1;
    padding: 10px;
    border: 1px solid ${palatte.white};
  `;
  return (
    <>
      {uid && (
        <>
          <FlexDiv height="100vh">
            {isShowSideColumn ? (
              <FlexChildDiv
                backgroundColor={palatte.gray[100]}
                direction="column"
                height="100%"
                position="relative"
                addCss={css`
                  border-right: 1px solid ${palatte.white};
                `}
                ref={sideWindowRef}
                basis={placeDetail || isShowSavedSpots ? '400px' : null}
                maxWidth={placeDetail || isShowSavedSpots ? '400px' : null}
                padding={
                  isShowSavedSpots ? '30px' : placeDetail ? '0px' : null
                }>
                <RoundButtonSmall
                  size="30px"
                  className="material-icons"
                  styled="gray700"
                  addCss={expandButton}
                  onClick={() => {
                    setIsShowSideColumn(false);
                    if (placeDetail) {
                      googleMap.deleteMarker(marker);
                      googleMap.setMapStyle(map, 'default');
                    }
                  }}>
                  chevron_left
                </RoundButtonSmall>
                {!isShowSavedSpots && placeDetail && (
                  <PlaceDetail
                    placeDetail={placeDetail}
                    addToSavedSpots={addToSavedSpots}
                    removeFromSavedSpots={removeFromSavedSpots}
                    checkIsSavedSpot={(placeId) =>
                      savedSpots.some((spot) => spot.place_id === placeId)
                    }
                  />
                )}
                {isShowSavedSpots && savedSpots?.length > 0 && (
                  <SavedSpotsList
                    savedSpots={savedSpots}
                    removeFromSavedSpots={removeFromSavedSpots}
                    getSavedSpotDetail={getSavedSpotDetail}
                    setWaitingSpots={setWaitingSpots}
                  />
                )}
                {isShowSavedSpots && savedSpots?.length === 0 && (
                  <P>還沒有加入的景點喔！請點選地圖上的圖標加入景點</P>
                )}
              </FlexChildDiv>
            ) : null}
            <FlexChildDiv grow="1" position="relative">
              <FlexDiv
                direction="column"
                alignItems="center"
                gap="10px"
                padding="20px 30px 20px 20px"
                css={css`
                  position: absolute;
                  background-color: ${palatte.gray[700]};
                  border-radius: 20px 0 0 20px;
                  top: 100px;
                  right: 0px;
                  z-index: 1000;
                `}>
                <ButtonOnMap
                  iconName="add_location"
                  onClick={() => {
                    if (!isShowSideColumn) {
                      setIsShowSavedSpots(true);
                      setIsShowSideColumn(true);
                    } else if (isShowSavedSpots) {
                      setIsShowSideColumn(false);
                      setIsShowSavedSpots(false);
                    } else {
                      setIsShowSavedSpots(true);
                      resetMap();
                    }
                  }}>
                  候補景點
                </ButtonOnMap>
                <ButtonOnMap
                  iconName="home"
                  onClick={() => navigate('/itineraries')}>
                  回首頁
                </ButtonOnMap>
              </FlexDiv>
              {map && (
                <SearchBar
                  placeholder="請輸入地址或關鍵字搜尋"
                  getPlaceShowOnMap={getPlaceShowOnMap}
                  option="default"
                  addCss={{
                    container: {
                      left: '15px',
                    },
                  }}
                />
              )}
              <Wrapper apiKey={googleMapApiKey} libraries={['places']}>
                <Map
                  getPlaceShowOnMap={getPlaceShowOnMap}
                  setMap={setMap}
                  map={map}
                  setMarker={setMarker}
                  marker={marker}
                  setIsShowSavedSpots={setIsShowSavedSpots}
                  resetMap={resetMap}
                />
              </Wrapper>
            </FlexChildDiv>
          </FlexDiv>
        </>
      )}
    </>
  );
}

export default Explore;
