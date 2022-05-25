import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import {
  createContext,
  useState,
  useEffect,
  useReducer,
  useContext,
} from 'react';
import { Global, css } from '@emotion/react';
import { firebaseAuth } from './utils/firebase';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import Itineraries from './components/Itineraries';
import SavedSpots from './components/SavedSpots';
import TravelJournals from './components/TravelJournals';
import Explore from './components/Explore';
import AddOverview from './components/EditItinerary/AddOverview';
import NotFound from './components/404';
import TravelJournalDetail from './components/TravelJournalDetail';
import AddSchedule from './components/EditItinerary/AddSchedule';
import { EmptyMap } from './utils/googleMap';
import { palatte, Loader } from './components/styledComponents/basic/common';
import { FlexDiv } from './components/styledComponents/Layout';
import {
  defaultNotification,
  notificationReducer,
  Notification,
} from './components/styledComponents/Notification';
import { Alert, Confirm } from './components/styledComponents/Modal';

const Context = createContext();

const LoginOrPage = (props) => {
  const { uid, goLogin, setGoLogin, isLogInOut } = useContext(Context);
  useEffect(() => {
    if (uid) {
      setGoLogin(false);
    } else if (uid === '') {
      setGoLogin(true);
    }
  }, [uid]);
  return (
    <>
      {goLogin && !isLogInOut ? (
        <Navigate to="/login" replace={true} />
      ) : goLogin !== undefined ? (
        props.element
      ) : (
        <FlexDiv justifyContent="center" padding="100px 0">
          <Loader />
        </FlexDiv>
      )}
    </>
  );
};

const cssReset = css`
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
  @import url('https://fonts.googleapis.com/css2?family=Caveat&family=Noto+Sans+TC:wght@400;500;700&display=swap');
  * {
    box-sizing: border-box;
    font-family: 'Noto Sans TC', sans-serif;
    &::selection {
      background-color: rgba(160, 233, 211, 0.6);
    }
  }
  body {
    margin: 0;
  }
  button {
    border: none;
    cursor: pointer;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  ul,
  li,
  a,
  select,
  input,
  option {
    margin: 0;
    color: ${palatte.dark};
  }
`;

function App() {
  const [uid, setUid] = useState();
  const [waitingSpots, setWaitingSpots] = useState();
  const [goLogin, setGoLogin] = useState();
  const [isLogInOut, setIsLogInOut] = useState();
  const [map, setMap] = useState();
  const [notification, dispatchNotification] = useReducer(
    notificationReducer,
    defaultNotification
  );

  useEffect(() => {
    if (isLogInOut === undefined) {
      firebaseAuth.checkIsLogIn(
        (userImpl) => {
          if (userImpl) {
            setUid(userImpl.uid);
          } else {
            setUid('');
          }
        },
        (error) => console.error(error)
      );
    }
  }, [uid, setUid, isLogInOut]);

  return (
    <>
      <Global styles={cssReset} />
      <Context.Provider
        value={{
          uid,
          setUid,
          map,
          setMap,
          goLogin,
          setGoLogin,
          isLogInOut,
          setIsLogInOut,
          dispatchNotification,
          notification,
        }}>
        <EmptyMap libraries={['places']} />
        <Notification />
        <Alert />
        <Confirm />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/itineraries" replace />} />
            <Route path="" element={<LoginOrPage element={<UserProfile />} />}>
              <Route path="/itineraries" element={<Itineraries />} />
              <Route
                path="/saved-spots"
                element={<SavedSpots setWaitingSpots={setWaitingSpots} />}
              />
              <Route
                path="/travel-journals"
                element={<TravelJournals />}></Route>
            </Route>
            <Route path="/login" element={<Login />} />

            <Route
              path="/explore"
              element={
                <LoginOrPage
                  element={<Explore setWaitingSpots={setWaitingSpots} />}
                />
              }
            />
            <Route
              path="/add"
              element={
                <LoginOrPage
                  element={
                    <AddOverview
                      waitingSpots={waitingSpots}
                      setWaitingSpots={setWaitingSpots}
                    />
                  }
                />
              }
            />
            <Route
              path="/add/:itineraryId"
              element={<LoginOrPage element={<AddSchedule isAllowEdit />} />}
            />
            <Route
              path="/itinerary/:itineraryId"
              element={<LoginOrPage element={<AddSchedule />} />}
            />
            <Route
              path="/travel-journals/:journalID"
              element={<LoginOrPage element={<TravelJournalDetail />} />}
            />
            <Route path="error" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/itineraries" replace />} />
          </Routes>
        </BrowserRouter>
      </Context.Provider>
    </>
  );
}

export { App, Context };
