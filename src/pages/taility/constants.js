import { theme } from "../ourwedding/utils/theme";

export const GRADES = [
  ["샘플", "4일"],
  ["~4일까지", "4일"],
  ["~48시간안에", "48시간"],
  ["당일 6시간 안에(3장이상부터)", "6시간"],
];

export const ADDITIONAL_OPTIONS = [
  ["background", "배경 보정", 20000],
  ["film", "필름 보정", 30000],
  ["retouch", "리터치", 50000],
];

export const CAUTION_ITEMS = [
  {
    text: "업로드 후에는 요청사항/파일은 변동 불가능합니다. 그러므로 신중히 업로드 부탁드립니다.",
  },
  {
    text: (
      <>
        요청사항 중 불가능한 사항에 대해서는 작업 중 따로 연락 드리지 않습니다.
        {"\n"}
        <span style={{ fontWeight: "bold", color: theme.colors.error }}>
          그러므로 요청사항 중 애매한 부분에 대해서는 업로드 전 미리 사진과 함께
          채팅으로 가능 여부 확인 부탁드립니다.
        </span>
      </>
    ),
  },
  {
    text: (
      <>
        1차 보정본과 최근 재수정(모든 재수정 파일 X) 주신 파일은 요청일로부터
        한달 간 [접수 내역]에서 확인이 가능하나, 그 이후엔 파기되며 완성본에
        대해서 책임지지 않습니다. {"\n"}
        <span style={{ fontWeight: "bold", color: theme.colors.error }}>
          그러므로 모든 재수정과 작업본은 개인적으로 꼭 저장해주시길 바랍니다.
        </span>
      </>
    ),
  },
  {
    text: "샘플 진행 시 사진은 자사 작업물로 귀속되어 마케팅 채널에 활용될 수 있습니다. ( 모자이크 X )",
  },
];

export const REQUEST_TEMPLATE = `1. 보정강도 (약,약중,중,중강,강)
(추천 : 자연스러운 보정을 위해 생각하시는 보정단계보다 한단계 낮춰서 진행 하시는걸 추천드립니다 ! )

▶️

2. 전체 사진 공통 요청사항 

신랑 :
신부 : 

3. 개별 추가 요청사항
(밝기 조절은 기재 해주시면 가능합니다.) (색감작업은 테일리티 유료 필름 결제 해주셔야 합니다.)

▶️ 파일명 - 요청사항 :`;

export const FILE_TYPES = [".raw", ".jpeg", ".jpg", ".cr2", ".cr3", ".heic"];

export const UPLOAD_LIMITS = {
  PHOTOS: 50,
  REFERENCE: 1,
};

export const MESSAGES = {
  UPLOAD_SUCCESS: (fileName) =>
    `${fileName} 파일이 성공적으로 업로드되었습니다.`,
  UPLOAD_ERROR: (fileName) => `${fileName} 파일 업로드에 실패했습니다.`,
  INVALID_FILE_TYPE: "지원하지 않는 파일 형식입니다",
  ORDER_SUCCESS: (orderId) =>
    `✅ 주문이 성공적으로 저장되었습니다! 주문 ID: ${orderId}`,
  ORDER_FAIL: "❌ 주문 저장 실패",
  SERVER_ERROR: "🚨 서버 오류",
  NO_FILES: "업로드할 파일이 없습니다.",
};
