import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import Itineraries from './components/Itineraries';
import SavedSpots from './components/SavedSpots';
import TravelJournals from './components/TravelJournals';
import Explore from './components/Explore';
import AddItinerary from './components/AddItinerary';
import TravelJournalDetail from './components/TravelJournalDetail';

function App() {
  return (
    <Routes>
      <Route path="/:uid" element={<UserProfile />}>
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
  );
}

export default App;
