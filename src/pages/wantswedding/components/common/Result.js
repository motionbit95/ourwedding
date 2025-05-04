import React from "react";
import { Button, Result } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const SubmitResult = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Result
      style={{
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        flexDirection: "column",
      }}
      status="success"
      title="사진 업로드를 완료하였습니다."
      extra={[
        <Button
          key="home"
          onClick={() => navigate(`/${location.pathname.split("/").pop()}`)}
        >
          처음으로
        </Button>,
        <Button key="back" onClick={() => navigate(-1)}>
          이전으로
        </Button>,
      ]}
    />
  );
};

export default SubmitResult;
