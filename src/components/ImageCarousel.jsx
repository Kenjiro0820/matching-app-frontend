import { useMemo, useState } from "react";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
];

export function buildGalleryImages(...values) {
  const deduped = values.filter(Boolean).filter((value, index, array) => array.indexOf(value) === index);

  if (deduped.length >= 2) {
    return deduped;
  }

  return [...deduped, ...FALLBACK_IMAGES].slice(0, 3);
}

export default function ImageCarousel({
  images,
  alt,
  aspect = "portrait",
  className = "",
  compact = false,
}) {
  const safeImages = useMemo(() => {
    const list = Array.isArray(images) ? images.filter(Boolean) : [];
    return list.length > 0 ? list : FALLBACK_IMAGES;
  }, [images]);

  const [index, setIndex] = useState(0);

  const current = safeImages[index] || safeImages[0];

  const move = (direction) => {
    setIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return safeImages.length - 1;
      if (next >= safeImages.length) return 0;
      return next;
    });
  };

  const handleZoneClick = (event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const isRightSide = event.clientX - rect.left > rect.width / 2;
    move(isRightSide ? 1 : -1);
  };

  return (
    <div
      className={`image-carousel image-carousel--${aspect} ${compact ? "image-carousel--compact" : ""} ${className}`.trim()}
    >
      <button
        type="button"
        className="image-carousel__media"
        onClick={handleZoneClick}
        aria-label="画像を切り替える"
      >
        <img src={current} alt={alt} className="image-carousel__image" />
        {safeImages.length > 1 && (
          <>
            <span className="image-carousel__zone image-carousel__zone--left" aria-hidden="true" />
            <span className="image-carousel__zone image-carousel__zone--right" aria-hidden="true" />
          </>
        )}
      </button>

      {safeImages.length > 1 && (
        <div className="image-carousel__dots" aria-label="画像位置">
          {safeImages.map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              className={
                dotIndex === index
                  ? "image-carousel__dot image-carousel__dot--active"
                  : "image-carousel__dot"
              }
              onClick={(event) => {
                event.stopPropagation();
                setIndex(dotIndex);
              }}
              aria-label={`${dotIndex + 1}枚目へ移動`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
