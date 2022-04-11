import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { createContext, useState } from 'react';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import Itineraries from './components/Itineraries';
import SavedSpots from './components/SavedSpots';
import TravelJournals from './components/TravelJournals';
import Explore from './components/Explore';
import AddItinerary from './components/AddItinerary';
import TravelJournalDetail from './components/TravelJournalDetail';

const UidContext = createContext();

function App() {
  const [uid, setUid] = useState();
  return (
    <UidContext.Provider value={{ uid, setUid }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserProfile />}>
            <Route path="itineraries" element={<Itineraries />} />
            <Route path="saved-spots" element={<SavedSpots />} />
            <Route path="travel-journals" element={<TravelJournals />}></Route>
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/add" element={<AddItinerary />} />
          <Route
            path="/travel-journals/:journalID"
            element={<TravelJournalDetail />}
          />
        </Routes>
      </BrowserRouter>
    </UidContext.Provider>
  );
}

export { App, UidContext };
