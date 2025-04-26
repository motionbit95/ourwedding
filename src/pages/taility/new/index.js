import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Flex,
  Divider,
  Image,
  ConfigProvider,
  message,
  Spin,
  Grid,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import OrderForm from "./sections/OrderForm";
import PhotoUpload from "./sections/PhotoUpload";
import RequestForm from "./sections/RequestForm";
import CautionSection from "./sections/CautionSection";
import { GRADES, ADDITIONAL_OPTIONS, CAUTION_ITEMS } from "../constants";
import { customUpload } from "../utils/uploadUtils";
import { storage } from "../../../firebaseConfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import dayjs from "dayjs";

const API_URL = process.env.REACT_APP_API_URL;

const NewOrderPage = () => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const navigation = useNavigate();
  const [user, setUser] = useState();
  const [photoList, setPhotoList] = useState([]);
  const [referenceFileList, setReferenceFileList] = useState([]);
  const [comment, setComment] = useState();
  const [isLoading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [messageApi, contextHolder] = message.useMessage();

  const formattedDate = useMemo(() => {
    const now = new Date();
    const datePart = now
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, "-")
      .replace(/\./g, "");
    const timePart = now.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    return `${datePart} ${timePart}`;
  }, []);

  const [formData, setFormData] = useState({
    userName: user?.user_name || "",
    userId: user?.naver_id || "",
    receivedDate: formattedDate || "",
    orderNumber: "",
    grade: "",
    photoCount: 0,
    additionalOptions: [],
  });

  const showMessage = useCallback(
    (type, content) => {
      messageApi.open({
        type,
        content,
      });
    },
    [messageApi]
  );

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

  const handleCheck = useCallback((index) => {
    setCheckedItems((prev) => {
      const newCheckedItems = [...prev];
      newCheckedItems[index] = !newCheckedItems[index];
      return newCheckedItems;
    });
  }, []);

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

  const fontSize = useMemo(() => {
    if (screens.xs) return "28px";
    if (screens.sm) return "32px";
    if (screens.md) return "48px";
    if (screens.lg) return "64px";
    return "20px";
  }, [screens]);

  const paddingBlock = useMemo(() => {
    if (screens.xs) return "60px";
    if (screens.sm) return "80px";
    if (screens.md) return "100px";
    if (screens.lg) return "120px";
    return "20px";
  }, [screens]);

  const paddingBox = useMemo(() => {
    if (screens.xs) return "24px";
    if (screens.sm) return "32px";
    if (screens.md) return "40px";
    if (screens.lg) return "48px";
    return "20px";
  }, [screens]);

  const getDurationByGrade = (grade) => {
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
    setLoading(true);
    try {
      const file = await uploadFiles(
        photoList,
        formData.userName,
        formData.userId
      );
      const referenceFile = await uploadReferenceFiles(
        referenceFileList,
        formData.userName,
        formData.userId
      );
      const downloadLinkAddr = file.map((f) => f.downloadLink);
      const duration = getDurationByGrade(formData.grade);
      const deadline = getDeadline(duration);

      const order = {
        ...formData,
        photoDownload: downloadLinkAddr,
        referenceDownload: referenceFile?.downloadLink,
        company: "테일리티",
        division: formData.grade === "S 샘플" ? "샘플" : "신규",
        step: "접수완료",
        comment: comment,
        label: formData.grade === "S 샘플" ? "샘플" : "신규",
      };

      const { data } = await axios.post(`${API_URL}/order`, order, {
        headers: { "Content-Type": "application/json" },
      });

      if (data.success) {
        alert(`✅ 주문이 성공적으로 저장되었습니다! 주문 ID: ${data.orderId}`);
      } else {
        alert("❌ 주문 저장 실패");
      }
    } catch (error) {
      console.error("❌ 오류 발생:", error);
      alert("🚨 서버 오류");
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (fileList, userName, userId) => {
    try {
      const uploadPromises = fileList.map(async (file, index) => {
        const fileObj = file.originFileObj;
        const fileExtension = fileObj.name.substring(
          fileObj.name.lastIndexOf(".")
        );
        const rawFileName = `테일리티_신규_${userName}_${userId}_${
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
        return res.data;
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("❌ 파일 업로드 실패:", error.message);
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
      const rawFileName = `테일리티_신규_${userName}_${userId}_참고${fileExtension}`;
      const encodedFileName = encodeURIComponent(rawFileName);
      const storageRef = ref(storage, `temp/${encodedFileName}`);

      await uploadBytes(storageRef, fileObj);
      const downloadURL = await getDownloadURL(storageRef);
      const res = await axios.post(`${API_URL}/upload`, {
        fileUrl: downloadURL,
        originalFileName: encodedFileName,
      });

      await deleteObject(storageRef);
      return res.data;
    } catch (error) {
      console.error("❌ 참고 파일 업로드 실패:", error.message);
      throw error;
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.post(
          `${API_URL}/auth/verify-token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUser(response.data.user);
      } catch (error) {
        navigation("/taility/login", { state: { nextPage: "new" } });
      }
    };
    verifyToken();
  }, [navigation]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        userName: user.user_name || "",
        userId: user.naver_id || "",
      }));
    }
  }, [user]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            labelColor: "black",
            labelFontSize: "16px",
            labelColonMarginInlineEnd: "10vw",
          },
          Checkbox: {
            colorPrimary: "#000000",
            colorBgContainer: "#ffffff",
            colorBorder: "#555",
            colorPrimaryHover: "#8c8c8c",
            controlInteractiveSize: 20,
          },
          Button: {
            colorPrimary: "rgba(1, 1, 1, 1)",
            colorPrimaryHover: "rgba(180, 190, 170, 1)",
            colorTextLightSolid: "white",
            colorPrimaryActive: "#ADA69E",
            borderRadius: 0,
          },
          Upload: {
            colorPrimary: "rgba(201, 210, 185, 1)",
            colorPrimaryHover: "rgba(180, 190, 170, 1)",
          },
          Divider: {
            colorSplit: "black",
            lineWidth: 1,
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
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>

      <Flex vertical>
        <OrderForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          handleCheckboxChange={handleCheckboxChange}
          screens={screens}
          paddingBlock={paddingBlock}
        />

        <Divider
          plain
          style={{
            fontFamily: "Rufina",
            fontWeight: 400,
            fontSize,
            paddingTop: paddingBlock,
          }}
        >
          <Image src={require("../../../asset/s.png")} preview={false} />
        </Divider>

        <Flex
          vertical
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <PhotoUpload
            photoList={photoList}
            handlePhotoUpload={handlePhotoUpload}
            handleReferenceUpload={handleReferenceUpload}
            showMessage={showMessage}
            paddingBox={paddingBox}
          />
          <RequestForm setComment={setComment} paddingBox={paddingBox} />
        </Flex>

        <CautionSection
          checkedItems={checkedItems}
          handleCheck={handleCheck}
          handleFormUpload={handleFormUpload}
          fontSize={fontSize}
          paddingBox={paddingBox}
          paddingBlock={paddingBlock}
          setCheckedItems={setCheckedItems}
        />
      </Flex>

      <style>
        @import
        url('https://fonts.googleapis.com/css2?family=Aboreto&family=Baskervville:ital@0;1&family=Castoro+Titling&family=Linden+Hill:ital@0;1&display=swap');
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
          background-color: #f0f0f0;
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
          border: 2px solid #333;
          background-color: white;
          border-radius: 4px;
          transition: background-color 0.2s, border-color 0.2s;
        }

        :global(.ant-checkbox-checked) {
          background-color: #333;
          border-color: #333;
        }

        :global(.ant-checkbox-checked .ant-checkbox-inner) {
          background-color: #333;
          border-color: #333;
        }

        :global(.ant-checkbox-inner) {
          width: 20px;
          height: 20px;
          background-color: white;
          border: 2px solid #333;
          border-radius: 4px;
          transition: background-color 0.2s, border-color 0.2s;
        }

        :global(.ant-checkbox-checked .ant-checkbox-inner) {
          background-color: #333;
          border-color: #333;
        }
      `}</style>
    </ConfigProvider>
  );
};

export default NewOrderPage;
