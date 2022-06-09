import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import {
  Settings,
  EventNote,
  Explore,
  AddLocation,
  Article,
} from '@mui/icons-material';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import defaultUserIcon from '../images/user-avatar-filled.svg';
import { firebaseAuth, firestore } from '../utils/firebase';
import { Context } from '../App';
import { Image } from './styledComponents/Layout';
import { ButtonSmall } from './styledComponents/Buttons/Button';
import { RoundButtonSmall } from './styledComponents/Buttons/RoundButton';
import { styles, palatte, mediaQuery } from './styledComponents/basic/common';
import { Logo } from './styledComponents/basic/Logo';
import { P } from './styledComponents/basic/Text';
import UserSetting from './UserProfile/UserSetting';
import Footer from './styledComponents/Footer';

const activeStyle = (isActive) => {
  return {
    backgroundColor: isActive && palatte.primary.basic,
  };
};

const UserProfileCardWrapper = styled.div`
  border-radius: 30px;
  padding: 25px 20px 25px 25px;
  background-color: ${palatte.secondary.basic};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  box-shadow: ${styles.shadow};
  ${mediaQuery[0]} {
    background-color: transparent;
    box-shadow: none;
    padding: 0;
  }
`;
const DecoOfPage = styled.div`
  width: 100%;
  height: 60px;
  background-color: ${palatte.white};
  border-radius: 30px 30px 0 0;
  box-shadow: 0px -2px 2px 2px ${palatte.shadow};
`;
const NavTag = styled(NavLink)`
  font-size: 18px;
  padding: 10px 20px;
  border-radius: 10px 10px 0 0;
  color: ${palatte.white};
  text-decoration: none;
  background-color: ${palatte.gray['400']};
  box-shadow: 0px -2px 2px 2px ${palatte.shadow};
  span {
    display: none;
  }
  ${mediaQuery[0]} {
    font-size: 14px;
    padding: 10px;
    flex-grow: 1;
    display: block;
    border-radius: 0;
    box-shadow: none;
    text-align: center;
    border-right: 1px solid ${palatte.gray['100']};
    span {
      display: block;
      color: ${palatte.white};
      text-align: center;
    }
  }
`;

const Container = styled.div`
  min-height: calc(100vh - 50px);
`;
const TopAreaContainer = styled.div`
  padding: 80px 2px 0px 2px;
  background-color: ${palatte.secondary['100']};
  overflow: hidden;
  ${mediaQuery[0]} {
    padding: 14px 0px 0px 0px;
  }
`;
const UserProfileContainer = styled.div`
  ${styles.flexColumn};
  gap: 25px;
  max-width: ${styles.container_maxWidth};
  margin: 0 auto;
  padding: ${`0 ${styles.container_padding}`};
  ${mediaQuery[0]} {
    padding: 14px 20px 14px 40px;
  }
`;
const InfoContainer = styled.div`
  ${styles.flex}
  justify-content: space-between;
  align-items: flex-start;
  ${mediaQuery[0]} {
    align-items: center;
  }
`;
const UserInfoWrapper = styled.div`
  ${styles.flex}
  gap: 20px;
  align-items: center;
  ${mediaQuery[0]} {
    display: none;
  }
`;
const UserInfoImage = ({ userPhoto }) => (
  <Image
    round
    size="60px"
    addCss={css`
      box-shadow: 2px 2px 1px 1px ${palatte.shadow};
      border: 1px solid ${palatte.gray['100']};
      background-color: ${!userPhoto ? palatte.secondary[100] : null};
    `}
    src={userPhoto || defaultUserIcon}
    alt="profilePhoto"
  />
);
UserInfoImage.propTypes = {
  userPhoto: PropTypes.string,
};
const UserInfoButtonWrapper = styled.div`
  ${styles.flex}
  align-items:center;
  gap: 10px;
`;
const NavWrapper = styled.div`
  ${styles.flex}
  gap:15px;
  ${mediaQuery[0]} {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    gap: 0;
    z-index: 10;
  }
`;
function UserProfile() {
  const { uid, setGoLogin, setIsLogInOut } = useContext(Context);
  const [profile, setProfile] = useState();
  const [reviewTags, setReviewTags] = useState();
  const [isShowSetting, setIsShowSetting] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    if (uid) {
      firestore
        .getProfile(uid)
        .then((res) => {
          setReviewTags(res.review_tags);
          delete res.review_tags;
          setProfile(res);
        })
        .catch((error) => console.error(error));
    }
  }, [uid]);

  const logout = () => {
    firebaseAuth
      .userSignOut()
      .then(() => {
        setGoLogin(false);
        setIsLogInOut(true);
        navigate('/login');
      })
      .catch((error) => console.error(error));
  };

  return (
    <>
      {profile && (
        <>
          <Container>
            <UserSetting
              setIsShowSetting={setIsShowSetting}
              setProfile={setProfile}
              profile={profile}
              reviewTags={reviewTags}
              setReviewTags={setReviewTags}
              isShowState={isShowSetting}
            />
            <TopAreaContainer>
              <UserProfileContainer>
                <InfoContainer>
                  <Logo
                    underline
                    addCss={css`
                      ${mediaQuery[0]} {
                        display: none;
                      }
                    `}
                  />
                  <Logo
                    small
                    addCss={css`
                      display: none;
                      ${mediaQuery[0]} {
                        display: flex;
                      }
                    `}
                  />
                  <UserProfileCardWrapper>
                    <UserInfoWrapper>
                      <div
                        css={css`
                          position: relative;
                        `}>
                        <UserInfoImage userPhoto={profile.photo} />
                      </div>
                      <P
                        css={css`
                          white-space: nowrap;
                          cursor: default;
                        `}>
                        你好，{profile.name}
                      </P>
                    </UserInfoWrapper>
                    <UserInfoButtonWrapper>
                      <ButtonSmall styled="danger" onClick={logout}>
                        登出
                      </ButtonSmall>
                      <RoundButtonSmall onClick={() => setIsShowSetting(true)}>
                        <Settings />
                      </RoundButtonSmall>
                    </UserInfoButtonWrapper>
                  </UserProfileCardWrapper>
                </InfoContainer>
                <NavWrapper>
                  <NavTag
                    style={({ isActive }) => {
                      return activeStyle(isActive);
                    }}
                    to={`/itineraries`}>
                    <span>
                      <EventNote sx={{ fontSize: 32 }} />
                    </span>
                    所有行程
                  </NavTag>
                  <NavTag
                    css={css`
                      display: none;
                    `}
                    style={({ isActive }) => {
                      return activeStyle(isActive);
                    }}
                    to={`/explore`}>
                    <span>
                      <Explore sx={{ fontSize: 32 }} />
                    </span>
                    探索景點
                  </NavTag>
                  <NavTag
                    style={({ isActive }) => {
                      return activeStyle(isActive);
                    }}
                    to={`/saved-spots`}>
                    <span>
                      <AddLocation sx={{ fontSize: 32 }} />
                    </span>
                    候補景點
                  </NavTag>
                  <NavTag
                    style={({ isActive }) => {
                      return activeStyle(isActive);
                    }}
                    to={`/travel-journals`}>
                    <span>
                      <Article sx={{ fontSize: 32 }} />
                    </span>
                    旅行回憶
                  </NavTag>
                </NavWrapper>
              </UserProfileContainer>
              <DecoOfPage />
            </TopAreaContainer>

            <Outlet context={{ reviewTags }} />
          </Container>
          {uid !== undefined && <Footer />}
        </>
      )}
    </>
  );
}

export default UserProfile;
