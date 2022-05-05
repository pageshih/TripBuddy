import { Outlet, NavLink } from 'react-router-dom';
import { useContext, useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
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
import {
  Logo,
  styles,
  palatte,
  mediaQuery,
  P,
  H5,
  H6,
} from './styledComponents/basicStyle';
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
    <H6 fontSize="20px" fontWeight={500} color={palatte.gray['800']}>
      {props.title}
    </H6>
    <P color={palatte.gray['600']}>{props.subTitle}</P>
  </>
);
function UserSetting(props) {
  const { uid } = useContext(Context);
  const [addTag, setAddTag] = useState('');
  const addTagInput = useRef();
  const updateProfile = async (newProfile) => {
    await firestore.editProfile(uid, newProfile);
    props.setProfile({ ...props.profile, ...newProfile });
  };
  const updateProfilePhoto = async (imageBuffer, setIsShowModal) => {
    try {
      const urlAry = await firebaseStorage.uploadImages(
        [uid],
        imageBuffer,
        'profile_photo'
      );
      updateProfile({ photo: urlAry[0] });
      alert('大頭貼已更新！');
      setIsShowModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      width="70%"
      height="70%"
      padding="20px 40px"
      close={() => props.setIsShowSetting(false)}>
      <FlexDiv direction="column" padding="20px 0" gap="30px">
        <FlexDiv
          gap="20px"
          alignItems="center"
          padding="0 0 30px 0"
          addCss={css`
            border-bottom: 1px solid ${palatte.gray['400']};
          `}>
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
              src={props.profile.photo}
              alt={props.profile.name}
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
          <FlexDiv direction="column" gap="8px">
            <H5 fontSize="24px">{props.profile.name}</H5>
            <P fontSize="14px" color={palatte.gray['400']}>
              用戶ID：{props.profile.uid}
            </P>
          </FlexDiv>
        </FlexDiv>
        <FlexDiv alignItems="center" gap="5px">
          <span
            className="material-icons"
            css={css`
              color: ${palatte.gray['700']};
            `}>
            settings
          </span>
          <H5 fontSize="24px" fontWeight={500}>
            設置
          </H5>
        </FlexDiv>
        <Accordion
          titleElement={
            <SettingTitle
              title="紀錄心得標籤"
              subTitle="預設顯示在遊記的標籤，幫助你快速紀錄當下景點的心得"
            />
          }>
          <FlexDiv
            direction="column"
            gap="15px"
            overflowY="scroll"
            height="100%">
            <form
              css={css`
                flex-grow: 1;
                position: relative;
              `}
              onSubmit={async (e) => {
                e.preventDefault();
                const newReviewTags = props.profile.review_tags
                  ? [...props.profile.review_tags, addTag]
                  : [addTag];
                await updateProfile({ review_tags: newReviewTags });
                setAddTag('');
              }}>
              <TextInput
                placeholder="新增標籤"
                value={addTag}
                ref={addTagInput}
                onChange={(e) => setAddTag(e.target.value)}
              />
              <FlexDiv
                gap="5px"
                addCss={css`
                  position: absolute;
                  right: 12px;
                  top: calc(50% - 12px);
                `}>
                <RoundButtonSmall
                  className="material-icons"
                  type="submit"
                  addCss={css`
                    color: ${palatte.gray['500']};
                    &:hover {
                      color: ${palatte.primary.basic};
                    }
                  `}>
                  done
                </RoundButtonSmall>
                <RoundButtonSmall
                  className="material-icons"
                  type="button"
                  addCss={css`
                    color: ${palatte.gray['500']};
                    &:hover {
                      color: ${palatte.danger.basic};
                    }
                  `}
                  onClick={() => {
                    setAddTag('');
                    addTagInput.current.focus();
                  }}>
                  close
                </RoundButtonSmall>
              </FlexDiv>
            </form>
            <FlexDiv gap="5px">
              {props.profile.review_tags?.length > 0 ? (
                props.profile.review_tags.map((tag) => (
                  <ReviewTagRemoveButton styled="primary" key={tag}>
                    {tag}
                  </ReviewTagRemoveButton>
                ))
              ) : (
                <P color={palatte.gray['500']}>尚未添加心得標籤</P>
              )}
            </FlexDiv>
          </FlexDiv>
        </Accordion>
        <Accordion
          titleElement={
            <SettingTitle
              title="預設交通方式"
              subTitle="編輯行程會自動以選定的交通方式計算到景點的時間與距離"
            />
          }>
          <Select
            value={props.profile.default_travel_mode}
            onChange={(e) => {
              updateProfile({ default_travel_mode: e.target.value });
            }}>
            <option value="DRIVING">開車</option>
            <option value="TRANSIT">大眾運輸</option>
            <option value="WALKING">走路</option>
            <option value="BICYCLING">騎自行車</option>
          </Select>
        </Accordion>
      </FlexDiv>
    </Modal>
  );
}
function UserProfile(props) {
  const { uid, setUid } = useContext(Context);
  const [profile, setProfile] = useState();
  const [reviewTags, setReviewTags] = useState();
  const [isShowSetting, setIsShowSetting] = useState();

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
  useEffect(() => {
    if (uid) {
      firestore
        .getProfile(uid)
        .then((res) => {
          setProfile(res);
          setReviewTags(res.review_tags);
        })
        .catch((error) => console.error(error));
    }
  }, [uid, setUid]);

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

  return (
    <>
      {profile && (
        <>
          <Container minHeight="calc(100vh - 50px)">
            {isShowSetting && (
              <UserSetting
                setIsShowSetting={setIsShowSetting}
                setProfile={setProfile}
                profile={profile}
              />
            )}
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
                  <div css={userProfileWrapper}>
                    <FlexChildDiv
                      gap="20px"
                      alignItems="center"
                      addCss={css`
                        ${mediaQuery[0]} {
                          display: none;
                        }
                      `}>
                      <Image
                        round
                        shadow
                        size="48px"
                        src={profile.photo}
                        alt="profilePhoto"
                      />
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
                      <RoundButtonSmall
                        className="material-icons"
                        onClick={() => setIsShowSetting(true)}>
                        settings
                      </RoundButtonSmall>
                    </FlexDiv>
                  </div>
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
          </Container>
          {uid !== undefined && <Footer />}
        </>
      )}
    </>
  );
}

export default UserProfile;
