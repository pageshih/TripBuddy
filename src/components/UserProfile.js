import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import defaultUserIcon from '../images/user-avatar-filled.svg';
import { firebaseAuth, firestore, firebaseStorage } from '../utils/firebase';
import { Context } from '../App';
import {
  FlexDiv,
  Container,
  FlexChildDiv,
  Image,
} from './styledComponents/Layout';
import {
  ButtonSmall,
  RoundButtonSmall,
  ReviewTagRemoveButton,
} from './styledComponents/Button';
import { AddImageRoundBtn, TextInput, Select } from './styledComponents/Form';
import { styles, palatte, mediaQuery } from './styledComponents/basic/common';
import { Logo } from './styledComponents/basic/Logo';
import { P, H5, H6 } from './styledComponents/basic/Text';
import { EditableText } from './styledComponents/EditableText';
import { Modal } from './styledComponents/Modal';
import Footer from './styledComponents/Footer';
import { Accordion } from './styledComponents/Accordion';

const activeStyle = (isActive) => {
  return {
    backgroundColor: isActive && palatte.primary.basic,
  };
};
const SettingTitle = (props) => (
  <>
    <H6
      css={css`
        font-size: 20px;
        font-weight: 500;
        color: ${palatte.gray['800']};
      `}>
      {props.title}
    </H6>
    <P
      css={css`
        color: ${palatte.gray['600']};
      `}>
      {props.subTitle}
    </P>
  </>
);
const UserSettingContentContainer = styled.div`
  ${styles.flexColumn};
  padding: 20px 0;
  gap: 20px;
  height: 100%;
`;
const UserProfileWrapper = styled.div`
  ${styles.flex}
  gap: 20px;
  align-items: center;
  padding: 0 0 30px 0;
  border-bottom: 1px solid ${palatte.gray['400']};
`;
const UserProfileTextWrapper = styled.div`
  ${styles.flexColumn}
  gap:8px;
`;
const Title = ({ iconName, children }) => (
  <div
    css={css`
      ${styles.flex}
      align-items: center;
      gap: 5px;
    `}>
    <span
      className="material-icons"
      css={css`
        color: ${palatte.gray['700']};
        margin-top: 4px;
      `}>
      {iconName}
    </span>
    <H5
      css={css`
        font-size: 24px;
        font-weight: 500;
      `}>
      {children}
    </H5>
  </div>
);
const SettingContainer = styled.div`
  ${styles.flexColumn};
  gap: 30px;
  grow: 1;
  overflow-y: auto;
`;
const SettingReviewTagsContainer = styled.div`
  ${styles.flexColumn};
  gap: 15px;
  height: 100%;
`;
const SettingReviewButtonWrapper = styled.div`
  ${styles.flex}
  gap:5px;
  position: absolute;
  right: 12px;
  top: calc(50% - 12px);
`;
const SettingReviewTagsWrapper = styled.div`
  ${styles.flex}
  gap:5px;
  width: 100%;
  flex-wrap: wrap;
`;

const SettingReviewButton = styled(RoundButtonSmall)`
  color: ${palatte.gray['500']};
  &:hover {
    color: ${(props) =>
      props.danger ? palatte.danger.basic : palatte.primary.basic};
  }
`;
function UserSetting({
  profile,
  setProfile,
  isShowState,
  setIsShowSetting,
  reviewTags,
  setReviewTags,
}) {
  const { uid, dispatchNotification } = useContext(Context);
  const [addTag, setAddTag] = useState('');
  const addTagInput = useRef();
  const [travelMode, setTravelMode] = useState();
  const updateProfilePhoto = async (imageBuffer, setIsShowModal) => {
    try {
      const urlAry = await firebaseStorage.uploadImages(
        [uid],
        imageBuffer,
        'profile_photo'
      );
      await firestore.editProfile(uid, { photo: urlAry[0] });
      setProfile({ ...profile, photo: urlAry[0] });
      dispatchNotification({
        type: 'fire',
        playload: {
          type: 'success',
          message: '大頭貼已更新',
          id: 'taostify_update',
        },
      });
      setIsShowModal(false);
    } catch (error) {
      console.error(error);
    }
  };
  const updateUserName = async (value) => {
    await firestore.editProfile(uid, { name: value });
    setProfile({ ...profile, name: value });
  };
  useEffect(() => {
    if (uid) {
      firestore.getItinerariesSetting(uid).then((res) => {
        setTravelMode(res.default_travel_mode);
      });
    }
  }, [uid]);

  return (
    <>
      <Modal
        addCss={css`
          min-width: 70%;
          flex-basis: 70%;
          height: 80%;
          padding: 20px 40px;
        `}
        isShowState={isShowState}
        close={() => setIsShowSetting(false)}>
        <UserSettingContentContainer>
          <UserProfileWrapper>
            <div
              css={css`
                position: relative;
              `}>
              <Image
                size="80px"
                round
                shadow
                addCss={css`
                  border: 1px solid ${palatte.gray['100']};
                `}
                src={profile.photo || defaultUserIcon}
                alt={profile.name}
              />
              <AddImageRoundBtn
                addCss={css`
                  position: absolute;
                  bottom: 0;
                  right: 0;
                  font-size: 16px;
                `}
                styled="primary"
                icon="edit"
                confirmMessage="確定上傳大頭照？"
                upload={updateProfilePhoto}
              />
            </div>
            <UserProfileTextWrapper>
              <EditableText
                isAllowEdit
                defaultShowText
                level="5"
                fontSize="24px"
                onSubmit={updateUserName}>
                {profile.name || ''}
              </EditableText>
              <P fontSize="14px" color={palatte.gray['400']}>
                用戶ID：{profile.uid}
              </P>
            </UserProfileTextWrapper>
          </UserProfileWrapper>
          <Title iconName="settings">設置</Title>
          <SettingContainer>
            <Accordion
              titleElement={
                <SettingTitle
                  title="紀錄心得標籤"
                  subTitle="預設顯示在遊記的標籤，幫助你快速紀錄當下景點的心得"
                />
              }>
              <SettingReviewTagsContainer>
                <form
                  css={css`
                    position: relative;
                  `}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (addTag) {
                      const newReviewTags = reviewTags
                        ? [...reviewTags, addTag]
                        : [addTag];
                      await firestore.editProfile(uid, {
                        review_tags: newReviewTags,
                      });
                      setReviewTags(newReviewTags);
                      setAddTag('');
                    }
                  }}>
                  <TextInput
                    placeholder="新增標籤"
                    value={addTag}
                    ref={addTagInput}
                    onChange={(e) => setAddTag(e.target.value)}
                  />
                  <SettingReviewButtonWrapper>
                    <SettingReviewButton
                      className="material-icons"
                      type="submit">
                      done
                    </SettingReviewButton>
                    <SettingReviewButton
                      className="material-icons"
                      type="button"
                      danger
                      onClick={() => {
                        setAddTag('');
                        addTagInput.current.focus();
                      }}>
                      close
                    </SettingReviewButton>
                  </SettingReviewButtonWrapper>
                </form>
                <SettingReviewTagsWrapper>
                  {reviewTags?.length > 0 ? (
                    reviewTags.map((tag) => (
                      <ReviewTagRemoveButton
                        styled="primary"
                        key={tag}
                        onClick={async () => {
                          const newReviewTags = reviewTags.filter(
                            (originTag) => originTag !== tag
                          );
                          await firestore.editProfile(uid, {
                            review_tags: newReviewTags,
                          });
                          setReviewTags(newReviewTags);
                        }}>
                        {tag}
                      </ReviewTagRemoveButton>
                    ))
                  ) : (
                    <P
                      css={css`
                        color: ${palatte.gray['500']};
                      `}>
                      尚未添加心得標籤
                    </P>
                  )}
                </SettingReviewTagsWrapper>
              </SettingReviewTagsContainer>
            </Accordion>
            <Accordion
              titleElement={
                <SettingTitle
                  title="預設交通方式"
                  subTitle="編輯行程會自動以選定的交通方式計算到景點的時間與距離"
                />
              }>
              <Select
                value={travelMode}
                onChange={(e) => {
                  const newTravelMode = e.target.value;
                  setTravelMode('loading');
                  firestore
                    .setItinerariesSetting(uid, {
                      default_travel_mode: newTravelMode,
                    })
                    .then(() => {
                      setTravelMode(newTravelMode);
                    });
                }}>
                <option value="loading" disabled hidden>
                  ...
                </option>
                <option value="DRIVING">開車</option>
                <option value="TRANSIT">大眾運輸</option>
                <option value="WALKING">走路</option>
                <option value="BICYCLING">騎自行車</option>
              </Select>
            </Accordion>
          </SettingContainer>
        </UserSettingContentContainer>
      </Modal>
    </>
  );
}

UserSetting.propTypes = {
  profile: PropTypes.objectOf(PropTypes.string),
  setProfile: PropTypes.func,
  isShowState: PropTypes.bool,
  setIsShowSetting: PropTypes.func,
  reviewTags: PropTypes.array,
  setReviewTags: PropTypes.func,
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
      font-size: 32px;
      color: ${palatte.white};
      text-align: center;
      margin-bottom: 3px;
    }
  }
`;

function UserProfile(props) {
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
          <Container minHeight="calc(100vh - 50px)">
            <UserSetting
              setIsShowSetting={setIsShowSetting}
              setProfile={setProfile}
              profile={profile}
              reviewTags={reviewTags}
              setReviewTags={setReviewTags}
              isShowState={isShowSetting}
            />
            <Container
              padding="80px 2px 0px 2px"
              backgroundColor={palatte.secondary['100']}
              addCss={css`
                overflow: hidden;
                ${mediaQuery[0]} {
                  padding: 14px 0px 0px 0px;
                }
              `}>
              <FlexDiv
                direction="column"
                gap="25px"
                maxWidth={styles.container_maxWidth}
                margin="0 auto"
                padding={`0 ${styles.container_padding}`}
                addCss={css`
                  ${mediaQuery[0]} {
                    padding: 14px 20px 14px 40px;
                  }
                `}>
                <FlexDiv
                  justifyContent="space-between"
                  alignItems="flex-start"
                  addCss={css`
                    ${mediaQuery[0]} {
                      align-items: center;
                    }
                  `}>
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
                    <FlexChildDiv
                      gap="20px"
                      alignItems="center"
                      addCss={css`
                        ${mediaQuery[0]} {
                          display: none;
                        }
                      `}>
                      <div
                        css={css`
                          position: relative;
                        `}>
                        <Image
                          round
                          size="60px"
                          addCss={css`
                            box-shadow: 2px 2px 1px 1px ${palatte.shadow};
                            border: 1px solid ${palatte.gray['100']};
                            background-color: ${!profile.photo &&
                            palatte.secondary[100]};
                          `}
                          src={profile.photo || defaultUserIcon}
                          alt="profilePhoto"
                        />
                      </div>
                      <P
                        css={css`
                          white-space: nowrap;
                          cursor: default;
                        `}>
                        你好，{profile.name}
                      </P>
                    </FlexChildDiv>
                    <FlexDiv alignItems="center" gap="10px">
                      <ButtonSmall styled="danger" onClick={logout}>
                        登出
                      </ButtonSmall>
                      <RoundButtonSmall
                        className="material-icons"
                        onClick={() => setIsShowSetting(true)}>
                        settings
                      </RoundButtonSmall>
                    </FlexDiv>
                  </UserProfileCardWrapper>
                </FlexDiv>
                <FlexDiv
                  gap="15px"
                  addCss={css`
                    ${mediaQuery[0]} {
                      position: fixed;
                      bottom: 0;
                      left: 0;
                      width: 100%;
                      gap: 0;
                      z-index: 10;
                    }
                  `}>
                  <NavTag
                    style={({ isActive }) => {
                      return activeStyle(isActive);
                    }}
                    to={`/itineraries`}>
                    <span className="material-icons">event_note</span>
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
                    <span className="material-icons">explore</span>
                    探索景點
                  </NavTag>
                  <NavTag
                    style={({ isActive }) => {
                      return activeStyle(isActive);
                    }}
                    to={`/saved-spots`}>
                    <span className="material-icons">add_location</span>
                    候補景點
                  </NavTag>
                  <NavTag
                    style={({ isActive }) => {
                      return activeStyle(isActive);
                    }}
                    to={`/travel-journals`}>
                    <span className="material-icons">article</span>
                    旅行回憶
                  </NavTag>
                </FlexDiv>
              </FlexDiv>
              <DecoOfPage />
            </Container>

            <Outlet context={{ reviewTags }} />
          </Container>
          {uid !== undefined && <Footer />}
        </>
      )}
    </>
  );
}

export default UserProfile;
