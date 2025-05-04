import React, { useEffect, useState } from "react";
import { Typography, Checkbox, Flex, Space } from "antd";
import { theme } from "../../utils/theme";

const { Text } = Typography;

const CAUTION_ITEMS = [
  {
    text: "주문 내역과 주문자 정보를 올바르게 입력하셨을까요?",
  },
  {
    text: (
      <>
        주문 장수에 맞춰 올바르게 파일 업로드 하셨을까요?
        <br />
        <span style={{ paddingLeft: "1em" }}>
          (작업 접수와 함께 요청사항과 파일은 변동 불가합니다!)
        </span>
      </>
    ),
  },
  {
    text: (
      <>
        요청사항 및 작업 여부 완료되었을까요?
        <br />
        <span style={{ paddingLeft: "1em" }}>
          (요청사항 중 불가능 여부에 대해서 사전에 연락 드리지 않으니, 꼭 접수
          전 채팅으로 확인 부탁드립니다!)
        </span>
      </>
    ),
  },
  {
    text: (
      <>
        상세페이지내 작업 기한, 보관 기한 체크 하셨을까요?
        <br />
        <span style={{ paddingLeft: "1em" }}>
          (신규/최근 재수정 보관 기한 : 접수일로부터 2주 간 보관되나 이후엔 파기
          되오니,
        </span>
        <br />
        <span style={{ paddingLeft: "1em" }}>
          개인적으로 꼭 보관해주시길 바랍니다!)
        </span>
      </>
    ),
  },
  {
    text: (
      <>
        샘플 진행 시
        <span style={{ paddingLeft: "0.25em" }}>
          마케팅 채널에 활용될 수 있다는 점 인지 하셨을까요?
        </span>
      </>
    ),
  },
  {
    text: (
      <>
        위의 내용을
        <span style={{ paddingLeft: "0.25em" }}>인지 하셨을까요?</span>
      </>
    ),
  },
];

const CautionSection = ({ checkedItems, handleCheck, setCheckedItems }) => {
  const [fontSize, setFontSize] = useState(theme.typography.fontSize.lg);

  useEffect(() => {
    const updateFontSize = () => {
      const width = window.innerWidth;
      if (width < 992) {
        setFontSize(theme.typography.fontSize.xxl);
      } else {
        setFontSize(theme.typography.fontSize.xxxl);
      }
    };

    // 초기 설정
    updateFontSize();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener("resize", updateFontSize);

    // cleanup
    return () => {
      window.removeEventListener("resize", updateFontSize);
    };
  }, []);

  return (
    <Flex vertical style={{ width: "100%" }}>
      <Flex
        vertical
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingBlock: theme.spacing.xl,
        }}
      >
        <Flex
          style={{
            paddingInline: theme.spacing.lg,
            paddingBlock: theme.spacing.xl,
          }}
        >
          <Flex
            vertical
            style={{
              maxWidth: "900px",
            }}
            gap="48px"
          >
            {CAUTION_ITEMS.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 40px",
                  alignItems: "center",
                  columnGap: "36px",
                  whiteSpace: "pre-line",
                  fontSize: "14px",
                  color: theme.colors.text,
                  fontFamily: "GumiRomanceTTF",
                }}
              >
                <li>{item.text}</li>
                <Checkbox
                  checked={checkedItems[index]}
                  onChange={() => handleCheck(index)}
                />
              </div>
            ))}
          </Flex>
        </Flex>
        <Flex
          gap={10}
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            marginBottom: theme.spacing.md,
            backgroundImage: `url(${require("../../asset/line.png")})`,
            backgroundRepeat: "repeat",
            backgroundSize: "contain", // 또는 'contain', 'auto' 등 조정 가능
            backgroundPosition: "center", // ⬅️ 추가된 부분
            height: "12px",
          }}
        >
          <Space style={{ backgroundColor: "#EFFAFF", paddingInline: "16px" }}>
            <Text
              style={{
                padding: 4,
                fontFamily: "GumiRomanceTTF",
                color: "#FC9533",
              }}
            >
              • 위의 내용을 모두 숙지했습니다{" "}
            </Text>
            <Checkbox
              onChange={(e) =>
                setCheckedItems(
                  Array(CAUTION_ITEMS.length).fill(e.target.checked)
                )
              }
              checked={checkedItems.every(Boolean)}
            />
          </Space>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default CautionSection;
