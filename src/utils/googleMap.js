import { Wrapper } from '@googlemaps/react-wrapper';
import { googleMapApiKey } from './apiKey';
import { useEffect, useRef, useContext } from 'react';
import { Context } from '../App';
import markerIcon from '../images/place_black_48dp.svg';
import '../marker.css';
import { inputBase } from '../components/styledComponents/Form';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';

const googleMap = {
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
  ],
  composePlaceDetailData(place) {
    return {
      place_id: place?.place_id || '未提供',
      name: place?.name || '未提供',
      formatted_address: place?.formatted_address || '未提供',
      geometry: {
        lat: place?.geometry?.location.lat() || '未提供',
        lng: place?.geometry?.location.lng() || '未提供',
      },
      opening_hours: {
        periods: place?.opening_hours?.periods || ['未提供'],
        weekday_text: place?.opening_hours?.weekday_text || ['未提供'],
      },
      photos: place?.photos.map((item) => item.getUrl()) || '未提供',
      reviews: place?.reviews || '未提供',
      website: place?.website || '未提供',
      rating: place?.rating || '未提供',
      // types: place.types || '未提供',
      created_time: new Date().getTime(),
    };
  },
  initMap(ref, center, zoom) {
    const option = {
      center: center || this.center,
      zoom: zoom || this.zoom,
      disableDefaultUI: true,
      fullscreenControl: true,
      zoomControl: true,
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
        fields: fields ? fields : this.requestFields,
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
  async getDirection(parameter) {
    const newDirection = new window.google.maps.DirectionsService();
    const result = await newDirection.route(parameter);
    const route = result.routes[0].legs[0];
    const returnObj = {
      duration: route.duration,
      distance: route.distance,
    };
    return Promise.resolve(returnObj);
  },
  initAutocomplete(ref, center, options) {
    const defaultOptions = {
      bounds: {
        north: center?.lat + 0.1 || this.center.lat + 0.1,
        south: center?.lat - 0.1 || this.center.lat - 0.1,
        east: center?.lat + 0.1 || this.center.lng + 0.1,
        west: center?.lat - 0.1 || this.center.lng - 0.1,
      },
      fields: this.placesRequestFields,
      types: ['establishment'],
    };
    return new window.google.maps.places.Autocomplete(
      ref,
      options ? options : defaultOptions
    );
  },
};
function EmptyMap(props) {
  const ref = useRef();
  const { map, setMap } = useContext(Context);
  useEffect(() => {
    if (ref.current && !map) {
      setMap(googleMap.initMap(ref.current));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current, map, setMap]);

  return (
    <Wrapper apiKey={googleMapApiKey} libraries={props.libraries}>
      <div ref={ref} />
    </Wrapper>
  );
}

const searchBarStyles = {
  searchIcon: {
    position: 'absolute',
    backgroundColor: 'transparent',
    right: '26px',
    top: 'calc(50% - 12px)',
  },
  container: {
    position: 'absolute',
    zIndex: '8',
    width: '500px',
    padding: '20px',
  },
  input: {
    width: '100%',
  },
};
function SearchBar(props) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      const autocomplete = googleMap.initAutocomplete(ref.current);
      autocomplete.addListener('place_changed', () => {
        const place = googleMap.composePlaceDetailData(autocomplete.getPlace());
        if (place.geometry && place.name) {
          props.setPlaceDetail(place);
          props.setMarker(
            googleMap.setSelectedMarker(props.map, place.geometry, place.name)
          );
          props.map.panTo(place.geometry);
          props.setShowSavedSpots(false);
        }
      });
    }
  }, []);

  return (
    <div css={props.css?.container || searchBarStyles.container}>
      <input
        onFocus={(e) => e.target.select()}
        css={[inputBase, props.css?.input || searchBarStyles.input]}
        ref={ref}
      />
      <div
        css={props.css?.searchIcon || searchBarStyles.searchIcon}
        className="material-icons">
        search
      </div>
    </div>
  );
}
export { googleMap, EmptyMap, SearchBar };
