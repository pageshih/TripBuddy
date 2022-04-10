import { Outlet, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { firestore } from '../utils/firebase';

function UserProfile() {
  const { uid } = useParams();
  const [profile, setProfile] = useState();
  useEffect(() => {
    if (uid) {
      firestore.getProfile(uid).then((res) => setProfile(res));
    }
  }, [uid]);
  return (
    <>
      {profile && (
        <>
          <img src={profile.photo} alt="profilePhoto" />
          <p>你好，{profile.name}</p>
          <Outlet />
        </>
      )}
    </>
  );
}

export default UserProfile;
