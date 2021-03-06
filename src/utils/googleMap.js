import { Wrapper } from '@googlemaps/react-wrapper';
import { googleMapApiKey } from './apiKey';
import { useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import { Context } from '../App';
import '../css/marker.css';
import { palatte } from '../components/styledComponents/basic/common';

const googleMap = {
  svgMarker(color) {
    return {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 0,
      rotation: 0,
      scale: 2,
      anchor: new window.google.maps.Point(12, 20),
      labelOrigin: new window.google.maps.Point(13, -5),
    };
  },
  center: {
    lat: 25.038621247241373,
    lng: 121.53236932147014,
  },
  zoom: 16,
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
  placesRequestFields: [
    'name',
    'place_id',
    'formatted_address',
    'geometry.location',
    'opening_hours.periods',
    'opening_hours.weekday_text',
    'photos',
    'reviews',
    'website',
    'rating',
    'url',
  ],
  composePlaceDetailData(place) {
    return {
      place_id: place?.place_id || null,
      name: place?.name || null,
      formatted_address: place?.formatted_address || null,
      geometry: {
        lat: place?.geometry?.location.lat() || null,
        lng: place?.geometry?.location.lng() || null,
      },
      opening_hours: {
        periods: place?.opening_hours?.periods || null,
        weekday_text: place?.opening_hours?.weekday_text || null,
      },
      photos: place?.photos?.map((item) => item.getUrl()) || null,
      reviews: place?.reviews || null,
      website: place?.website || null,
      rating: place?.rating || null,
      created_time: new Date().getTime(),
      url: place?.url || null,
    };
  },
  initMap(ref, center, zoom) {
    const option = {
      center: center || this.center,
      zoom: zoom || this.zoom,
      disableDefaultUI: true,
    };
    return new window.google.maps.Map(ref, option);
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
        fields: fields ? fields : this.placesRequestFields,
      };
      placeService.getDetails(placeRequest, (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
          const removeMethodsInPlaceDetail = this.composePlaceDetailData(place);
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
        color: palatte.danger[600],
        className: 'label',
      },
      icon: this.svgMarker(palatte.danger[400]),
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
  async getDirection(parameter, destinationAddressAndName) {
    const newDirection = new window.google.maps.DirectionsService();
    const result = await newDirection.route(parameter);
    const route = result.routes[0].legs[0];
    const destination =
      destinationAddressAndName?.name ||
      destinationAddressAndName?.address ||
      `${parameter.destination.lat},${parameter.destination.lng}`;
    const returnObj = {
      duration: route.duration,
      distance: route.distance,
      direction_url: `https://www.google.com/maps?saddr=My+Location&daddr=${destination}`,
    };
    return Promise.resolve(returnObj);
  },
  initAutocomplete(ref, center, options) {
    const defaultOptions = {
      bounds: {
        north: center?.lat + 0.1 || this.center.lat + 0.1,
        south: center?.lat - 0.1 || this.center.lat - 0.1,
        east: center?.lng + 0.1 || this.center.lng + 0.1,
        west: center?.lng - 0.1 || this.center.lng - 0.1,
      },
      fields: this.placesRequestFields,
      types: ['establishment'],
      ...options,
    };
    return new window.google.maps.places.Autocomplete(ref, defaultOptions);
  },
};
function EmptyMap({ libraries }) {
  const ref = useRef();
  const { map, setMap } = useContext(Context);
  useEffect(() => {
    if (ref.current && !map) {
      setMap(googleMap.initMap(ref.current));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current, map, setMap]);

  return (
    <Wrapper apiKey={googleMapApiKey} language="zh-tw" libraries={libraries}>
      <div ref={ref} />
    </Wrapper>
  );
}
EmptyMap.propTypes = {
  libraries: PropTypes.arrayOf(PropTypes.string),
};

export { googleMap, EmptyMap };
