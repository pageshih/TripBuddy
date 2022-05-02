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
    ${mediaQuery[0]} {
      background-color: transparent;
      box-shadow: none;
      padding: 0;
    }
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
    span {
      display: none;
    }
    ${mediaQuery[0]} {
      flex-grow: 1;
      display: block;
      border-radius: 0;
      box-shadow: none;
      text-align: center;
      border-right: 1px solid ${palatte.gray['100']};
      span {
        display: block;
        font-size: 48px;
        color: ${palatte.white};
        text-align: center;
      }
    }
  `;

  return (
    <>
      {profile && (
        <>
          <Container
            padding="80px 2px 0px 2px"
            backgroundColor={palatte.secondary['100']}
            mediaQuery={css`
              ${mediaQuery[0]} {
                padding: 14px 0px 0px 0px;
              }
            `}>
            <FlexDiv
              direction="column"
              gap="25px"
              maxWidth="1090px"
              margin="0 auto"
              padding="0 20px"
              mediaQuery={css`
                ${mediaQuery[0]} {
                  padding: 14px 20px 14px 40px;
                }
              `}>
              <FlexDiv
                justifyContent="space-between"
                alignItems="flex-start"
                mediaQuery={css`
                  align-items: center;
                `}>
                <Logo
                  underline
                  mediaQuery={css`
                    ${mediaQuery[0]} {
                      display: none;
                    }
                  `}
                />
                <Logo
                  small
                  mediaQuery={css`
                    display: none;
                    ${mediaQuery[0]} {
                      display: flex;
                    }
                  `}
                />
                <div css={userProfileWrapper}>
                  <FlexChildDiv
                    gap="20px"
                    alignItems="center"
                    mediaQuery={css`
                      ${mediaQuery[0]} {
                        display: none;
                      }
                    `}>
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
                  ${mediaQuery[0]} {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    gap: 0;
                    z-index: 10;
                  }
                `}>
                <NavLink
                  css={navLink}
                  style={({ isActive }) => {
                    return activeStyle(isActive);
                  }}
                  to={`/itineraries`}>
                  <span className="material-icons">event_note</span>
                  所有行程
                </NavLink>
                <NavLink
                  css={css`
                    display: none;
                    ${navLink}
                  `}
                  style={({ isActive }) => {
                    return activeStyle(isActive);
                  }}
                  to={`/explore`}>
                  <span className="material-icons">explore</span>
                  探索景點
                </NavLink>
                <NavLink
                  css={navLink}
                  style={({ isActive }) => {
                    return activeStyle(isActive);
                  }}
                  to={`/saved-spots`}>
                  <span className="material-icons">add_location</span>
                  候補景點
                </NavLink>
                <NavLink
                  css={navLink}
                  style={({ isActive }) => {
                    return activeStyle(isActive);
                  }}
                  to={`/travel-journals`}>
                  <span className="material-icons">article</span>
                  旅行回憶
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
