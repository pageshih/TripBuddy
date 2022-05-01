import { Outlet, NavLink } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { firebaseAuth, firestore } from '../utils/firebase';
import { Context } from '../App';
import { FlexDiv, Container, FlexChildDiv } from './styledComponents/Layout';
import { ButtonSmall, RoundButtonSmall } from './styledComponents/Button';
import {
  Logo,
  styles,
  palatte,
  mediaQuery,
} from './styledComponents/basicStyle';

const ProfileImg = styled.img`
  border-radius: 50%;
  width: 48px;
  height: 48px;
  box-shadow: ${styles.shadow};
`;
const activeStyle = (isActive) => {
  return {
    backgroundColor: isActive && palatte.primary.basic,
  };
};

function UserProfile(props) {
  const { uid, setUid } = useContext(Context);
  const [profile, setProfile] = useState();
  const [reviewTags, setReviewTags] = useState();
  const logout = () => {
    firebaseAuth
      .userSignOut()
      .then(() => {
        alert('您已登出');
        props.setIsLogInOut(true);
        setUid(undefined);
      })
      .catch((res) => console.log(res));
  };
  useEffect(() => {
    if (uid) {
      firestore
        .getProfile(uid)
        .then((res) => {
          setProfile(res);
          setReviewTags(res.reviews);
        })
        .catch((error) => console.error(error));
    }
  }, [uid, setUid]);
  const userProfileWrapper = css`
    border-radius: 30px;
    padding: 30px 25px 30px 30px;
    background-color: ${palatte.secondary.basic};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    box-shadow: ${styles.shadow};
  `;
  const decoOfPage = css`
    width: 100%;
    height: 60px;
    background-color: ${palatte.white};
    border-radius: 30px 30px 0 0;
    box-shadow: 0px -2px 2px 2px ${palatte.shadow};
  `;
  const navLink = css`
    font-size: 20px;
    padding: 10px 20px;
    border-radius: 10px 10px 0 0;
    color: ${palatte.white};
    text-decoration: none;
    background-color: ${palatte.gray['400']};
    box-shadow: 0px -2px 2px 2px ${palatte.shadow};
  `;
  return (
    <>
      {profile && (
        <>
          <Container
            padding="80px 2px 0px 2px"
            backgroundColor={palatte.secondary['100']}
            mediaQuery={css`
              padding: 14px 0px 0px 0px;
            `}>
            <FlexDiv
              direction="column"
              gap="25px"
              maxWidth="1090px"
              margin="0 auto"
              padding="0 20px"
              mediaQuery={css`
                padding: 14px 20px 14px 40px;
              `}>
              <FlexDiv justifyContent="space-between" alignItems="flex-start">
                <Logo underline mediaQuery="small" />
                <div css={userProfileWrapper}>
                  <FlexChildDiv gap="20px" alignItems="center">
                    <ProfileImg src={profile.photo} alt="profilePhoto" />
                    <p
                      css={css`
                        white-space: nowrap;
                      `}>
                      你好，{profile.name}
                    </p>
                  </FlexChildDiv>
                  <FlexDiv alignItems="center" gap="10px">
                    <ButtonSmall styled="danger" onClick={logout}>
                      登出
                    </ButtonSmall>
                    <RoundButtonSmall className="material-icons">
                      settings
                    </RoundButtonSmall>
                  </FlexDiv>
                </div>
              </FlexDiv>
              <FlexDiv
                gap="15px"
                mediaQuery={css`
                  position: fixed;
                  bottom: 0;
                `}>
                <NavLink
                  css={navLink}
                  style={({ isActive }) => {
                    return activeStyle(isActive);
                  }}
                  to={`/itineraries`}>
                  我的行程
                </NavLink>
                <NavLink
                  css={navLink}
                  style={({ isActive }) => {
                    return activeStyle(isActive);
                  }}
                  to={`/saved-spots`}>
                  候補景點
                </NavLink>
                <NavLink
                  css={navLink}
                  style={({ isActive }) => {
                    return activeStyle(isActive);
                  }}
                  to={`/travel-journals`}>
                  我的遊記
                </NavLink>
              </FlexDiv>
            </FlexDiv>
            <div css={decoOfPage}></div>
          </Container>
          <Outlet context={{ reviewTags }} />
        </>
      )}
    </>
  );
}

export default UserProfile;
