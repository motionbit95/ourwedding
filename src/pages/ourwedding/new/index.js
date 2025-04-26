import React, { useEffect, useState, useCallback } from "react";
import { ConfigProvider, Flex, Button, Spin, message } from "antd";
import { BsCaretRightFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

import OrderForm from "../components/order/OrderForm";
import PhotoUpload from "../components/order/PhotoUpload";
import RequestForm from "../components/order/RequestForm";
import CautionSection from "../components/order/CautionSection";
import CustomDivider from "../components/common/Divider";
import { theme } from "../utils/theme";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../../../firebaseConfig";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * NewRequest Component
 *
 * This component handles the creation of new wedding photo requests.
 * It includes form submission, photo uploads, and user verification.
 */
function NewRequest() {
  const navigation = useNavigate();
  const [user, setUser] = useState();
  const [isLoading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [photoList, setPhotoList] = useState([]);
  const [referenceFileList, setReferenceFileList] = useState([]);
  const [comment, setComment] = useState("");

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

  const getDurationByGrade = (grade) => {
    const GRADES = [
      ["S 샘플", "4일이내"],
      ["1 씨앗", "7일이내"],
      ["2 새싹", "4일이내"],
      ["3 나무", "2일이내"],
      ["# 숲", "3시간이내"],
    ];
    const found = GRADES.find(([g]) => g === grade);
    return found?.[1];
  };

  const getDeadline = (duration) => {
    const now = dayjs();

    if (!duration) return "알 수 없음";

    if (duration.includes("일")) {
      const days = parseInt(duration);
      return now.add(days, "day").format("YYYY-MM-DD");
    } else if (duration.includes("시간")) {
      const hours = parseInt(duration);
      return now.add(hours, "hour").format("YYYY-MM-DD HH:mm");
    }
    return "알 수 없음";
  };

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

      // 수정: originalFileName downloadLink를 포함한 객체 배열
      const downloadLinkAddr = file.map((f) => ({
        originalFileName: f.originalFileName,
        downloadLink: f.downloadLink,
      }));

      console.log(file, referenceFile);

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
        showMessage("success", `주문이 성공적으로 저장되었습니다! `);

        // navigation("/result/ourwedding");
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

  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFiles = async (fileList, userName, userId, onProgress) => {
    try {
      const total = fileList.length; // 참고 사진 포함
      let completed = 0;

      const uploadPromises = fileList.map(async (file, index) => {
        const fileObj = file.originFileObj;
        const fileExtension = fileObj.name.substring(
          fileObj.name.lastIndexOf(".")
        );
        const rawFileName = `아워웨딩_신규_${userName}_${userId}_${
          index + 1
        }${fileExtension}`;
        const encodedFileName = encodeURIComponent(rawFileName);

        const storageRef = ref(storage, `temp/${encodedFileName}`);

        await uploadBytes(storageRef, fileObj);
        const downloadURL = await getDownloadURL(storageRef);

        const res = await axios.post(`${API_URL}/upload`, {
          fileUrl: downloadURL,
          originalFileName: encodedFileName,
        });

        await deleteObject(storageRef);

        completed++;
        onProgress(Math.round((completed / total) * 70));

        return res.data;
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error("파일 업로드 실패:", error.message);
      throw error;
    }
  };

  const uploadReferenceFiles = async (fileList, userName, userId) => {
    try {
      if (fileList.length === 0) {
        throw new Error("업로드할 파일이 없습니다.");
      }

      const fileObj = fileList[0].originFileObj;
      const fileExtension = fileObj.name.substring(
        fileObj.name.lastIndexOf(".")
      );
      const rawFileName = `아워웨딩_신규_${userName}_${userId}_참고${fileExtension}`;
      const encodedFileName = encodeURIComponent(rawFileName);

      const storageRef = ref(storage, `temp/${encodedFileName}`);

      // 1. Firebase Storage에 업로드
      await uploadBytes(storageRef, fileObj);

      // 2. 다운로드 URL 가져오기
      const downloadURL = await getDownloadURL(storageRef);

      // 3. 백엔드에 전송 (URL 방식)
      const res = await axios.post(`${API_URL}/upload`, {
        fileUrl: downloadURL,
        originalFileName: encodedFileName,
      });

      // 4. 업로드 성공 시 Firebase Storage 파일 삭제
      await deleteObject(storageRef);
      console.log("참고 파일 업로드 및 삭제 성공:", res.data);

      return res.data;
    } catch (error) {
      console.error("참고 파일 업로드 실패:", error.message);
      throw error;
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, redirecting to login");
        navigation("/ourwedding/login", { state: { nextPage: "new" } });
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
          receivedDate: new Date().toLocaleString(),
        }));
      } catch (error) {
        console.log("Token verification failed, redirecting to login");
        localStorage.removeItem("token");
        navigation("/ourwedding/login", { state: { nextPage: "new" } });
      }
    };
    verifyToken();
  }, [navigation]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            labelColor: theme.colors.text,
            labelFontSize: "16px",
            labelColonMarginInlineEnd: "10vw",
          },
          Checkbox: {
            colorPrimary: "#6E865F",
            colorBgContainer: "rgba(110, 134, 95, 0.3)",
            colorBorder: "#d9d9d9",
            colorPrimaryHover: "rgba(110, 134, 95, 0.3)",
            controlInteractiveSize: 20,
          },
          Button: {
            colorPrimary: "#C9D2B9",
            colorPrimaryHover: "#6E865F",
            colorTextLightSolid: theme.colors.text,
            colorPrimaryActive: "#ADA69E",
          },
          Upload: {
            colorPrimary: "#C9D2B9",
            colorPrimaryHover: "#6E865F",
          },
        },
      }}
    >
      {contextHolder}
      <div
        style={{
          display: isLoading ? "flex" : "none",
          position: "fixed",
          zIndex: 99,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          width: "100%",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Flex
          vertical
          gap={"large"}
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: 10,
            padding: "5vh",
          }}
        >
          <Spin size="large" percent={uploadProgress} />
          <strong
            style={{
              color: "#888",
              fontSize: theme.typography.fontSize.md,
              whiteSpace: "pre-line",
              textAlign: "center",
            }}
          >{`업로드 중입니다\n잠시만 기다려주세요.`}</strong>
        </Flex>
      </div>

      <Flex vertical style={{ alignItems: "center", justifyContent: "center" }}>
        <OrderForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          handleCheckboxChange={handleCheckboxChange}
        />

        <CustomDivider text="Our wedding" />

        <Flex
          style={{
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <Flex vertical gap="large">
            <PhotoUpload
              title="사진 업로드"
              fileList={photoList}
              onChange={handlePhotoUpload}
              accept=".raw,.jpeg,.jpg,.cr2,.cr3,.heic"
              maxCount={formData.photoCount}
              showMessage={showMessage}
            />

            <PhotoUpload
              title="참고 사진 업로드"
              fileList={referenceFileList}
              onChange={handleReferenceUpload}
              maxCount={1}
              accept=".raw,.jpeg,.jpg,.cr2,.cr3,.heic"
              showUploadList={false}
            />

            <RequestForm setComment={setComment} />
          </Flex>
        </Flex>

        <CustomDivider text="Ourdrama" isBorder />

        <CautionSection
          checkedItems={checkedItems}
          handleCheck={handleCheck}
          setCheckedItems={setCheckedItems}
        />

        <Flex vertical>
          <Button
            onClick={handleFormUpload}
            htmlType="submit"
            icon={<BsCaretRightFill />}
            iconPosition="end"
            type="primary"
            disabled={checkedItems.filter((item) => item).length < 4}
            style={{
              width: "auto",
              paddingInline: "48px",
              alignSelf: "center",
              marginTop: "36px",
              marginBottom: 120,
            }}
          >
            업로드
          </Button>
        </Flex>
      </Flex>

      <style>
        @import
        url('https://fonts.googleapis.com/css2?family=Rufina:wght@400;700&display=swap');
      </style>

      <style jsx>{`
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .checkbox-item {
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .checkbox-item:hover {
          background-color: #e4e8e0;
        }

        .checkbox-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .checkbox-title {
          font-size: 16px;
          color: #333;
        }

        .checkbox-price {
          margin-left: 8px;
          font-size: 14px;
          color: #888;
          font-weight: 500;
        }

        :global(.ant-checkbox-wrapper) {
          width: 100%;
        }

        :global(.ant-checkbox) {
          width: 100%;
        }
      `}</style>
    </ConfigProvider>
  );
}

export default NewRequest;
