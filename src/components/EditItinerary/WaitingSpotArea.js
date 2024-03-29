import { useState, useEffect } from 'react';
import { Explore, Cancel } from '@mui/icons-material';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import PropTypes from 'prop-types';
import {
  mediaQuery,
  palatte,
  breakpoints,
  styles,
} from '../styledComponents/basic/common';
import { H6, P } from '../styledComponents/basic/Text';
import { ButtonSmallIcon } from '../styledComponents/Buttons/Button';
import { SpotCard } from '../styledComponents/Cards/SpotCard';
import { ImportContacts } from '@mui/icons-material';

const WaitingSpotContainer = styled.div`
  ${styles.flexColumn};
  padding: 20px;
  background-color: ${palatte.gray[100]};
  gap: 20px;
  position: fixed;
  right: 0;
  height: 100vh;
  width: 340px;
  ${mediaQuery[0]} {
    height: 40vh;
    width: 100%;
    bottom: 0;
    z-index: 5;
    box-shadow: 0 -2px 2px 2px ${palatte.shadow};
    gap: 10px;
  }
`;
const HeaderContainer = styled.div`
  ${styles.flex}
  justify-content: space-between;
  align-items: center;
`;
const HeaderButtonContainer = styled.div`
  ${styles.flex}
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
`;

const SpotsArea = styled.div`
  ${styles.flexColumn}
  flex-grow: 1;
  gap: 20px;
  padding: 10px;
  max-width: 300px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  ${mediaQuery[0]} {
    flex-direction: row;
    overflow-y: initial;
    overflow-x: auto;
    max-width: 100%;
  }
  background-color: ${(props) =>
    props.isDraggingOver ? palatte.gray[300] : null};
`;

const iconButtonColorMap = {
  danger: {
    color: palatte.danger.basic,
    hoverColor: palatte.danger[400],
  },
  primary: {
    color: palatte.primary.basic,
    hoverColor: palatte.primary[800],
  },
};

const ButtonIconColumn = ({
  type,
  onClick,
  styled,
  children,
  size,
  iconName: Icon,
}) => (
  <ButtonSmallIcon
    styled="transparent"
    type={type}
    onClick={onClick}
    addCss={css`
      padding: 0;
      width: fit-content;
      flex-direction: column;
      align-items: center;
      gap: 0px;
      & > * {
        color: ${iconButtonColorMap[styled].color};
      }
      &:hover {
        background-color: transparent;
        box-shadow: none;
        & > * {
          color: ${iconButtonColorMap[styled].hoverColor};
        }
      }
      ${mediaQuery[0]} {
        flex-direction: row;
        gap: 5px;
      }
    `}
    title={children}>
    <Icon
      sx={{
        fontSize: size,
      }}
    />
    <P fontSize={`calc(${size || '24px'} - 12px)`}>{children}</P>
  </ButtonSmallIcon>
);

const SpotCardDraggable = ({ id, index, deleteSpot, spot }) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          css={css`
            min-width: 90%;
          `}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          <SpotCard
            isSmall
            isShowCloseBtn
            onDeleteClick={() => deleteSpot(id)}
            id={id}
            imgSrc={spot.photos[0]}
            imgAlt={spot.name}
            title={spot.name}
            address={spot.formatted_address}
            rating={spot.rating}
            addCss={css`
              width: ${snapshot.isDragging ? '300px' : null};
              cursor: grab;
            `}
          />
        </div>
      )}
    </Draggable>
  );
};
SpotCardDraggable.propsTypes = {
  id: PropTypes.string,
  index: PropTypes.number,
  deleteSpot: PropTypes.func,
  spot: PropTypes.object,
  spotWithShape: PropTypes.shape({
    photos: PropTypes.array,
    name: PropTypes.string,
    formatted_address: PropTypes.string,
    rating: PropTypes.number,
  }),
};

function WaitingSpotArea({
  addSpotAction,
  closeAction,
  waitingSpots,
  deleteSpot,
}) {
  const [isMobile, setIsMobile] = useState();
  useEffect(() => {
    const checkWindowSize = () => {
      if (window.innerWidth < breakpoints[0]) setIsMobile(true);
    };
    checkWindowSize();
    window.addEventListener('resize', checkWindowSize);
    return () => {
      window.removeEventListener('resize', checkWindowSize);
    };
  }, []);
  return (
    <WaitingSpotContainer>
      <HeaderContainer>
        <H6
          css={css`
            font-size: 22px;
          `}>
          待定景點
        </H6>
        <HeaderButtonContainer>
          <ButtonIconColumn
            type="button"
            styled="primary"
            iconName={Explore}
            onClick={addSpotAction}>
            新增景點
          </ButtonIconColumn>
          <ButtonIconColumn
            type="button"
            styled="danger"
            iconName={Cancel}
            onClick={closeAction}>
            結束編輯
          </ButtonIconColumn>
        </HeaderButtonContainer>
      </HeaderContainer>
      <Droppable
        droppableId="waitingSpotsArea"
        direction={isMobile && 'horizontal'}>
        {(provided, snapshot) => (
          <SpotsArea
            isDraggingOver={snapshot.isDraggingOver}
            ref={provided.innerRef}
            {...provided.droppableProps}>
            {waitingSpots?.map((spot, index) => (
              <SpotCardDraggable
                spot={spot}
                key={spot.place_id}
                index={index}
                id={spot.place_id}
                deleteSpot={deleteSpot}
              />
            ))}
            {provided.placeholder}
          </SpotsArea>
        )}
      </Droppable>
    </WaitingSpotContainer>
  );
}

export default WaitingSpotArea;
