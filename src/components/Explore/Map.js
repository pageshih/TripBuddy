import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { googleMap } from '../../utils/googleMap';

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
  }, [ref, map, setMap]);

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

  return <div style={{ width: '100%', height: '100%' }} ref={ref} />;
}
Map.propTypes = {
  setMap: PropTypes.func,
  map: PropTypes.object,
  marker: PropTypes.object,
  setIsShowSavedSpots: PropTypes.func,
  resetMap: PropTypes.func,
  getPlaceShowOnMap: PropTypes.func,
};
export default Map;
