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
import TravelJournalDetail from './components/TravelJournalDetail';

const Context = createContext();

function App() {
  const [uid, setUid] = useState();
  const [waitingSpots, setWaitingSpots] = useState();
  const [goLogin, setGoLogin] = useState();
  const [isLogInOut, setIsLogInOut] = useState();
  const cssReset = css`
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
    }
    button {
      border: none;
      cursor: pointer;
      &:hover {
        box-shadow: 1px 1px 3px 1px lightgray;
      }
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
  `;
  const LoginOrPage = (props) => {
    useEffect(() => {
      if (goLogin && !isLogInOut) {
        alert('請先登入');
      }
    }, []);
    return (
      <>
        {goLogin ? (
          <Navigate to="/login" replace={true} />
        ) : goLogin !== undefined ? (
          props.element
        ) : (
          <p>loading...</p>
        )}
      </>
    );
  };
  useEffect(() => {
    if (uid) {
      console.log(uid);
    } else {
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
      <Context.Provider value={{ uid, setUid }}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <LoginOrPage
                  element={<UserProfile setIsLogInOut={setIsLogInOut} />}
                />
              }>
              <Route path="itineraries" element={<Itineraries />} />
              <Route path="saved-spots" element={<SavedSpots />} />
              <Route
                path="travel-journals"
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
                  element={<Explore setWaitingSpots={setWaitingSpots} />}
                />
              }
            />
            <Route path="/add" element={<AddItinerary />}>
              <Route
                path=""
                element={
                  <LoginOrPage
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
                path=":itineraryId"
                element={<LoginOrPage element={<AddSchedule />} />}
              />
            </Route>
            <Route
              path=":itineraryId"
              element={<LoginOrPage element={<AddSchedule browse />} />}
            />
            <Route
              path="/travel-journals/:journalID"
              element={<LoginOrPage element={<TravelJournalDetail />} />}
            />
          </Routes>
        </BrowserRouter>
      </Context.Provider>
    </>
  );
}

export { App, Context };
