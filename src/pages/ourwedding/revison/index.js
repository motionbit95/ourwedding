import React, { useEffect, useState, useCallback } from "react";
import { ConfigProvider, Flex, Button, Spin, message } from "antd";
import { BsCaretRightFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import OrderForm from "../components/order/OrderForm";
import PhotoUpload from "../components/order/PhotoUpload";
import RequestForm from "../components/order/RequestForm";
import CautionSection from "../components/order/CautionSection";
import CustomDivider from "../components/common/Divider";
import { theme } from "../utils/theme";
import { useResponsiveStyles } from "../hooks/useResponsiveStyles";
import { GRADES, ADDITIONAL_OPTIONS, CAUTION_ITEMS } from "../constants";
import {
  getDurationByGrade,
  getDeadline,
  getFormattedDate,
} from "../utils/dateUtils";
import { uploadFiles, uploadReferenceFiles } from "../utils/fileUtils";

const API_URL = process.env.REACT_APP_API_URL;

function RevisionRequest() {
  const navigation = useNavigate();
  const [user, setUser] = useState();
  const [isLoading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState([false, false, false]);
  const [photoList, setPhotoList] = useState([]);
  const [referenceFileList, setReferenceFileList] = useState([]);
  const [comment, setComment] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const { fontSize, paddingBlock, paddingBox } = useResponsiveStyles();

  const [formData, setFormData] = useState({
    userName: user?.user_name || "",
    userId: user?.naver_id || "",
    receivedDate: "",
    orderNumber: "",
    photoCount: 0,
    grade: "",
    additionalOptions: [],
  });

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

  const handleCheck = useCallback((index) => {
    setCheckedItems((prev) => {
      const newCheckedItems = [...prev];
      newCheckedItems[index] = !newCheckedItems[index];
      return newCheckedItems;
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, grade: value }));
  };

  const handleCheckboxChange = (checkedValues) => {
    setFormData((prev) => ({ ...prev, additionalOptions: checkedValues }));
  };

  const handlePhotoUpload = useCallback(
    ({ file, fileList }) => {
      if (file.status === "done") {
        showMessage(
          "success",
          `${file.name} 사진이 성공적으로 업로드되었습니다.`
        );
      } else if (file.status === "error") {
        showMessage("error", `${file.name} 사진 업로드에 실패했습니다.`);
      }
      setPhotoList(fileList);
    },
    [showMessage]
  );

  const handleReferenceUpload = useCallback(
    ({ file, fileList }) => {
      if (file.status === "done") {
        showMessage(
          "success",
          `${file.name} 참고 사진 파일이 업로드되었습니다.`
        );
      } else if (file.status === "error") {
        showMessage(
          "error",
          `${file.name} 참고 사진 파일 업로드에 실패했습니다.`
        );
      }
      setReferenceFileList(fileList);
    },
    [showMessage]
  );

  const handleFormUpload = async () => {
    if (parseInt(formData.photoCount) !== parseInt(photoList.length)) {
      showMessage("error", `사진 장수가 일치하지 않습니다!`);
      return;
    }

    setUploadProgress(0);
    setLoading(true);

    try {
      const duration = getDurationByGrade(formData.grade);
      const deadline = getDeadline(duration);

      const file = await uploadFiles(
        photoList,
        formData.userName,
        formData.userId,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      const referenceFile = await uploadReferenceFiles(
        referenceFileList,
        formData.userName,
        formData.userId
      );

      setUploadProgress(80);

      const downloadLinkAddr = file.map((f) => ({
        originalFileName: f.originalFileName,
        downloadLink: f.downloadLink,
      }));

      const order = {
        ...formData,
        photoDownload: downloadLinkAddr,
        referenceDownload: {
          originalFileName: referenceFile?.originalFileName,
          downloadLink: referenceFile?.downloadLink,
        },
        company: "아워웨딩",
        division: formData.grade === "S 샘플" ? "샘플" : "신규",
        step: "접수완료",
        comment,
        deadline,
      };

      setUploadProgress(90);

      const { data } = await axios.post(`${API_URL}/order`, order, {
        headers: { "Content-Type": "application/json" },
      });

      if (data.success) {
        setUploadProgress(100);
        showMessage("success", `주문이 성공적으로 저장되었습니다!`);
        navigation("/result/ourwedding");
      } else {
        showMessage("error", "주문 저장 실패");
      }
    } catch (error) {
      console.error("오류 발생:", error);
      showMessage("error", "서버 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, redirecting to login");
        navigation("/ourwedding/login", { state: { nextPage: "revision" } });
        return;
      }

      try {
        const response = await axios.post(
          `${API_URL}/auth/verify-token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const userData = response.data.user;
        setUser(userData);
        setFormData((prev) => ({
          ...prev,
          userName: userData.user_name || "",
          userId: userData.naver_id || "",
        }));
      } catch (error) {
        console.log("Token verification failed, redirecting to login");
        localStorage.removeItem("token"); // 토큰이 유효하지 않으면 삭제
        navigation("/ourwedding/login", { state: { nextPage: "revision" } });
      }
    };
    verifyToken();
  }, [navigation]);

  return (
    <ConfigProvider theme={theme}>
      {contextHolder}
      <Flex
        vertical
        align="center"
        style={{
          paddingBlock,
          paddingInline: "20px",
        }}
      >
        <Flex
          vertical
          gap="large"
          style={{
            maxWidth: "800px",
            width: "100%",
            padding: paddingBox,
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <OrderForm
            formData={formData}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            onCheckboxChange={handleCheckboxChange}
          />

          <CustomDivider />

          <PhotoUpload
            photoList={photoList}
            referenceFileList={referenceFileList}
            onPhotoUpload={handlePhotoUpload}
            onReferenceUpload={handleReferenceUpload}
          />

          <CustomDivider />

          <RequestForm
            comment={comment}
            setComment={setComment}
            checkedItems={checkedItems}
            onCheck={handleCheck}
          />

          <CustomDivider />

          <CautionSection items={CAUTION_ITEMS} />

          <Button
            type="primary"
            size="large"
            onClick={handleFormUpload}
            loading={isLoading}
            icon={<BsCaretRightFill />}
            style={{
              marginTop: "24px",
              width: "100%",
              height: "48px",
              fontSize: "16px",
            }}
          >
            주문하기
          </Button>
        </Flex>
      </Flex>
    </ConfigProvider>
  );
}

export default RevisionRequest;
