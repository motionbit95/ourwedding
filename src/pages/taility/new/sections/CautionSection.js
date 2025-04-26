import React, { useEffect, useState } from "react";
import { Flex, Typography, Checkbox, Button, Image } from "antd";
import { BsCaretRight } from "react-icons/bs";
import { theme } from "../../utils/theme"; // 사용자 테마 유틸
import sImage from "../../../../asset/s.png"; // 이미지 경로

const { Text } = Typography;

const CAUTION_ITEMS = [
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

const CautionSection = ({
  checkedItems,
  handleCheck,
  setCheckedItems,
  handleFormUpload,
}) => {
  const [fontSize, setFontSize] = useState(theme.typography.fontSize.lg);

  useEffect(() => {
    const updateFontSize = () => {
      const width = window.innerWidth;
      if (width < 992) {
        setFontSize(theme.typography.fontSize.xl);
      } else {
        setFontSize(theme.typography.fontSize.xxl);
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
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginBottom: -parseInt(fontSize.replace("px")),
          paddingInline: theme.spacing.lg,
          marginTop: "10vh",
        }}
      >
        <Flex
          style={{
            width: "100%",
            maxWidth: "900px",
          }}
        >
          <Typography
            style={{
              zIndex: 99,
              paddingInline: "20px",
              display: "inline",
              fontFamily: "Castoro Titling",
              fontWeight: 400,
              fontSize: parseInt(fontSize.replace("px")) * 1.3,
              backgroundColor: "white",
            }}
          >
            Caution
          </Typography>
        </Flex>
      </Flex>

      <Flex
        vertical
        style={{
          alignItems: "center",
          justifyContent: "center",
          borderBlock: "1px solid black",
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
            gap="24px"
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
                }}
              >
                <span>• {item.text}</span>
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
            backgroundColor: "rgba(255, 255, 255, 0.4)",
          }}
        >
          <Text style={{ padding: 4 }}>• 위의 내용을 모두 숙지했습니다 </Text>
          <Checkbox
            onChange={(e) =>
              setCheckedItems(
                Array(CAUTION_ITEMS.length).fill(e.target.checked)
              )
            }
            checked={checkedItems.every(Boolean)}
          />
        </Flex>
      </Flex>

      <Flex
        vertical
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginTop: "36px",
        }}
      >
        <Image
          src={sImage}
          preview={false}
          style={{ width: 30, height: "auto" }}
        />
        <div
          style={{
            width: 1,
            height: 50,
            backgroundColor: "black",
            marginTop: 10,
          }}
        />
        <Button
          onClick={handleFormUpload}
          htmlType="submit"
          icon={<BsCaretRight />}
          iconPosition="end"
          type="primary"
          disabled={!checkedItems.every(Boolean)}
          style={{
            width: "auto",
            paddingInline: "48px",
            marginBottom: theme.spacing.xl,
            fontFamily: "Baskervville",
          }}
        >
          UPLOAD
        </Button>
      </Flex>
    </Flex>
  );
};

export default CautionSection;
