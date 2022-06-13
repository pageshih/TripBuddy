import { useEffect, useState, useRef } from 'react';
import { Cancel } from '@mui/icons-material';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { mediaQuery, palatte, styles } from '../styledComponents/basic/common';
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
  position: relative;
`;
const GalleryContainer = styled(Container)`
  overflow-y: auto;
`;
const ImageWrapper = styled.div`
  position: relative;
  margin-right: 5px;
`;
const ShadowLeft = styled.div`
  display: none;
  ${mediaQuery[0]} {
    display: block;
    position: absolute;
    top: -10px;
    right: 0px;
    width: 10px;
    height: 220px;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0), ${palatte.shadow});
  }
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
      if (galleryContainer.current.scrollWidth > 600) {
        setIsShowShadow(true);
      } else {
        setIsShowShadow(false);
      }
    }
  }, [gallery, imageBuffer]);

  return (
    <Container
      css={css`
        ${mediaQuery[0]} {
          flex-direction: column;
        }
      `}>
      {(gallery?.length > 0 || imageBuffer?.length > 0) && (
        <GalleryContainer ref={galleryContainer}>
          {gallery?.length > 0 && (
            <Container>
              {gallery?.map((url, index) => (
                <ImageWrapper key={index}>
                  <GalleryImage src={url} alt="schedulePhoto" />
                  {isEdit && (
                    <CloseButton
                      close
                      onClick={() => {
                        const newGallery = gallery.filter(
                          (_, newIndex) => index !== newIndex
                        );
                        setGallery(newGallery);
                      }}>
                      <Cancel />
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
                      close
                      onClick={() => {
                        const newImagesBuffer = imageBuffer.filter(
                          (_, newIndex) => index !== newIndex
                        );
                        setImageBuffer(newImagesBuffer);
                      }}>
                      <Cancel />
                    </CloseButton>
                  </ImageWrapper>
                );
              })}
            </Container>
          )}
        </GalleryContainer>
      )}
      {isShowShadow && <ShadowLeft />}
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
