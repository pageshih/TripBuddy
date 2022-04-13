import markerIcon from '../images/place_black_48dp.svg';
import '../marker.css';

const googleMap = {
  initMap(ref, center, zoom) {
    return new window.google.maps.Map(ref, { center, zoom });
  },
  setMapStyle(map, styles) {
    map.setOptions({
      styles,
    });
  },
  getPlaceDetails(map, placeId, fields) {
    return new Promise((resolve, reject) => {
      const placeService = new window.google.maps.places.PlacesService(map);
      const placeRequest = {
        placeId,
        fields,
      };
      placeService.getDetails(placeRequest, (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
          const removeMethodsInPlaceDetail = {
            name: place?.name,
            place_id: place?.place_id,
            formatted_address: place?.formatted_address,
            geometry: {
              lat: place?.geometry?.location?.lat(),
              lng: place?.geometry?.location?.lng(),
            },
            opening_hours: {
              open_now: place?.opening_hours?.open_now,
              periods: place?.opening_hours?.periods,
              weekday_text: place?.opening_hours?.weekday_text,
            },
            photos: place?.photos?.map((item) => item.getUrl()),
            reviews: place?.reviews,
            website: place?.website,
            rating: place?.rating,
            types: place?.types,
          };
          resolve(removeMethodsInPlaceDetail);
        } else {
          reject(status);
        }
      });
    });
  },
  selectedMarkerStyle(labelName) {
    return {
      label: {
        text: labelName,
        color: '#de3400',
        className: 'label',
      },
      icon: {
        url: markerIcon,
        labelOrigin: new window.google.maps.Point(25, -10),
        size: new window.google.maps.Size(48, 48),
      },
    };
  },
  setSelectedMarker(map, position, labelName) {
    return new window.google.maps.Marker({
      map,
      position,
      ...this.selectedMarkerStyle(labelName),
    });
  },
  deleteMarker(marker) {
    marker.setMap(null);
  },
};

export default googleMap;
