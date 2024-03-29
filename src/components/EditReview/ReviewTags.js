import { useEffect, useState, useRef } from 'react';
import { Done, Close, AddCircle } from '@mui/icons-material';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { mediaQuery, palatte, styles } from '../styledComponents/basic/common';
import { ReviewTag, inputBaseSmall } from '../styledComponents/Form';
import {
  RoundButtonSmall,
  RoundButtonSmallOutline,
} from '../styledComponents/Buttons/RoundButton';
const Container = styled.div`
  ${styles.flex};
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
`;
const ReviewTagsWrapper = styled.div`
  ${styles.flex};
  gap: 12px;
  overflow-y: auto;
  position: relative;
  ${mediaQuery[0]} {
    gap: 5px;
  }
`;
const AddReviewTagControllerWrapper = styled.div`
  ${styles.flex};
  position: relative;
`;
const AddReviewTagsForm = styled.form`
  display: flex;
  align-items: center;
  gap: 5px;
`;
const ShadowLeft = styled.div`
  position: absolute;
  top: ${(props) => (!props.isEdit ? '-19px' : '-6px')};
  left: -18px;
  width: 10px;
  height: 38px;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0), ${palatte.shadow});
`;
const AddReviewTagsButton = styled(RoundButtonSmallOutline)`
  border-radius: 10px;
`;
function ReviewTags({
  defaultTags,
  isEdit,
  checkedTags,
  setCheckedTags,
  isShowInput,
  setIsShowInput,
  addCheckedTag,
}) {
  const tagContainer = useRef();
  const [isShowShadow, setIsShowShadow] = useState();
  const [addTagInputValue, setAddTagInputValue] = useState('');
  const submitTimer = useRef();

  useEffect(() => {
    if (tagContainer.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (
          entries[0].borderBoxSize[0].inlineSize < entries[0].target.scrollWidth
        ) {
          setIsShowShadow(true);
        } else {
          setIsShowShadow(false);
        }
      });
      resizeObserver.observe(tagContainer.current, { box: 'border-box' });
      return function cleanup() {
        resizeObserver.disconnect();
      };
    }
  }, [tagContainer]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (submitTimer.current) clearTimeout(submitTimer.current);
    submitTimer.current = setTimeout(() => {
      addCheckedTag(addTagInputValue, setAddTagInputValue);
      submitTimer.current = '';
    }, 200);
  };
  return (
    <Container>
      <ReviewTagsWrapper ref={tagContainer}>
        {defaultTags?.map((tag) => (
          <ReviewTag
            key={tag}
            isEdit={isEdit}
            tag={tag}
            selectedList={checkedTags}
            setSelectedList={setCheckedTags}>
            {tag}
          </ReviewTag>
        ))}
      </ReviewTagsWrapper>
      <AddReviewTagControllerWrapper>
        {isShowShadow && <ShadowLeft isEdit={isEdit} />}
        {isEdit &&
          (isShowInput ? (
            <AddReviewTagsForm onSubmit={onSubmit}>
              <input
                css={inputBaseSmall}
                type="type"
                placeholder="新增心得標籤"
                value={addTagInputValue}
                onChange={(e) => {
                  let tag = e.target.value;
                  setAddTagInputValue(tag.replace(/[<>"']/g, ''));
                }}
              />
              <AddReviewTagsButton type="submit" color="primary">
                <Done />
              </AddReviewTagsButton>
              <AddReviewTagsButton
                type="button"
                color="danger"
                onClick={() => setIsShowInput(false)}>
                <Close />
              </AddReviewTagsButton>
            </AddReviewTagsForm>
          ) : (
            <RoundButtonSmall
              type="button"
              onClick={() => {
                setIsShowInput(true);
              }}>
              <AddCircle />
            </RoundButtonSmall>
          ))}
      </AddReviewTagControllerWrapper>
    </Container>
  );
}

ReviewTag.propTypes = {
  defaultTags: PropTypes.array,
  isEdit: PropTypes.bool,
  checkedTags: PropTypes.array,
  setCheckedTags: PropTypes.func,
  isShowInput: PropTypes.bool,
  setIsShowInput: PropTypes.func,
  addCheckedTag: PropTypes.func,
};

export default ReviewTags;
