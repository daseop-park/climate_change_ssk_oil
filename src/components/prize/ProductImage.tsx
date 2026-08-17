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
      {/*
        `key={src}` 는 캐시 무효화가 아니라 **옛 사진이 남는 것을 막는 장치**입니다.

        같은 `<img>` 노드에 `src` 만 바꾸면 브라우저는 새 이미지를 다 받을 때까지
        **직전 비트맵을 계속 그립니다.** `PrizeSheet` 는 닫힘 애니메이션 동안 내용을
        남기려고 계속 마운트돼 있어서(`PrizeSheet.tsx:7`), 다른 경품을 열면 잠깐
        **앞서 본 경품 사진**이 보였습니다. 경품 화면에서 남의 상품 사진이 스치는 건
        어색한 정도가 아니라 오해를 부릅니다.

        key 가 바뀌면 노드를 새로 만들어 그릴 옛 픽셀이 아예 없습니다.
        대신 로딩 동안 이 래퍼의 흰 배경이 보입니다 — 빈 흰 칸이 잘못된 사진보다 낫습니다.
      */}
      <Image
        key={src}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-contain p-2"
      />
    </div>
  );
}
