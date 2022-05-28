import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { googleMap } from '../../utils/googleMap';
import { styles, PendingLoader } from '../styledComponents/basic/common';
import { P } from '../styledComponents/basic/Text';

function Map({
  setMap,
  map,
  center,
  marker,
  setIsShowSavedSpots,
  resetMap,
  getPlaceShowOnMap,
}) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current && !map && center) {
      setMap(googleMap.initMap(ref.current, center));
    } else if (map) {
      googleMap.setMapStyle(map, 'default');
    }
  }, [ref, map, setMap, center]);

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
                console.error(status);
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

  return (
    <>
      {center ? (
        <div style={{ width: '100%', height: '100%' }} ref={ref} />
      ) : (
        <div
          css={css`
            flex-grow: 1;
            ${styles.flexColumn};
            justify-content: center;
            align-items: center;
            gap: 10px;
          `}>
          <div
            css={css`
              width: 24px;
              height: 24px;
            `}>
            <PendingLoader size="24" />
          </div>
          <P>正在取得您的位置...</P>
        </div>
      )}
    </>
  );
}
Map.propTypes = {
  setMap: PropTypes.func,
  map: PropTypes.object,
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  marker: PropTypes.object,
  setIsShowSavedSpots: PropTypes.func,
  resetMap: PropTypes.func,
  getPlaceShowOnMap: PropTypes.func,
};
export default Map;
