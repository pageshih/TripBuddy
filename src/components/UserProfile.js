import { Outlet, useParams, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { firestore } from '../utils/firebase';
import { FlexDiv } from '../utils/Layout';

const ProfileImg = styled.img`
  border-radius: 50%;
  width: ${(props) => props.size || 'auto'};
  height: ${(props) => props.size || 'auto'};
`;
const activeStyle = (isActive) => {
  return { color: isActive ? 'blue' : 'black' };
};

function UserProfile() {
  const { uid } = useParams();
  const [profile, setProfile] = useState();
  useEffect(() => {
    if (uid) {
      firestore
        .getProfile(uid)
        .then((res) => setProfile(res))
        .catch((res) => console.log(res.code, res.message));
    }
  }, [uid]);
  return (
    <>
      {profile && (
        <>
          <FlexDiv alignItems="center" gap="10px">
            <ProfileImg src={profile.photo} alt="profilePhoto" size="48px" />
            <p>你好，{profile.name}</p>
          </FlexDiv>
          <FlexDiv gap="10px">
            <NavLink
              style={({ isActive }) => {
                return activeStyle(isActive);
              }}
              to={`/${uid}/itineraries`}>
              我的行程
            </NavLink>
            <NavLink
              style={({ isActive }) => {
                return activeStyle(isActive);
              }}
              to={`/${uid}/saved-spots`}>
              候補景點
            </NavLink>
            <NavLink
              style={({ isActive }) => {
                return activeStyle(isActive);
              }}
              to={`/${uid}/travel-journals`}>
              我的遊記
            </NavLink>
          </FlexDiv>
          <Outlet />
        </>
      )}
    </>
  );
}

export default UserProfile;
