import { useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { Context } from '../../App';
import { TextInput } from './Form';
import { mediaQuery, palatte } from './basic/common';
import { googleMap } from '../../utils/googleMap';

const searchBarStyles = {
  container: css`
    position: absolute;
    z-index: 8;
    width: 600px;
    padding: 20px;
    ${mediaQuery[0]} {
      width: 100%;
    }
  `,
  input: css`
    width: 100%;
    padding-left: 40px;
    ${mediaQuery[0]} {
      width: 100%;
    }
  `,
  searchIcon: css`
    position: absolute;
    background-color: transparent;
    left: 32px;
    top: calc(50% - 10px);
    color: ${palatte.gray[800]};
  `,
};

const Container = styled.div`
  ${searchBarStyles.container}
`;
const SearchInput = styled(TextInput)`
  ${searchBarStyles.input};
`;
const SearchIcon = styled.div`
  ${searchBarStyles.searchIcon}
`;
function GoogleMapSearchBar({
  placeDetailOption,
  center,
  getPlaceShowOnMap,
  dispatch,
  addCss,
  placeholder,
}) {
  const ref = useRef();
  const { dispatchNotification } = useContext(Context);

  useEffect(() => {
    if (ref.current) {
      const option = placeDetailOption || googleMap.placesRequestFields;
      const autocomplete = googleMap.initAutocomplete(
        ref.current,
        center,
        option
      );
      autocomplete.addListener('place_changed', () => {
        try {
          const place = googleMap.composePlaceDetailData(
            autocomplete.getPlace()
          );
          if (place.geometry && place.name) {
            if (getPlaceShowOnMap) {
              getPlaceShowOnMap(place);
            } else if (dispatch) {
              dispatch(place);
            }
          }
        } catch (error) {
          dispatchNotification({
            type: 'fire',
            playload: {
              type: 'warn',
              message: '找不到相符的景點',
              id: 'toastify_invalid',
            },
          });
        }
      });
    }
  }, []);

  return (
    <Container css={addCss?.container}>
      <SearchInput
        css={addCss?.input}
        onFocus={(e) => e.target.select()}
        ref={ref}
        placeholder={placeholder}
      />
      <SearchIcon className="material-icons">search</SearchIcon>
    </Container>
  );
}
GoogleMapSearchBar.propTypes = {
  placeDetailOption: PropTypes.object,
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  getPlaceShowOnMap: PropTypes.func,
  dispatch: PropTypes.func,
  addCss: PropTypes.object,
  placeholder: PropTypes.string,
};
export default GoogleMapSearchBar;
