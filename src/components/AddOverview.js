import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { Context } from '../App';
import { firestore } from '../utils/firebase';
import { palatte, styles, mediaQuery } from './styledComponents/basic/common';
import { H5, P } from './styledComponents/basic/Text';
import { RoundButtonSmallWithLabel } from './styledComponents/Buttons/RoundButton';
import HyperLink from './styledComponents/Buttons/HyperLink';
import { Button, ButtonOutline } from './styledComponents/Buttons/Button';
import { SpotCard } from './styledComponents/Cards/SpotCard';
import { TextInput, CustomDateRangePicker } from './styledComponents/Form';

const Container = styled.div`
  ${styles.flex}
  background-color: ${palatte.gray[100]};
`;
const Wrapper = styled.form`
  ${styles.flexColumn};
  ${styles.containerSetting};
  width: 100%;
  min-height: 100vh;
  justify-content: space-between;
  position: relative;
  padding: 40px;
`;
const ContentWrapper = styled.div`
  ${styles.flexColumn};
  gap: 20px;
`;
const ButtonWrapper = styled.div`
  ${styles.flex};
  justify-content: ${(props) =>
    props.isFirstStep ? 'flex-end' : 'space-between'};
`;
const SpotsCardWrapper = styled.div`
  ${styles.flex};
  padding: 20px 20px 20px 0;
  gap: 30px;
  flex-wrap: wrap;
  overflow-y: auto;
  basis: 60vh;
  max-height: 100%;
  ${mediaQuery[0]} {
    max-height: 500px;
    overflow-y: unset;
    overflow-x: auto;
    flex-wrap: nowrap;
  }
`;
const DateRangePickerWrapper = styled.div`
  ${styles.flex};
  gap: 20px;
  align-items: center;
`;
const BackToExplore = ({ children, onClick }) => (
  <RoundButtonSmallWithLabel
    onClick={onClick}
    iconName="chevron_left"
    styled="gray700"
    addCss={css`
      padding: 0;
    `}
    type="button">
    {children}
  </RoundButtonSmallWithLabel>
);
const PrevButton = styled(ButtonOutline)`
  padding: 10px 20px 10px 10px;
  width: fit-content;
`;
const NextButton = styled(Button)`
  width: fit-content;
  padding: ${(props) => props.isNotLastStep && '10px 10px 10px 20px'};
`;
const SpotCardWrapper = styled.div`
  flex-basis: 30%;
  ${mediaQuery[0]} {
    flex-basis: 90%;
    min-width: 90%;
  }
`;
function AddOverview({ waitingSpots, setWaitingSpots }) {
  const { uid, dispatchNotification } = useContext(Context);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date().getTime());
  const [endDate, setEndDate] = useState(new Date().getTime());
  const [step, setStep] = useState(0);

  const addOverView = [
    {
      title: '為這趟旅程取個名字吧！',
      type: 'text',
      placeholder: '請輸入行程名稱',
      alert: '行程名稱還沒填喔！',
    },
    {
      title: '您選擇了這些景點：',
      type: 'cards',
      alert: '請加入景點再創建行程',
    },
    {
      title: '預計要去玩幾天呢？',
      type: 'calendar',
      alert: '日期不完整，請確認後再送出！',
    },
  ];
  const createItinerary = () => {
    const getTimestamp = (date) => new Date(date).getTime();
    const basicInfo = {
      title,
      start_date: getTimestamp(startDate),
      end_date: getTimestamp(endDate),
    };
    firestore
      .createItinerary(uid, basicInfo, waitingSpots)
      .then((itineraryId) => {
        navigate(`/add/${itineraryId}`);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const nextStep = () => {
    if (
      (step === 0 && title) ||
      (step === 1 && waitingSpots?.length > 0) ||
      (step === 2 && startDate && endDate)
    ) {
      setStep((prev) => prev + 1);
    } else {
      dispatchNotification({
        type: 'fire',
        playload: {
          type: 'warn',
          message: addOverView[step].alert,
          id: 'toastify_emptyValue',
        },
      });
    }
  };
  return (
    <Container>
      <Wrapper
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 2) {
            nextStep();
          } else {
            createItinerary();
          }
        }}>
        <BackToExplore onClick={() => navigate('/explore')}>
          回探索景點
        </BackToExplore>
        <ContentWrapper>
          {step === 1 && !waitingSpots?.length > 0 ? null : (
            <H5>{addOverView[step].title}</H5>
          )}

          {addOverView[step].type === 'text' && (
            <TextInput
              type="text"
              placeholder={addOverView[step].placeholder}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          )}
          {addOverView[step].type === 'cards' &&
            (waitingSpots?.length > 0 ? (
              <SpotsCardWrapper>
                {waitingSpots?.map((spot) => {
                  return (
                    <SpotCardWrapper key={spot.place_id}>
                      <SpotCard
                        imgSrc={spot.photos[0]}
                        imgAlt={spot.name}
                        title={spot.name}
                        address={spot.formatted_address}
                        rating={spot.rating}
                        id={spot.place_id}
                        isSmall
                        isShowCloseBtn
                        onDeleteClick={() =>
                          setWaitingSpots((prev) =>
                            prev.filter(
                              (oldSpot) => oldSpot.place_id !== spot.place_id
                            )
                          )
                        }
                      />
                    </SpotCardWrapper>
                  );
                })}
              </SpotsCardWrapper>
            ) : (
              <>
                <P>現在景點清單是空的，請加入景點，再創建行程</P>
                <HyperLink
                  onClick={() => navigate('/explore')}
                  iconName="chevron_right"
                  addCss={css`
                    align-items: flex-start;
                  `}>
                  前往探索景點
                </HyperLink>
              </>
            ))}
          {addOverView[step].type === 'calendar' && (
            <DateRangePickerWrapper>
              <CustomDateRangePicker
                width="100%"
                conjunction="到"
                startTimestamp={startDate}
                endTimestamp={endDate}
                setStartTimestamp={setStartDate}
                setEndTimestamp={setEndDate}
              />
            </DateRangePickerWrapper>
          )}
        </ContentWrapper>
        <ButtonWrapper isFirstStep={step < 1}>
          {step > 0 && (
            <PrevButton
              type="button"
              styled="gray"
              onClick={() => setStep((prev) => prev - 1)}>
              <span
                className="material-icons"
                css={css`
                  color: inherit;
                `}>
                chevron_left
              </span>
              上一步
            </PrevButton>
          )}
          <NextButton styled="primary" type="submit" isNotLastStep={step < 2}>
            {step < 2 ? '下一步' : '新建行程'}
            {step < 2 && (
              <span
                className="material-icons"
                css={css`
                  color: inherit;
                `}>
                chevron_right
              </span>
            )}
          </NextButton>
        </ButtonWrapper>
      </Wrapper>
    </Container>
  );
}
AddOverview.propTypes = {
  waitingSpots: PropTypes.array,
  setWaitingSpots: PropTypes.func,
};
export default AddOverview;
