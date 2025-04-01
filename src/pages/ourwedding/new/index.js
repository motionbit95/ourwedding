import {
  Checkbox,
  ConfigProvider,
  Divider,
  Flex,
  Form,
  Grid,
  Input,
  Select,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function NewRequest(props) {
  const navigation = useNavigate();
  const [user, setUser] = useState();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [selectedValue, setSelectedValue] = useState([]);
  const formattedDate = new Date()
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/. /g, " / ")
    .replace(".", "");

  useEffect(() => {
    axios
      .post(
        "/auth/verify-token",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.user);
        setUser(response.data.user);
      })
      .catch((error) => {
        navigation("/ourwedding/login", { state: { nextPage: "new" } });
      });
  }, []);

  const handleChange = (checkedValues) => {
    if (selectedValue.includes(checkedValues)) {
      setSelectedValue(
        selectedValue.filter((value) => value !== checkedValues)
      );
    } else {
      setSelectedValue([...selectedValue, checkedValues]);
    }
  };

  const fontSize = screens.xs
    ? "18px"
    : screens.sm
    ? "32px"
    : screens.md
    ? "48px"
    : screens.lg
    ? "64px"
    : "20px";

  const paddingBlock = screens.xs
    ? "60px"
    : screens.sm
    ? "80px"
    : screens.md
    ? "100px"
    : screens.lg
    ? "120px"
    : "20px";

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            labelColor: "#4F3415",
            labelFontSize: "16px",
            labelColonMarginInlineEnd: "10vw",
          },
          Checkbox: {
            colorPrimary: "rgba(110, 134, 95, 1)",
            colorBgContainer: "rgba(110, 134, 95, 0.3)",
            colorBorder: "#d9d9d9",
            colorPrimaryHover: "rgba(110, 134, 95, 0.3)",
            controlInteractiveSize: 20,
          },
        },
      }}
    >
      <Flex vertical>
        <Typography.Title
          level={screens.lg ? 1 : 2}
          style={{ color: "rgba(62, 83, 49, 1)", marginLeft: "60px" }}
        >
          주문자 정보(신규)
        </Typography.Title>
        <div
          style={{
            height: "16px",
            backgroundColor: "rgba(164, 121, 72, 0.3)",
            width: screens.lg ? "360px" : "280px",
            marginTop: screens.lg ? "-36px" : "-28px",
          }}
        />
      </Flex>
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 12 }}
        style={{ paddingBlock, paddingInline: "20px" }}
      >
        <Flex gap={screens.lg ? "large" : "meddle"} vertical>
          <Form.Item
            label={<strong>{"(자동) 주문자 성함 / 아이디"}</strong>}
            colon={false}
          >
            <Input
              variant="underlined"
              readOnly
              value={`${user?.user_name} / ${user?.naver_id}`}
            />
          </Form.Item>
          <Form.Item
            label={<strong>{"(자동) 접수 날짜"}</strong>}
            colon={false}
          >
            <Input variant="underlined" readOnly value={`${formattedDate}`} />
          </Form.Item>
          <Form.Item
            label={<strong>{"상품주문번호"}</strong>}
            colon={false}
            help={"ㄴ * 오타없이 꼭 정확한 상품 주문번호 기재 바랍니다. *"}
          >
            <Input variant="underlined" />
          </Form.Item>

          <Form.Item label={<strong>{"보정등급"}</strong>} colon={false}>
            <Select placeholder={"보정등급을 선택해주세요."}>
              <Select.Option>S 샘플 (4일이내)</Select.Option>
              <Select.Option>1 씨앗 (7일이내)</Select.Option>
              <Select.Option>2 새싹 (4일이내)</Select.Option>
              <Select.Option>3 나무 (2일이내)</Select.Option>
              <Select.Option># 숲 (3시간이내)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={<strong>{"사진 장수"}</strong>} colon={false}>
            <Input
              type="number"
              variant="underlined"
              placeholder="5+1 서비스 장수 포함하여 기재 바랍니다"
            />
          </Form.Item>
          <Form.Item label={<strong>{"추가 결제 여부"}</strong>} colon={false}>
            <div className="checkbox-group">
              <Checkbox.Group onChange={handleChange} defaultValue={[]}>
                <div className="checkbox-item">
                  <Checkbox value="film">
                    <span className="checkbox-label">
                      <span className="checkbox-title">필름 추가</span>
                      <span className="checkbox-price">+1,500원</span>
                    </span>
                  </Checkbox>
                </div>
                <div className="checkbox-item">
                  <Checkbox value="person">
                    <span className="checkbox-label">
                      <span className="checkbox-title">인원 추가</span>
                      <span className="checkbox-price">+2,000원</span>
                    </span>
                  </Checkbox>
                </div>
                <div className="checkbox-item">
                  <Checkbox value="edit">
                    <span className="checkbox-label">
                      <span className="checkbox-title">합성</span>
                      <span className="checkbox-price">+2,000원</span>
                    </span>
                  </Checkbox>
                </div>
              </Checkbox.Group>
            </div>
          </Form.Item>
        </Flex>
      </Form>

      <Divider
        plain
        style={{
          color: "#A79166",
          fontFamily: "Rufina",
          fontWeight: 400,
          fontSize,
          paddingTop: paddingBlock,
        }}
      >
        Our wedding
      </Divider>

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
        }
      `}</style>
    </ConfigProvider>
  );
}

export default NewRequest;
