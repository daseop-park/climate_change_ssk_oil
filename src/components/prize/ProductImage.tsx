import Image from "next/image";

import { imgFor } from "@/lib/product-image";

type Props = {
  /** `Product.image` — null 이면 hue 기반 스트라이프 플레이스홀더로 떨어집니다. */
  src: string | null | undefined;
  alt: string;
  hue: number;
  /** 이미지가 놓일 박스 크기·모서리. 호출부의 레이아웃을 그대로 받습니다. */
  className?: string;
  /** 플레이스홀더 안내 문구 크기 (카드/시트/모달이 조금씩 다릅니다) */
  labelClassName?: string;
  /** 그리드 썸네일은 작게 뜨므로 실제 렌더 폭을 알려 줍니다. */
  sizes?: string;
};

/**
 * 경품 이미지 한 칸.
 *
 * 상품 사진은 기프트카드처럼 가로로 긴 것도 있어서 `object-contain` 으로 넣습니다.
 * `object-cover` 로 채우면 금액·브랜드 표기가 잘려 나갑니다.
 */
export default function ProductImage({
  src,
  alt,
  hue,
  className = "",
  labelClassName = "text-[10px]",
  sizes = "200px",
}: Props) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={imgFor(hue)}>
        <span
          className={`font-mono font-semibold tracking-[.06em] text-[rgba(23,33,28,.35)] ${labelClassName}`}
        >
          상품 이미지
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-contain p-2" />
    </div>
  );
}
