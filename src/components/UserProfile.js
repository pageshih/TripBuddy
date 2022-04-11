import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { firebaseAuth, firestore } from '../utils/firebase';
import { UidContext } from '../App';
import { FlexDiv } from '../utils/Layout';
import { Button } from '../utils/Button';

const ProfileImg = styled.img`
  border-radius: 50%;
  width: ${(props) => props.size || 'auto'};
  height: ${(props) => props.size || 'auto'};
`;
const activeStyle = (isActive) => {
  return { color: isActive ? 'blue' : 'black' };
};

function UserProfile() {
  const { uid, setUid } = useContext(UidContext);
  const [profile, setProfile] = useState();
  const navigate = useNavigate();
  const logout = () => {
    firebaseAuth
      .userSignOut()
      .then(() => {
        alert('logout');
        setUid(undefined);
        navigate('/login');
      })
      .catch((res) => console.log(res));
  };
  useEffect(() => {
    if (uid) {
      firestore
        .getProfile(uid)
        .then((res) => setProfile(res))
        .catch((res) => console.log(res.code, res.message));
    } else {
      firebaseAuth.checkIsLogIn(
        (userImpl) => {
          setUid(userImpl.uid);
        },
        (error) => console.log(error)
      );
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
