import { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { palatte, styles } from '../styledComponents/basic/common';
import { AddImages, uploadImageStyle } from '../styledComponents/Form';
import { Image } from '../styledComponents/Layout';
import { P } from '../styledComponents/basic/Text';
import { RoundButtonSmall } from '../styledComponents/Buttons/RoundButton';

const CloseButton = styled(RoundButtonSmall)`
  position: absolute;
  right: 4px;
  top: 7px;
  background-color: ${palatte.white};
  border-radius: 50%;
  color: ${palatte.gray['300']};
`;
const GalleryImage = ({ src, alt }) => (
  <Image
    src={src}
    alt={alt}
    addCss={css`
      ${uploadImageStyle}
      width:250px;
      height: 200px;
      box-shadow: 2px 2px 2px 2px ${palatte.shadow};
      margin-bottom: 4px;
    `}
  />
);
const PreviewImage = ({ src, alt }) => (
  <Image
    src={src}
    alt={alt}
    addCss={css`
      ${uploadImageStyle}
      width:250px;
      height: 200px;
      border-radius: 10px;
      border: 8px solid ${palatte.primary['300']};
    `}
  />
);
const PreviewTag = styled(P)`
  font-size: 14px;
  color: ${palatte.primary.basic};
  width: 60px;
  height: 40px;
  padding: 5px 10px;
  border: 5px solid ${palatte.primary['300']};
  border-radius: 30px;
  background-color: ${palatte.white};
  position: absolute;
  bottom: 4px;
  left: 0px;
  & span {
    display: none;
  }
  &:hover {
    & p {
      display: none;
    }
    & span {
      font-size: 20px;
      display: block;
      color: ${palatte.danger.basic};
    }
  }
`;
const Container = styled.div`
  ${styles.flex};
  gap: 15px;
`;
const GalleryWrapper = styled(Container)`
  overflow-y: auto;
`;
const ImageWrapper = styled.div`
  position: relative;
  margin-right: 5px;
`;
function ReviewGallery({
  gallery,
  setGallery,
  imageBuffer,
  setImageBuffer,
  isEdit,
}) {
  const galleryContainer = useRef();
  const [isShowShadow, setIsShowShadow] = useState();
  useEffect(() => {
    if (galleryContainer.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (
          entries[0].borderBoxSize[0].inlineSize < entries[0].target.scrollWidth
        ) {
          setIsShowShadow(true);
        } else {
          setIsShowShadow(false);
        }
      });
      resizeObserver.observe(galleryContainer.current, { box: 'border-box' });
      return function cleanup() {
        resizeObserver.disconnect();
      };
    }
  }, [galleryContainer]);

  return (
    <Container>
      {(gallery?.length > 0 || imageBuffer?.length > 0) && (
        <GalleryWrapper ref={galleryContainer}>
          {gallery?.length > 0 && (
            <Container>
              {gallery?.map((url, index) => (
                <ImageWrapper key={index}>
                  <GalleryImage src={url} alt="schedulePhoto" />
                  {isEdit && (
                    <CloseButton
                      close
                      className="material-icons"
                      onClick={() => {
                        const newGallery = gallery.filter(
                          (_, newIndex) => index !== newIndex
                        );
                        setGallery(newGallery);
                      }}>
                      cancel
                    </CloseButton>
                  )}
                </ImageWrapper>
              ))}
            </Container>
          )}
          {imageBuffer?.length > 0 && (
            <Container>
              {imageBuffer.map((blob, index) => {
                const blobUrl = URL.createObjectURL(blob);
                return (
                  <ImageWrapper key={blob.lastModified}>
                    <PreviewImage src={blobUrl} alt={blob.name} />
                    <PreviewTag>預覽</PreviewTag>
                    <CloseButton
                      className="material-icons"
                      close
                      onClick={() => {
                        const newImagesBuffer = imageBuffer.filter(
                          (_, newIndex) => index !== newIndex
                        );
                        setImageBuffer(newImagesBuffer);
                      }}>
                      cancel
                    </CloseButton>
                  </ImageWrapper>
                );
              })}
            </Container>
          )}
        </GalleryWrapper>
      )}
      {isEdit && (
        <AddImages
          imageBuffer={imageBuffer}
          setImageBuffer={setImageBuffer}
          isScroll={isShowShadow}
        />
      )}
    </Container>
  );
}

ReviewGallery.propTypes = {
  gallery: PropTypes.array,
  setGallery: PropTypes.func,
  imageBuffer: PropTypes.array,
  setImageBuffer: PropTypes.func,
  isEdit: PropTypes.bool,
};

export default ReviewGallery;
