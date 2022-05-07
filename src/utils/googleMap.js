import { Wrapper } from '@googlemaps/react-wrapper';
import { googleMapApiKey } from './apiKey';
import { useEffect, useRef, useContext } from 'react';
import { Context } from '../App';
import '../marker.css';
import { inputBase } from '../components/styledComponents/Form';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { palatte } from '../components/styledComponents/basicStyle';

const googleMap = {
  svgMarker(color) {
    return {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 0,
      rotation: 0,
      scale: 2,
      anchor: new window.google.maps.Point(0, 0),
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
      photos: place?.photos?.map((item) => item.getUrl()) || '未提供',
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
      ...options,
    };
    return new window.google.maps.places.Autocomplete(ref, defaultOptions);
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
    left: '32px',
    top: 'calc(50% - 10px)',
    color: palatte.gray[800],
  },
  container: {
    position: 'absolute',
    zIndex: '8',
    width: '500px',
    padding: '20px',
  },
  input: {
    width: '100%',
    paddingLeft: '40px',
  },
};
function SearchBar(props) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      const option =
        props.option === 'default'
          ? googleMap.placesRequestFields
          : props.option;
      const autocomplete = googleMap.initAutocomplete(
        ref.current,
        props.center,
        option
      );
      autocomplete.addListener('place_changed', () => {
        const place = googleMap.composePlaceDetailData(autocomplete.getPlace());
        if (place.geometry && place.name) {
          if (props.getPlaceShowOnMap) {
            props.getPlaceShowOnMap(place);
          } else if (props.dispatch) {
            props.dispatch(place);
          }
        }
      });
    }
  }, []);

  return (
    <div css={[searchBarStyles.container, props.addCss?.container]}>
      <input
        onFocus={(e) => e.target.select()}
        css={[inputBase, searchBarStyles.input, props.addCss?.input]}
        ref={ref}
        placeholder={props.placeholder}
      />
      <div
        css={[searchBarStyles.searchIcon, props.addCss?.searchIcon]}
        className="material-icons">
        search
      </div>
    </div>
  );
}
export { googleMap, EmptyMap, SearchBar };
