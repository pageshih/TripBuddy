import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { createContext, useState, useEffect } from 'react';
import { Global, css } from '@emotion/react';
import { firebaseAuth } from './utils/firebase';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import Itineraries from './components/Itineraries';
import SavedSpots from './components/SavedSpots';
import TravelJournals from './components/TravelJournals';
import Explore from './components/Explore';
import {
  AddItinerary,
  AddOverView,
  AddSchedule,
} from './components/AddItinerary';
import NotFound from './components/404';
import TravelJournalDetail from './components/TravelJournalDetail';
import { EmptyMap } from './utils/googleMap';
import { palatte, Loader } from './components/styledComponents/basicStyle';
import { FlexDiv } from './components/styledComponents/Layout';

const Context = createContext();

const LoginOrPage = (props) => {
  useEffect(() => {
    if (props.goLogin && !props.isLogInOut) {
      alert('請先登入');
    }
  }, []);
  return (
    <>
      {props.goLogin ? (
        <Navigate to="/login" replace={true} />
      ) : props.goLogin !== undefined ? (
        props.element
      ) : (
        <FlexDiv justifyContent="center" padding="100px 0">
          <Loader />
        </FlexDiv>
      )}
    </>
  );
};

function App() {
  const [uid, setUid] = useState();
  const [waitingSpots, setWaitingSpots] = useState();
  const [goLogin, setGoLogin] = useState();
  const [isLogInOut, setIsLogInOut] = useState();
  const [map, setMap] = useState();
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

  useEffect(() => {
    if (uid) {
      console.log(uid);
    } else if (isLogInOut === undefined) {
      firebaseAuth.checkIsLogIn(
        (userImpl) => {
          if (userImpl) {
            setUid(userImpl.uid);
            setGoLogin(false);
          } else {
            setGoLogin(true);
          }
        },
        (error) => console.log(error)
      );
    }
  }, [uid, setUid]);

  return (
    <>
      <Global styles={cssReset} />
      <Context.Provider value={{ uid, setUid, map, setMap }}>
        <EmptyMap libraries={['places']} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/itineraries" replace />} />
            <Route
              path=""
              element={
                <LoginOrPage
                  goLogin={goLogin}
                  isLogInOut={isLogInOut}
                  element={<UserProfile setIsLogInOut={setIsLogInOut} />}
                />
              }>
              <Route path="/itineraries" element={<Itineraries />} />
              <Route
                path="/saved-spots"
                element={<SavedSpots setWaitingSpots={setWaitingSpots} />}
              />
              <Route
                path="/travel-journals"
                element={<TravelJournals />}></Route>
            </Route>
            <Route
              path="/login"
              element={<Login setIsLogInOut={setIsLogInOut} />}
            />

            <Route
              path="/explore"
              element={
                <LoginOrPage
                  goLogin={goLogin}
                  isLogInOut={isLogInOut}
                  element={<Explore setWaitingSpots={setWaitingSpots} />}
                />
              }
            />
            <Route
              path="/add"
              element={
                <LoginOrPage
                  goLogin={goLogin}
                  isLogInOut={isLogInOut}
                  element={
                    <AddOverView
                      waitingSpots={waitingSpots}
                      setWaitingSpots={setWaitingSpots}
                    />
                  }
                />
              }
            />
            <Route
              path="/add/:itineraryId"
              element={
                <LoginOrPage
                  goLogin={goLogin}
                  isLogInOut={isLogInOut}
                  element={<AddSchedule />}
                />
              }
            />
            <Route
              path="/itinerary/:itineraryId"
              element={
                <LoginOrPage
                  goLogin={goLogin}
                  isLogInOut={isLogInOut}
                  element={<AddSchedule browse />}
                />
              }
            />
            <Route
              path="/travel-journals/:journalID"
              element={
                <LoginOrPage
                  goLogin={goLogin}
                  isLogInOut={isLogInOut}
                  element={<TravelJournalDetail />}
                />
              }
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
