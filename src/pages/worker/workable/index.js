import { Button, Flex, InputNumber, message, Space } from "antd";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL; // ✅ 환경 변수 사용

function Workable(props) {
  const [worker, setWorker] = useState();
  const [photoCount, setPhotoCount] = useState();

  const [messageApi, contextHolder] = message.useMessage();
  const showMessage = useCallback(
    (type, content) => {
      messageApi.open({
        type,
        content,
      });
    },
    [messageApi]
  );

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const token = localStorage.getItem("admin-token"); // 또는 sessionStorage.getItem("token")

        if (!token) {
          throw new Error("로그인 토큰이 없습니다.");
        }

        const response = await axios.get(`${API_URL}/admin/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return response.data.admin; // 관리자 정보 반환
      } catch (error) {
        console.error(
          "관리자 정보 조회 실패:",
          error.response?.data || error.message
        );
        throw error;
      }
    };

    fetchAdminInfo()
      .then((response) => {
        setWorker(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const onSubmit = () => {
    console.log(photoCount);
    axios
      .post(`${API_URL}/work`, {
        worker_id: worker.admin_id,
        photo_count: photoCount,
      })
      .then((response) => {
        console.log(response);
        showMessage("success", response.data.message);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Flex
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%", // 부모 높이에 맞춰야 함
      }}
    >
      {contextHolder}
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
          <InputNumber addonAfter={"장"} onChange={setPhotoCount} />
          <Button onClick={onSubmit}>완료</Button>
        </Space>
      </div>
    </Flex>
  );
}

export default Workable;
