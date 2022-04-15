import markerIcon from '../images/place_black_48dp.svg';
import '../marker.css';

const googleMap = {
  featureShowPattern: {
    default: [
      {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'on' }],
      },
      {
        featureType: 'poi.attraction',
        stylers: [{ visibility: 'on' }],
      },
      {
        featureType: 'poi.park',
        stylers: [{ visibility: 'on' }],
      },
      {
        featureType: 'poi.place_of_worship',
        stylers: [{ visibility: 'on' }],
      },
    ],
    hideAll: [
      {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }],
      },
    ],
  },
  initMap(ref, center, zoom) {
    return new window.google.maps.Map(ref, { center, zoom });
  },
  setMapStyle(map, styles) {
    map.setOptions({
      styles: this.featureShowPattern[styles],
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
            name: place.name || '未提供',
            place_id: place.place_id || '未提供',
            formatted_address: place.formatted_address || '未提供',
            geometry: {
              lat: place.geometry.location.lat() || '未提供',
              lng: place.geometry.location.lng() || '未提供',
            },
            opening_hours: {
              open_now: place.opening_hours.open_now || '未提供',
              periods: place.opening_hours.periods || '未提供',
              weekday_text: place.opening_hours.weekday_text || '未提供',
            },
            photos: place.photos.map((item) => item.getUrl()) || '未提供',
            reviews: place.reviews || '未提供',
            website: place.website || '未提供',
            rating: place.rating || '未提供',
            types: place.types || '未提供',
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
    this.setMapStyle(map, 'hideAll');
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
