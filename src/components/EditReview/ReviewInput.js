import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { P } from '../styledComponents/basic/Text';
import { TextAreaReview } from '../styledComponents/Form';

function ReviewInput({ isEdit, review, setReview, isReviewShowInput }) {
  const [readOnly, setReadOnly] = useState(isReviewShowInput);
  const [value, setValue] = useState(review);

  useEffect(() => {
    setValue(review);
  }, [review]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReview(value);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [value, setReview]);

  return (
    <>
      {isEdit ? (
        <TextAreaReview
          type="textarea"
          placeholder="添加一點旅行後的心得吧！"
          value={value}
          isEmptyInput={value && false}
          readOnly={readOnly}
          onChange={(e) => {
            let review = e.target.value;
            setValue(review.replace(/[<>"']/, ''));
          }}
          onClick={() => {
            setReadOnly(false);
          }}
        />
      ) : (
        <P>{review}</P>
      )}
    </>
  );
}

ReviewInput.propTypes = {
  isEdit: PropTypes.bool,
  review: PropTypes.string,
  setReview: PropTypes.func,
  reviewShowInput: PropTypes.bool,
};

export default ReviewInput;
