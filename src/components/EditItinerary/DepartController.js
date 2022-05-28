import PropTypes from 'prop-types';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { styles, palatte, Loader } from '../styledComponents/basic/common';
import { P } from '../styledComponents/basic/Text';
import { timestampToString } from '../../utils/utilities';
import { EditableDate } from '../styledComponents/EditableText';

const Container = styled.div`
  ${styles.flexColumn};
  gap: 5px;
`;
const HeaderWrapper = styled.div`
  ${styles.flex};
  justify-content: space-between;
  max-width: ${(props) => (props.isAllowEdit ? '200px' : null)};
  & > * {
    color: ${palatte.gray['700']};
  }
`;
function DepartController({ isAllowEdit, departTimes, day, onSubmit }) {
  try {
    return (
      <Container>
        <HeaderWrapper isAllowEdit={isAllowEdit}>
          <P>出發時間</P>
          <P>{timestampToString(departTimes[day], 'simpleDate')}</P>
        </HeaderWrapper>
        <EditableDate
          isTime
          start={departTimes[day]}
          onSubmit={onSubmit}
          isAllowEdit={isAllowEdit}
          width="210px"
          fontSize="46px"
          inputFontSize="32px"
          color={palatte.info.basic}
          addCss={css`
            font-weight: 700;
          `}
        />
      </Container>
    );
  } catch (error) {
    return <Loader />;
  }
}

DepartController.propTypes = {
  isAllowEdit: PropTypes.bool,
  departTimes: PropTypes.array,
  day: PropTypes.number,
  onSubmit: PropTypes.func,
};

export default DepartController;
