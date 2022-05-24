import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { mediaQuery, styles } from '../styledComponents/basic/common';
import { timestampToString } from '../../utils/utilities';
import { SelectAllCheckBox, SelectSmall } from '../styledComponents/Form';
import { TooltipNotification } from '../styledComponents/Notification';
import { ButtonSmall } from '../styledComponents/Button';

const Container = styled.div`
  ${styles.flex};
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  ${mediaQuery[0]} {
    justify-content: space-between;
    flex-wrap: wrap;
    width: 100%;
  }
`;
const OptionWrapper = styled.div`
  ${styles.flex};
  gap: 20px;
  align-items: center;
  ${mediaQuery[0]} {
    gap: 10px;
  }
`;
function MoveScheduleController({
  selectedSchedulesId,
  setSelectedSchedulesId,
  departTimes,
  day,
  schedules,
  changeSchedulesTime,
}) {
  const [changeTime, setChangeTime] = useState('');
  const [isSelectAll, setIsSelectAll] = useState(false);
  useEffect(() => {
    if (
      selectedSchedulesId?.length === schedules?.length &&
      selectedSchedulesId?.length !== 0
    ) {
      setIsSelectAll(true);
    } else {
      setIsSelectAll(false);
    }
  }, [selectedSchedulesId, schedules]);
  useEffect(() => {
    setIsSelectAll(false);
    setSelectedSchedulesId([]);
  }, [day, setSelectedSchedulesId]);

  return (
    <Container>
      <SelectAllCheckBox
        setAllChecked={() =>
          setSelectedSchedulesId(
            schedules.map((schedule) => schedule.schedule_id)
          )
        }
        setAllUnchecked={() => setSelectedSchedulesId([])}
        isSelectAll={isSelectAll}
        setIsSelectAll={setIsSelectAll}
      />
      <OptionWrapper>
        <SelectSmall
          addCss={css`
            width: fit-content;
          `}
          value={changeTime}
          onChange={(e) => setChangeTime(Number(e.target.value))}>
          <option value="" disabled>
            修改所選行程的日期
          </option>
          {departTimes
            ?.filter((time) => time !== departTimes[day])
            .map((timestamp) => (
              <option value={timestamp} key={timestamp}>
                {timestampToString(timestamp, 'date')}
              </option>
            ))}
        </SelectSmall>
        <TooltipNotification id="changeDay">
          <ButtonSmall
            styled="primary"
            padding="5px 15px"
            type="button"
            onClick={() => changeSchedulesTime(changeTime)}>
            移動行程
          </ButtonSmall>
        </TooltipNotification>
      </OptionWrapper>
    </Container>
  );
}

MoveScheduleController.propTypes = {
  selectedSchedulesId: PropTypes.array,
  setSelectedSchedulesId: PropTypes.func,
  departTimes: PropTypes.array,
  day: PropTypes.number,
  schedules: PropTypes.array,
  changeSchedulesTime: PropTypes.func,
};

export default MoveScheduleController;
