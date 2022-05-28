/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { SelectSmall } from '../styledComponents/Form';

function ItinerarySelector({
  choseItinerary,
  onChangeItinerary,
  createdItineraries,
}) {
  return (
    <SelectSmall
      addCss={css`
        flex-basis: fit-content;
      `}
      value={choseItinerary}
      onChange={(e) => onChangeItinerary(e)}>
      <option value="" disabled>
        ---選擇要加入景點的行程---
      </option>
      <option value="add">建立一個新行程</option>
      {createdItineraries?.map((itinerary) => (
        <option key={itinerary.itinerary_id} value={itinerary.itinerary_id}>
          {itinerary.title}
        </option>
      ))}
    </SelectSmall>
  );
}

ItinerarySelector.propTypes = {
  choseItinerary: PropTypes.string,
  onChangeItinerary: PropTypes.func,
  createdItineraries: PropTypes.array,
};

export default ItinerarySelector;
