import React from "react";
import { Modal, Button, Typography, Space, Flex, Input } from "antd";
import { MdAttachFile } from "react-icons/md";
import { theme } from "../../utils/theme";

const { Title, Paragraph } = Typography;

const RequestForm = ({ setComment }) => {
  return (
    <Flex vertical gap="middle">
      <Space>
        <Space>
          <Typography.Title
            level={4}
            style={{
              margin: "0 0 3px 0",
              color: theme.colors.label,
              fontFamily: "GumiRomanceTTF",
              fontWeight: 300,
            }}
          >
            Requests fill in
          </Typography.Title>
          <Typography style={{ fontFamily: "GumiRomanceTTF" }}>
            요청사항 작성
          </Typography>
        </Space>
      </Space>

      <div
        style={{
          padding: "20px",
          paddingBottom: "48px",
          border: "1px solid #C0EBFF",
          position: "relative",
          backgroundColor: "white",
          borderRadius: "16px",
        }}
      >
        <Paragraph
          style={{
            color: "black",
            fontFamily: "GumiRomanceTTF",
          }}
        >
          <Flex vertical gap="large">
            <li style={{ whiteSpace: "pre-line" }}>
              좌우에 대한 기준은 모니터를 바라 봤을때의 기준입니다. (인물 기준이
              아닙니다!)
            </li>
            <li style={{ whiteSpace: "pre-line" }}>
              요청사항 기재 시 꼭 정확히 원하시는 부분을 말씀해주시면 도움이
              많이 됩니다!
              <br />
              <span style={{ paddingLeft: "1em" }}>
                ㄴ 자연스럽게 해주세요 ▶️ 양쪽 광대를 넣어주시고, 얼굴 길이를
                줄여주세요!
              </span>
            </li>
            <li style={{ whiteSpace: "pre-line" }}>
              주문 상품과는 다른 요청사항 기재 시 적용되지 않습니다. 꼭 주문하신
              상품에 맞는 요청사항만 기재 부탁 드리겠습니다!
              <br />
              <span style={{ paddingLeft: "1em" }}>
                ex) [피부] 주문 ▶️ [체형][색감][합성]에 대한 요청사항 적용 X
              </span>
            </li>
            <li style={{ whiteSpace: "pre-line" }}>
              [작업 접수] 후 요청사항 추가는 불가합니다! 이후 재수정으로 접수가
              가능하니,
              <br />
              <span style={{ paddingLeft: "1em" }}>
                작업 접수 전 꼭 확인 부탁 드립니다
              </span>
            </li>
            <li style={{ whiteSpace: "pre-line" }}>
              보정강도
              <br />
              <span style={{ paddingLeft: "1em" }}>(약,중,강) :</span>
              <br />
              <span style={{ paddingLeft: "1em" }}>전체사진 요청사항:</span>
              <br />
              <span style={{ paddingLeft: "1em" }}>신랑 : 신부 :</span>
              <br />
              <span style={{ paddingLeft: "1em" }}>
                개별 추가 요청사항 (파일명 : 요청사항)
              </span>
            </li>
          </Flex>
        </Paragraph>
      </div>

      <Input.TextArea
        style={{ backgroundColor: "#f1f1f1", minHeight: 320 }}
        autoSize={false}
        onChange={(e) => setComment(e.target.value)}
        defaultValue={`1. 보정강도 (약,약중,중,중강,강)
(추천 : 자연스러운 보정을 위해 생각하시는 보정단계보다 한단계 낮춰서 진행 하시는걸 추천드립니다 ! )

▶️

2. 전체 사진 공통 요청사항

신랑 :
신부 :

3. 개별 추가 요청사항
(밝기 조절은 기재 해주시면 가능합니다.) (색감작업은 원츠웨딩 유료 필름 결제 해주셔야 합니다.)

▶️ 파일명 - 요청사항 :`}
      />
    </Flex>
  );
};

export default RequestForm;
