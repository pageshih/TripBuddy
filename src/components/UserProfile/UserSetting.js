import { useContext, useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { firestore, firebaseStorage } from '../../utils/firebase';
import { Context } from '../../App';
import { Modal } from '../styledComponents/Modal';
import { Accordion } from '../styledComponents/Accordion';
import { EditableText } from '../styledComponents/EditableText';
import { P, H5, H6 } from '../styledComponents/basic/Text';
import { palatte, styles } from '../styledComponents/basic/common';
import { AddImageRoundBtn, TextInput, Select } from '../styledComponents/Form';
import { RoundButtonSmall } from '../styledComponents/Buttons/RoundButton';
import { roundSmallButtonColorMap } from '../styledComponents/Buttons/buttonColorMaps';
import { Image } from '../styledComponents/Layout';
import defaultUserIcon from '../../images/user-avatar-filled.svg';

const CapsuleTag = styled.div`
  border-radius: 30px;
  white-space: nowrap;
  background-color: ${(props) =>
    props.styled
      ? roundSmallButtonColorMap[props.styled].default.backgroundColor
      : 'inherit'};
  color: ${(props) =>
    props.styled
      ? roundSmallButtonColorMap[props.styled].default.color
      : 'inherit'};
  padding: 5px 10px 5px 15px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 16px;
  line-height: 0.9;
`;
const ReviewTagRemoveButton = (props) => (
  <CapsuleTag styled={props.styled}>
    {props.children}
    <RoundButtonSmall
      size="20px"
      css={css`
        font-size: 20px;
        color: ${palatte.white};
        opacity: 0.7;
        &:hover {
          opacity: 1;
          color: ${palatte.white};
        }
      `}
      onClick={props.onClick}
      className="material-icons">
      cancel
    </RoundButtonSmall>
  </CapsuleTag>
);

const SettingTitle = ({ title, subTitle }) => (
  <>
    <H6
      css={css`
        font-size: 20px;
        font-weight: 500;
        color: ${palatte.gray['800']};
      `}>
      {title}
    </H6>
    <P
      css={css`
        color: ${palatte.gray['600']};
      `}>
      {subTitle}
    </P>
  </>
);
SettingTitle.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.string,
};
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

UserProfileTextWrapper.propTypes = {
  iconName: PropTypes.string,
  children: PropTypes.any,
};
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
                isDefaultShowText
                level="5"
                addCss={css`
                  font-size: 24px;
                `}
                onSubmit={updateUserName}>
                {profile.name || ''}
              </EditableText>
              <P
                css={css`
                  font-size: 14px;
                  color: ${palatte.gray['400']};
                `}>
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

export default UserSetting;
