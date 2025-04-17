import { Button, Flex, InputNumber, Space } from "antd";
import React from "react";

function Workable(props) {
  return (
    <Flex
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%", // 부모 높이에 맞춰야 함
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "16px",
        }}
      >
        <h3>익일 작업 가능한 장수</h3>
        <Space>
          <InputNumber addonAfter={"장"} />
          <Button>완료</Button>
        </Space>
      </div>
    </Flex>
  );
}

export default Workable;
