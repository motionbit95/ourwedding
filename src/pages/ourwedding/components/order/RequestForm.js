import React from "react";
import { Modal, Button, Typography, Space, Flex, Input } from "antd";
import { MdAttachFile } from "react-icons/md";
import { theme } from "../../utils/theme";

const { Title, Paragraph } = Typography;

const RequestForm = ({ setComment }) => {
  return (
    <Flex vertical gap="middle">
      <Space>
        <Title level={4} style={{ margin: "0 0 3px 0" }}>
          요청사항 작성
        </Title>
        <MdAttachFile size={18} />
      </Space>

      <div
        style={{
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.background,
        }}
      >
        <Paragraph style={{ color: theme.colors.text }}>
          <Flex vertical gap="large">
            <li style={{ whiteSpace: "pre-line" }}>
              {`상단 [요청사항] 클릭 시 작성해야 될 텍스트가 복사되니, 텍스트를 기반으로 요청사항 작성해주세요.`}
            </li>
            <li style={{ whiteSpace: "pre-line" }}>
              {`상세페이지 기본수정사항에 있는 부분은 자동으로 적용되는 사항들이니
               요청사항 기재 시 기본수정사항 제외한 후 추가적으로 원하시는 부분을 기재 해주세요.`}
            </li>
            <li style={{ whiteSpace: "pre-line" }}>
              {`요청사항 기재 시 좌우에 대한 기준은 모니터를 바라봤을때의 기준입니다. (모니터 속 인물 기준 X)`}
            </li>
            <li style={{ whiteSpace: "pre-line" }}>
              {`요청사항 기재 시 꼭 모호한 표현이 아닌, 정확한 부분에 대한 보정 방향을 기재해주세요.
       자연스럽게  (X)   ➡️    얼굴 전체 크기를 줄여주세요.  (O)
       예쁘게         (X)    ➡️    눈을 밑쪽으로 키워주세요.        (O) 
       어려보이게  (X)    ➡️    중안부를 짧게 해주세요.           (O)
       착해보이게  (X)    ➡️    왼쪽 입꼬리를 올려주세요.       (O)`}
            </li>
            <li style={{ whiteSpace: "pre-line" }}>
              {`(2인 기준) 전체  요청사항(10가지) / 개별 요청사항(5가지) 초과 시 추가금 있습니다.`}
            </li>
            <li style={{ whiteSpace: "pre-line" }}>
              {`밝기 부분은 요청사항 기재 시 적용 가능합니다. 다만 색감 요청 시에는 필름 결제 후 요청 가능합니다.`}
            </li>
            <li style={{ whiteSpace: "pre-line" }}>
              {`접수 이후 요청사항 추가는 불가능하니, 빠진 부분이 없는지 재차 확인 부탁 드립니다.`}
            </li>
          </Flex>
        </Paragraph>
      </div>

      <Input.TextArea
        style={{ backgroundColor: "#f1f1f1", minHeight: 300 }}
        autoSize={true}
        onChange={(e) => setComment(e.target.value)}
        defaultValue={`1. 보정강도 (약,약중,중,중강,강)
(추천 : 자연스러운 보정을 위해 생각하시는 보정단계보다 한단계 낮춰서 진행 하시는걸 추천드립니다 ! )

▶️
2. 전체 사진 공통 요청사항

신랑 :
신부 :
3. 개별 추가 요청사항
(밝기 조절은 기재 해주시면 가능합니다.) (색감작업은 아워웨딩 유료 필름 결제 해주셔야 합니다.)

▶️ 파일명 - 요청사항 :`}
      />
    </Flex>
  );
};

export default RequestForm;
