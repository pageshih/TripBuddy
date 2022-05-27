import { useContext } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { Context } from '../../App';
import ItinerarySelector from './ItinerarySelector';
import { mediaQuery, palatte, styles } from '../styledComponents/basic/common';
import {
  NotificationText,
  TooltipNotification,
} from '../styledComponents/Notification';
import { ButtonSmall } from '../styledComponents/Buttons/Button';

const common = (props) => css`
  ${styles.flex};
  flex-direction: ${props.isColumn ? 'column' : undefined};
  align-items: ${!props.isColumn ? 'center' : undefined};
  gap: 10px;
  ${mediaQuery[0]} {
    flex-wrap: wrap;
    justify-content: ${!props.isColumn ? 'flex-end' : undefined};
  }
`;
const Container = styled.div`
  ${common}
  padding: 0 0 10px 0;
  position: relative;
`;
const ButtonContainer = styled.div`
  ${common}
  ${mediaQuery[0]} {
    flex-direction: row;
  }
`;

const ShadowBottom = styled.div`
  position: absolute;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0), ${palatte.gray[800]});
  opacity: 0.4;
  width: 100%;
  height: 20px;
  top: -40px;
  ${mediaQuery[0]} {
    display: none;
  }
`;

export function AddSpotToItineraryController({
  createdItineraries,
  choseItinerary,
  onChangeItinerary,
  addAction,
  deleteAction,
  selectedSpots,
  isShowShadow,
  isColumn,
}) {
  const { dispatchNotification, notification } = useContext(Context);
  const ButtonOfController = css`
    ${mediaQuery[0]} {
      flex-grow: ${isColumn ? '1' : undefined};
    }
  `;
  const onClickDelete = () => {
    if (selectedSpots.length > 0) {
      dispatchNotification({
        type: 'fire',
        playload: {
          type: 'danger',
          message: '確定要刪除這些景點嗎？',
          subMessage: '(此動作無法復原）',
          yesAction: async () => {
            await deleteAction();
            dispatchNotification({
              type: 'fire',
              playload: {
                type: 'success',
                message: '景點已刪除',
                id: 'toastify_deleted',
              },
            });
          },
          id: 'confirm_deleteSpots',
        },
      });
    } else {
      dispatchNotification({
        type: 'fire',
        playload: {
          type: 'warn',
          message: '還沒有選擇景點喔！',
          id: 'tooltip_deleteSpots',
        },
      });
    }
  };
  return (
    <Container isColumn={isColumn}>
      {isShowShadow && <ShadowBottom />}
      {notification.fire &&
        notification.id.match('textNotification')?.length > 0 && (
          <NotificationText type={notification.type}>
            {notification.message}
          </NotificationText>
        )}
      <ItinerarySelector
        choseItinerary={choseItinerary}
        onChangeItinerary={(e) => {
          onChangeItinerary(e);
          dispatchNotification({ type: 'close' });
        }}
        createdItineraries={createdItineraries}
      />
      <ButtonContainer isColumn={isColumn}>
        <TooltipNotification id="addSpots" addCss={ButtonOfController}>
          <ButtonSmall styled="primary" onClick={addAction}>
            加入行程
          </ButtonSmall>
        </TooltipNotification>
        <TooltipNotification id="deleteSpots" addCss={ButtonOfController}>
          <ButtonSmall styled="danger" onClick={onClickDelete}>
            刪除景點
          </ButtonSmall>
        </TooltipNotification>
      </ButtonContainer>
    </Container>
  );
}

AddSpotToItineraryController.propTypes = {
  choseItinerary: PropTypes.string,
  onChangeItinerary: PropTypes.func,
  createdItineraries: PropTypes.array,
  addAction: PropTypes.func,
  deleteAction: PropTypes.func,
  selectedSpots: PropTypes.array,
  isShowShadow: PropTypes.bool,
  isColumn: PropTypes.bool,
};
