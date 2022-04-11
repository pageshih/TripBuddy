import { useContext, useEffect, useState } from 'react';
import { UidContext } from '../App';
import { RoundButton } from '../utils/Button';

function Explore() {
  const { uid, setUid } = useContext(UidContext);
  return (
    <>
      <RoundButton size="48px">候補</RoundButton>
      <h1>Explore</h1>
    </>
  );
}

export default Explore;
