export const GRADES = [
  ["~4일", "기본"],
  ["~48시간", "추가금 : 1500원"],
];

export const ADDITIONAL_OPTIONS = [
  ["skin", "피부", 1500],
  ["body", "체형(+얼굴)", 2000],
  ["edit", "합성", 2000],
  ["filter", "필터", 2000],
];

export const CAUTION_ITEMS = [
  {
    text: `모든 작업 (신규/재수정/샘플) 전달은 주문 넣어주신 등급에 맞춰 전달 드리고 있습니다. 
      작업 완료 예상 시점은 진행사항에 표시되어 있으니 꼭 참고 부탁드립니다! 
      추가로 모든 고객님들께 공정하게 순차적으로 전송 드리고 있기에, 전송 기한을 앞당겨 발송 드리기 부분은 불가능하다는 점 안내 드립니다!`,
  },
  {
    text: (
      <>
        저희가 모든 요청사항들을 적용할 수 있음 좋겠지만, ai가 아닌 사람이
        일일이 작업을 진행 하다보니 불가능사항이 있을 수 밖에 없다는 점 너그러이
        양해 부탁 드리며,
        <span style={{ fontWeight: "bold" }}>
          {` 추가로 불가능한 요청사항이 있을 경우에는 메모로 남겨드리고 있으니, 꼭 참고 부탁드립니다! 
          ㄴ 재수정 신청 시 애매모호한 요청은 채팅으로 가능여부 확인 부탁드립니다.`}
        </span>
      </>
    ),
  },
  {
    text: (
      <>
        <span style={{ fontWeight: "bold" }}>
          {` 파일은 [접수 기한]으로부터 한달간만 보관된 후 파기처리 되오니 작업된 파일은 개인적으로 꼭 저장해주시길 바랍니다. 
               ㄴ 파기된 파일에 관해서는 책임지지 않습니다. `}
        </span>
        {`
        
        ex) 1차 보정본(25.01.01) -> 삭제처리(25.02.01)
        재수정본(25.01.05) -> 삭제처리(25.02.05)
        샘플(25.01.10) -> 삭제처리(25.02.10)`}
      </>
    ),
  },
];

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
