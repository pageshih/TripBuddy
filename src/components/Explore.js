import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useContext, useEffect, useState, useRef, useReducer } from 'react';
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
  RoundButtonSmall,
  HyperLink,
} from './styledComponents/Button';
import { FlexDiv, FlexChildDiv, Image } from './styledComponents/Layout';
import { SpotCard, RatingText, AddressText } from './styledComponents/Cards';
import { SelectAllCheckBox } from './styledComponents/Form';
import {
  P,
  H2,
  H3,
  palatte,
  TextWithIcon,
  mediaQuery,
} from './styledComponents/basicStyle';
import { AddSpotToItineraryController } from './EditItinerary/AddSpotToItineraryController';

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

  return <div style={{ width: '100%', height: '100%' }} ref={ref} />;
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

const PlaceOverview = ({
  imgUrl,
  openingHours,
  spotName,
  address,
  rating,
  website,
  buttonAction,
  isSavedSpot,
}) => {
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
    <FlexDiv
      css={css`
        flex-direction: column;
        gap: 10px;
        ${mediaQuery[0]} {
        }
      `}>
      <div
        css={css`
          display: flex;
          flex-direction: column;
          gap: 20px;
          ${mediaQuery[0]} {
            flex-direction: row;
            justify-content: space-between;
            flex-basis: 200px;
            gap: 10px;
          }
        `}>
        <Image
          src={imgUrl}
          alt="placePhoto"
          addCss={css`
            ${mediaQuery[0]} {
              flex-basis: 50%;
              height: 160px;
            }
          `}
        />
        <FlexChildDiv
          css={css`
            flex-direction: column;
            gap: 12px;
            padding: 0 20px;
            ${mediaQuery[0]} {
              order: -1;
              padding: 0;
            }
          `}>
          <H2
            css={css`
              font-size: 22px;
              ${mediaQuery[0]} {
                font-size: 16px;
              }
            `}>
            {spotName}
          </H2>

          {openingHours && (
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
                iconLabel: css`
                  ${mediaQuery[0]} {
                    display: none;
                  }
                `,
              }}>
              <AccordionSmall
                filled
                titleElement={
                  <GetTodayOpeningHours
                    key={`opening_hours_day_today`}
                    openingText={openingHours[today]}
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
            {address}
          </AddressText>

          <RatingText rating={rating} isSmall />
          {website && (
            <HyperLink
              href={website}
              alignSelf="flex-start"
              iconName="open_in_new">
              官方網站
            </HyperLink>
          )}
        </FlexChildDiv>
      </div>
      <Button
        styled={isSavedSpot ? 'danger' : 'primary'}
        type="button"
        css={css`
          width: calc(100% - 60px);
          margin: 0 30px;
          ${mediaQuery[0]} {
            width: 100%;
            margin: 0;
          }
        `}
        onClick={buttonAction}>
        <span
          className="material-icons"
          css={css`
            color: inherit;
            font-size: 28px;
          `}>
          {isSavedSpot ? 'wrong_location' : 'add_location_alt'}
        </span>
        {isSavedSpot ? '從候補景點中移除' : '加入候補景點'}
      </Button>
    </FlexDiv>
  );
};
const PlaceReview = ({ reviews }) => {
  return (
    <FlexChildDiv
      css={css`
        flex-direction: column;
        padding: 0 30px 30px 30px;
        gap: 20px;
        ${mediaQuery[0]} {
          padding: 0;
        }
      `}>
      <H3
        css={css`
          font-size: 18px;
          ${mediaQuery[0]} {
            font-size: 18px;
          }
        `}>
        評論
      </H3>
      <FlexDiv as="ul" direction="column" gap="20px">
        {reviews ? (
          reviews.map((review) => (
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
        ) : (
          <P>找不到評論</P>
        )}
      </FlexDiv>
    </FlexChildDiv>
  );
};
function PlaceDetail({
  placeDetail,
  removeFromSavedSpots,
  addToSavedSpots,
  checkIsSavedSpot,
}) {
  return (
    <FlexDiv
      css={css`
        height: 100%;
        flex-direction: column;
        gap: 20px;
        overflow-y: auto;
        &::-webkit-scrollbar {
          display: none;
        }
        ${mediaQuery[0]} {
          padding: 30px 20px;
        }
      `}>
      <PlaceOverview
        isSavedSpot={checkIsSavedSpot(placeDetail.place_id)}
        spotName={placeDetail.name}
        address={placeDetail.formatted_address}
        imgUrl={placeDetail.photos[0]}
        rating={placeDetail.rating}
        website={placeDetail.website !== '未提供' && placeDetail.website}
        buttonAction={() =>
          checkIsSavedSpot(placeDetail.place_id)
            ? removeFromSavedSpots([placeDetail.place_id])
            : addToSavedSpots()
        }
        openingHours={
          placeDetail.opening_hours.weekday_text !== '未提供' &&
          placeDetail.opening_hours.weekday_text
        }
      />
      <PlaceReview
        reviews={placeDetail.reviews !== '未提供' && placeDetail.reviews}
      />
    </FlexDiv>
  );
}

function SavedSpotsList(props) {
  const { uid, dispatchNotification } = useContext(Context);
  const navigate = useNavigate();
  const [selectedSpotList, setSelectedSpotList] = useState([]);
  const [choseItinerary, setChoseItinerary] = useState('');
  const [createdItineraries, setCreatedItineraries] = useState();
  const [isSelectAll, setIsSelectAll] = useState(false);

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
    if (selectedSpotList?.length > 0 && choseItinerary) {
      const waitingSpots = props.savedSpots.filter(
        (spot) =>
          selectedSpotList.some((selectedId) => spot.place_id === selectedId) &&
          spot
      );
      if (choseItinerary === 'add') {
        props.setWaitingSpots(waitingSpots);
        navigate('/add');
      } else {
        firestore
          .setWaitingSpots(uid, choseItinerary, waitingSpots)
          .then(() => navigate(`/add/${choseItinerary}`))
          .catch((error) => console.error(error));
      }
    } else {
      if (!choseItinerary) {
        dispatchNotification({
          type: 'fire',
          playload: {
            type: 'error',
            message: '請選擇要加入的行程',
            id: 'textNotification_emptyValue',
          },
        });
      }
    }
  };
  const spotsContainer = css`
    flex-direction: column;
    overflow-y: auto;
    flex-shrink: 1;
    gap: 30px;
    padding: 0 4px 10px 0;
    position: relative;
    &::-webkit-scrollbar {
      display: none;
    }
    ${mediaQuery[0]} {
      gap: 15px;
      flex-direction: row;
      overflow-y: initial;
      overflow-x: auto;
      padding: 0;
      flex-basis: 100%;
    }
  `;
  const headerContainer = css`
    justify-content: space-between;
    align-items: flex-end;
    ${mediaQuery[0]} {
      align-items: center;
    }
  `;
  const container = css`
    flex-direction: column;
    height: 100%;
    gap: 25px;
    ${mediaQuery[0]} {
      gap: 10px;
    }
  `;
  return (
    <>
      <FlexDiv css={container}>
        <FlexDiv css={headerContainer}>
          <H2
            css={css`
              font-size: 24px;
              ${mediaQuery[0]} {
                font-size: 20px;
              }
            `}>
            候補景點
          </H2>
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
        <FlexChildDiv
          css={css`
            flex-direction: column;
            height: calc(100% - 30px);
            gap: 20px;
            ${mediaQuery[0]} {
              gap: 10px;
            }
          `}>
          <FlexChildDiv css={spotsContainer}>
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
            <AddSpotToItineraryController
              createdItineraries={createdItineraries}
              choseItinerary={choseItinerary}
              addAction={addSelectSpotsToItinerary}
              deleteAction={() => props.removeFromSavedSpots(selectedSpotList)}
              selectedSpots={selectedSpotList}
              onChangeItinerary={(e) => {
                setChoseItinerary(e.target.value);
              }}
              isColumn
              isShowShadow
            />
          )}
        </FlexChildDiv>
      </FlexDiv>
    </>
  );
}
const ButtonOnMap = (props) => (
  <FlexDiv
    direction="column"
    gap="2px"
    alignItems="center"
    css={css`
      &:hover {
        & p {
          color: ${palatte.primary[300]};
        }
      }
    `}>
    <RoundButton
      className="material-icons"
      size="60px"
      css={css`
        ${mediaQuery[0]} {
          width: 40px;
          height: 40px;
          font-size: 25px;
        }
      `}
      onClick={props.onClick}>
      {props.iconName}
    </RoundButton>
    <P fontSize="14px" fontWeight="500" color={palatte.gray[200]}>
      {props.children}
    </P>
  </FlexDiv>
);
const NavigateButtonsOnMap = (props) => {
  return (
    <FlexDiv
      css={css`
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 20px 30px 20px 20px;
        position: absolute;
        background-color: ${palatte.gray[700]};
        border-radius: 20px 0 0 20px;
        top: 100px;
        right: 0px;
        z-index: 1000;
        ${mediaQuery[0]} {
          padding: 15px;
        }
      `}>
      <ButtonOnMap iconName="add_location" onClick={props.onWaitingSpotClick}>
        候補景點
      </ButtonOnMap>
      <ButtonOnMap iconName="home" onClick={props.onHomeClick}>
        回首頁
      </ButtonOnMap>
    </FlexDiv>
  );
};
const ExpandButton = (props) => (
  <RoundButtonSmall
    size="30px"
    className="material-icons"
    styled="gray700"
    addCss={css`
      position: absolute;
      right: -15px;
      top: 10px;
      z-index: 1;
      padding: 10px;
      border: 1px solid ${palatte.white};
      ${mediaQuery[0]} {
        right: 15px;
        top: -15px;
        transform: rotate(-90deg);
      }
    `}
    onClick={props.onClick}>
    chevron_left
  </RoundButtonSmall>
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
  const sideBarContainer = css`
    background-color: ${palatte.gray[100]};
    flex-direction: column;
    height: 100%;
    position: relative;
    flex-basis: ${placeDetail || isShowSavedSpots ? '400px' : null};
    max-width: ${placeDetail || isShowSavedSpots ? '400px' : null};
    padding: ${isShowSavedSpots ? '30px' : placeDetail && '0px'};
    border-right: 1px solid ${palatte.white};
    ${mediaQuery[0]} {
      order: 1;
      height: 30%;
      max-width: 100%;
      padding: ${isShowSavedSpots && '20px'};
    }
  `;
  return (
    <>
      {uid && (
        <>
          <FlexDiv
            height="100vh"
            css={css`
              ${mediaQuery[0]} {
                flex-direction: column;
              }
            `}>
            {isShowSideColumn && (
              <FlexChildDiv css={sideBarContainer} ref={sideWindowRef}>
                <ExpandButton
                  onClick={() => {
                    setIsShowSideColumn(false);
                    if (placeDetail) {
                      googleMap.deleteMarker(marker);
                      googleMap.setMapStyle(map, 'default');
                    }
                  }}
                />
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
            )}
            <FlexChildDiv
              grow="1"
              position="relative"
              css={css`
                ${mediaQuery[0]} {
                  height: 70%;
                }
              `}>
              <NavigateButtonsOnMap
                onWaitingSpotClick={() => {
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
                }}
                onHomeClick={() => navigate('/itineraries')}
              />
              {map && (
                <SearchBar
                  placeholder="請輸入地址或關鍵字搜尋"
                  getPlaceShowOnMap={getPlaceShowOnMap}
                  option="default"
                  addCss={{
                    container: {
                      left: '15px',
                      [mediaQuery[0]]: {
                        left: '0',
                      },
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
