import { Link } from 'react-router-dom';

function TravelJournals() {
  return (
    <>
      <h1>TravelJournal</h1>
      <Link to={`/travel-journals/12345`}>journalID</Link>
    </>
  );
}

export default TravelJournals;
