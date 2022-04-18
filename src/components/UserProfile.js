import { Outlet, NavLink } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { firebaseAuth, firestore } from '../utils/firebase';
import { Context } from '../App';
import { FlexDiv } from './styledComponents/Layout';
import { Button } from './styledComponents/Button';

const ProfileImg = styled.img`
  border-radius: 50%;
  width: ${(props) => props.size || 'auto'};
  height: ${(props) => props.size || 'auto'};
`;
const activeStyle = (isActive) => {
  return { color: isActive ? 'blue' : 'black' };
};

function UserProfile(props) {
  const { uid, setUid } = useContext(Context);
  const [profile, setProfile] = useState();
  const logout = () => {
    firebaseAuth
      .userSignOut()
      .then(() => {
        alert('logout');
        setUid(undefined);
        props.setIsLogOut(true);
      })
      .catch((res) => console.log(res));
  };
  useEffect(() => {
    if (uid) {
      firestore
        .getProfile(uid)
        .then((res) => setProfile(res))
        .catch((res) => console.log(res.code, res.message));
    }
  }, [uid, setUid]);
  return (
    <>
      {profile && (
        <>
          <FlexDiv alignItems="center" gap="10px">
            <ProfileImg src={profile.photo} alt="profilePhoto" size="48px" />
            <p>你好，{profile.name}</p>
            <Button marginLeft="auto" primary onClick={logout}>
              登出
            </Button>
          </FlexDiv>
          <FlexDiv gap="10px">
            <NavLink
              style={({ isActive }) => {
                return activeStyle(isActive);
              }}
              to={`/itineraries`}>
              我的行程
            </NavLink>
            <NavLink
              style={({ isActive }) => {
                return activeStyle(isActive);
              }}
              to={`/saved-spots`}>
              候補景點
            </NavLink>
            <NavLink
              style={({ isActive }) => {
                return activeStyle(isActive);
              }}
              to={`/travel-journals`}>
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
