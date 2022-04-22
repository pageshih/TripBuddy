import { useContext, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { compressImages } from '../utils/utilities';
import { firestore, firebaseStorage } from '../utils/firebase';
import { Context } from '../App';
import { FlexDiv, Container } from './styledComponents/Layout';

function ReviewTags(props) {
  return (
    <FlexDiv alignItems="center" gap="10px">
      <FlexDiv gap="20px">
        {props.defaultTags?.map((tag) => (
          <label key={tag}>
            {tag}
            {props.isEdit && (
              <input
                value={tag}
                type="checkbox"
                checked={
                  props.checkedTags?.some((checked) => tag === checked) && true
                }
                onChange={(e) => {
                  const setChecked = (prev) => {
                    if (e.target.checked) {
                      return prev ? [...prev, tag] : [tag];
                    } else {
                      return prev.filter((tag) => e.target.value !== tag);
                    }
                  };
                  props.setCheckedTags((prev) => setChecked(prev));
                }}
              />
            )}
          </label>
        ))}
      </FlexDiv>
      {props.isEdit ? (
        props.showInput ? (
          <form onSubmit={props.onSubmit}>
            <input
              type="type"
              placeholder="按 + 新增心得標籤"
              value={props.inputTag}
              onChange={(e) => {
                props.setInputTag(e.target.value);
              }}
            />
            <button type="submit">+</button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              props.setShowInput(true);
            }}>
            +
          </button>
        )
      ) : null}
    </FlexDiv>
  );
}

function AddImages(props) {
  return (
    <label
      style={{
        backgroundColor: 'lightgray',
        fontSize: '13px',
        padding: '1px 5px',
      }}>
      <input
        type="file"
        style={{ display: 'none' }}
        accept="image/*"
        multiple
        onChange={async (e) => {
          let addCompressed = await compressImages(e.target.files);
          if (props.imageBuffer?.length > 0) {
            addCompressed = [...props.imageBuffer, ...addCompressed];
          }
          props.setImageBuffer(addCompressed);
        }}
      />
      上傳照片
    </label>
  );
}

function ReviewGallery(props) {
  return (
    <>
      <FlexDiv gap="20px">
        {props.gallery?.map((url, index) => (
          <FlexDiv alignItems="flex-start" key={index}>
            <div style={{ maxWidth: '300px', height: '200px' }}>
              <img
                src={url}
                alt="schedulePhoto"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {props.isEdit && (
              <button
                onClick={() => {
                  const newGallery = props.gallery.filter(
                    (_, newIndex) => index !== newIndex
                  );
                  props.setGallery(newGallery);
                }}>
                X
              </button>
            )}
          </FlexDiv>
        ))}
      </FlexDiv>
      <div>
        {props.imageBuffer?.length > 0 && <h4>圖片預覽</h4>}
        <FlexDiv gap="20px">
          {props.imageBuffer?.map((blob, index) => {
            const blobUrl = URL.createObjectURL(blob);
            return (
              <FlexDiv alignItems="flex-start" key={blob.lastModified}>
                <div style={{ maxWidth: '300px', height: '200px' }}>
                  <img
                    src={blobUrl}
                    alt={blob.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    const newImagesBuffer = props.imageBuffer.filter(
                      (_, newIndex) => index !== newIndex
                    );
                    props.setImageBuffer(newImagesBuffer);
                  }}>
                  X
                </button>
              </FlexDiv>
            );
          })}
        </FlexDiv>
      </div>
      {props.isEdit && (
        <AddImages
          imageBuffer={props.imageBuffer}
          setImageBuffer={props.setImageBuffer}
        />
      )}
    </>
  );
}

class uploadReviewFirestore {
  constructor({
    uid,
    itineraryId,
    scheduleId,
    updateSchedule,
    imageBuffer,
    gallery,
  }) {
    this.updateSchedule = updateSchedule;
    this.uid = uid;
    this.itineraryId = itineraryId;
    this.imageBuffer = imageBuffer;
    this.scheduleId = scheduleId;
    this.gallery = gallery;
  }
  async uploadStorage() {
    return this.imageBuffer
      ? await firebaseStorage.uploadImagesOfReviews(
          {
            userUID: this.uid,
            scheduleId: this.scheduleId,
            itineraryId: this.itineraryId,
          },
          this.imageBuffer
        )
      : [];
  }
  async doUpload() {
    const newGallery = this.gallery
      ? [...this.gallery, ...(await this.uploadStorage())]
      : [...(await this.uploadStorage())];
    return firestore
      .editSchedules(
        this.uid,
        this.itineraryId,
        [
          {
            ...this.updateSchedule,
            schedule_id: this.scheduleId,
            gallery: newGallery,
          },
        ],
        'merge'
      )
      .then(() => {
        alert('上傳成功！');
        return Promise.resolve(newGallery);
      })
      .catch((error) => console.error(error));
  }
}

export { ReviewTags, ReviewGallery, uploadReviewFirestore };
