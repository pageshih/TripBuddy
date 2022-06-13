import { useState } from 'react';
import {
  Explore,
  Directions,
  DirectionsBike,
  DirectionsCarFilled,
  DirectionsBus,
  DirectionsWalk,
} from '@mui/icons-material';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { styles, palatte, mediaQuery } from '../basic/common';
import { P } from '../basic/Text';
import { Select } from '../Form';
import { ButtonSmallOutlineIcon } from '../Buttons/Button';
import { useEffect } from 'react';

const transportMode = (schedule) => {
  const departureTime =
    schedule?.end_time < new Date().getTime()
      ? new Date()
      : new Date(schedule?.end_time);
  return {
    BICYCLING: {
      title: '騎自行車',
      icon: DirectionsBike,
      config: {
        travelMode: 'BICYCLING',
      },
    },
    DRIVING: {
      title: '開車',
      icon: DirectionsCarFilled,
      config: {
        travelMode: 'DRIVING',
        drivingOptions: {
          departureTime: schedule ? departureTime : null,
        },
      },
    },
    TRANSIT: {
      title: '搭乘大眾運輸',
      icon: DirectionsBus,
      config: {
        travelMode: 'TRANSIT',
        transitOptions: {
          departureTime: schedule ? departureTime : null,
        },
      },
    },
    WALKING: {
      title: '走路',
      icon: DirectionsWalk,
      config: {
        travelMode: 'WALKING',
      },
    },
  };
};
const TransitText = styled(P)`
  color: ${palatte.info.basic};
  white-space: nowrap;
  ${mediaQuery[0]} {
    color: ${palatte.gray[600]};
  }
`;
const Container = styled.div`
  ${styles.flex}
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  min-width: 80%;
  margin-left: auto;
  margin-right: 10px;
  ${mediaQuery[0]} {
    flex-wrap: wrap;
    width: 100%;
    gap: 10px;
    background-color: ${palatte.gray[200]};
    border-radius: 10px;
    padding: 15px 15px 15px 40px;
    position: relative;
    margin: 10px 0;
    &::before {
      content: '';
      height: 120%;
      position: absolute;
      top: -10%;
      left: 15px;
      border-left: 3px dashed ${palatte.info.basic};
    }
    &::after {
      content: '';
      position: absolute;
      left: 10px;
      bottom: calc(-10% - 3px);
      width: 10px;
      height: 10px;
      border-left: 3px solid ${palatte.info.basic};
      border-bottom: 3px solid ${palatte.info.basic};
      transform: rotate(-45deg);
    }
  }
`;
const TransitIcon = styled.div`
  color: ${palatte.info.basic};
  font-size: 60px;
  ${mediaQuery[0]} {
    font-size: 24px;
    color: ${palatte.gray[500]};
  }
`;
const TransitDetailWrapper = styled.div`
  ${styles.flex}
  gap: ${(props) => (props.isEdit ? '10px' : '5px')};
  align-items: center;
  flex-wrap: wrap;
`;
const TransitTextWrapper = styled.div`
  ${styles.flex}
  gap: 30px;
  width: 100%;
  justify-content: center;
  ${mediaQuery[0]} {
    width: fit-content;
    flex-direction: column;
    gap: 10px;
  }
`;
const TransitDurationWrapper = styled.div`
  ${styles.flex}
  align-items: center;
  gap: 10px;
`;
function TransitCard({
  isEdit,
  travelMode,
  changeTrasitWay,
  scheduleId,
  transitDetail,
}) {
  const [TransitIconSvg, setTransitIconSvg] = useState(
    transportMode()[travelMode].icon
  );

  useEffect(() => {
    if (travelMode) {
      setTransitIconSvg(transportMode()[travelMode].icon);
    }
  }, [travelMode]);
  return (
    <Container>
      <TransitTextWrapper>
        <TransitDetailWrapper isEdit={isEdit}>
          {isEdit ? (
            <>
              <TransitDurationWrapper>
                <TransitIcon>
                  <TransitIconSvg fontSize="inherit" />
                </TransitIcon>
                <Select
                  css={css`
                    ${mediaQuery[0]} {
                      width: 100px;
                    }
                  `}
                  value={travelMode}
                  onChange={(e) => changeTrasitWay(scheduleId, e.target.value)}>
                  {Object.keys(transportMode()).map((mode) => (
                    <option key={mode} value={mode}>
                      {transportMode()[mode].title}
                    </option>
                  ))}
                </Select>
              </TransitDurationWrapper>
              <P
                addCss={css`
                  color: ${palatte.info.basic};
                  white-space: nowrap;
                  ${mediaQuery[0]} {
                    color: ${palatte.gray[500]};
                  }
                `}>
                {transitDetail.duration.text}
              </P>
            </>
          ) : (
            <>
              <TransitIcon>
                <TransitIconSvg fontSize="inherit" />
              </TransitIcon>
              <TransitText>
                {transportMode()[travelMode].title +
                  transitDetail.duration.text}
              </TransitText>
            </>
          )}
        </TransitDetailWrapper>
        <TransitDetailWrapper>
          <TransitIcon>
            <Directions fontSize="inherit" />
          </TransitIcon>
          <TransitText>距離{transitDetail.distance.text}</TransitText>
        </TransitDetailWrapper>
      </TransitTextWrapper>
      {!isEdit && (
        <ButtonSmallOutlineIcon
          styled="info"
          onClick={() => window.open(transitDetail.direction_url, '_blank')}
          addCss={css`
            width: fit-content;
          `}>
          <Explore sx={{ fontSize: 20 }} />
          開始導航
        </ButtonSmallOutlineIcon>
      )}
    </Container>
  );
}
TransitCard.propTypes = {
  isEdit: PropTypes.bool,
  travelMode: PropTypes.string,
  changeTrasitWay: PropTypes.func,
  scheduleId: PropTypes.string,
  transitDetail: PropTypes.shape({
    direction_url: PropTypes.string,
    distance: PropTypes.object,
    duration: PropTypes.object,
  }),
};
export { TransitCard, transportMode };
