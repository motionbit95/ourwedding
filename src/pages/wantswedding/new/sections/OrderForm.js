import React from "react";
import { Form, Input, Select, Checkbox, Typography, Flex } from "antd";
import { theme } from "../../utils/theme";
import { ADDITIONAL_OPTIONS, GRADES } from "../../constants";
import { FONT } from "../../style_vars";

const { Title } = Typography;

const OrderForm = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleCheckboxChange,
}) => {
  return (
    <Form
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{
        padding: theme.spacing.lg,
        paddingBlock: theme.spacing.xxl,
        fontFamily: "GumiRomanceTTF",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Lilita+One&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          position: "relative",
          marginBottom: theme.spacing.xl,
          textAlign: "center",
        }}
      >
        <>
          <Typography
            style={{
              fontFamily: FONT.heading,
              fontSize: "8vw",
              whiteSpace: "nowrap",
              marginBottom: "-1rem",
              color: "white",
              WebkitTextStroke: "0.5px #2E4B50",
            }}
          >
            Order Information
          </Typography>
          <Typography
            style={{
              fontFamily: FONT.heading,
              whiteSpace: "nowrap",
              fontWeight: 300,
              fontSize: "8vw",
              color: "white",
              WebkitTextStroke: "0.5px #2E4B50",
            }}
          >
            (New)
          </Typography>

          <Typography
            style={{
              fontFamily: FONT.heading,
              fontSize: "4vw",
              whiteSpace: "nowrap",
              color: "#F2FFF2",
              WebkitTextStroke: "0.5px #4DA0FF",
            }}
          >
            Want's Wedding
          </Typography>
          <Typography
            style={{
              fontFamily: "GumiRomanceTTF",
              fontSize: "2vw",
              whiteSpace: "nowrap",
              color: "#006C92",
            }}
          >
            주문자정보입력
          </Typography>
        </>
      </div>

      <Flex vertical gap={"middle"} style={{ padding: "2vh" }}>
        <Form.Item
          label={
            <div
              style={{
                color: theme.colors.label,
                fontFamily: "GumiRomanceTTF",
              }}
            >
              {"(자동) 주문자 성함"}
            </div>
          }
          colon={false}
          style={{ marginBottom: theme.spacing.lg }}
        >
          <Input
            readOnly
            value={`${formData.userName}`}
            style={{
              color: theme.colors.label,
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <div
              style={{
                color: theme.colors.label,
                fontFamily: "GumiRomanceTTF",
              }}
            >
              {"(자동) 접수 날짜"}
            </div>
          }
          colon={false}
          style={{ marginBottom: theme.spacing.lg }}
        >
          <Typography
            value={formData.receivedDate}
            style={{
              color: theme.colors.label,
              fontFamily: "GumiRomanceTTF",
            }}
          >
            {formData.receivedDate}
          </Typography>
          <div
            style={{
              backgroundImage: `url(${require("../../asset/line.png")})`,
              backgroundRepeat: "repeat",
              backgroundSize: "contain", // 또는 'contain', 'auto' 등 조정 가능
              backgroundPosition: "center", // ⬅️ 추가된 부분
              height: "12px",
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <div
              style={{
                color: theme.colors.label,
                fontFamily: "GumiRomanceTTF",
              }}
            >
              {"네이버 아이디(자동)"}
            </div>
          }
          colon={false}
          style={{ marginBottom: theme.spacing.lg }}
        >
          <Input
            readOnly
            value={`${formData.userId}`}
            style={{
              color: theme.colors.label,
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <div
              style={{
                color: theme.colors.label,
                fontFamily: "GumiRomanceTTF",
              }}
            >
              {"상품주문번호"}
            </div>
          }
          colon={false}
          help={
            <div style={{ color: "#FF7B00DD" }}>
              {"ㄴ * 오타없이 꼭 정확한 상품 주문번호 기재 바랍니다. *"}
            </div>
          }
          style={{ marginBottom: theme.spacing.lg }}
        >
          <Input
            name="orderNumber"
            value={formData.orderNumber}
            onChange={handleInputChange}
            style={{
              color: theme.colors.text,
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <div
              style={{
                color: theme.colors.label,
                fontFamily: "GumiRomanceTTF",
              }}
            >
              {"등급"}
            </div>
          }
          colon={false}
          style={{ marginBottom: theme.spacing.lg }}
        >
          <Checkbox.Group
            onChange={handleCheckboxChange}
            value={formData.additionalOptions}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr", // 항상 2열
            }}
          >
            {GRADES.map(([grade, time]) => (
              <div
                key={grade}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: theme.spacing.sm,
                }}
              >
                <Checkbox value={grade} style={{ borderRadius: "50%" }}>
                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      color: theme.colors.text,
                      fontFamily: "GumiRomanceTTF",
                    }}
                  >
                    {`${time} (${grade})`}
                  </span>
                </Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        </Form.Item>

        <Form.Item
          label={
            <div
              style={{
                color: theme.colors.label,
                fontFamily: "GumiRomanceTTF",
              }}
            >
              {"상품"}
            </div>
          }
          colon={false}
        >
          <Checkbox.Group
            onChange={handleCheckboxChange}
            value={formData.additionalOptions}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr", // 항상 2열
              gap: theme.spacing.lg,
              backgroundImage: `url(${require("../../asset/grid.png")})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover", // 또는 'contain', 'auto' 등 조정 가능
              backgroundPosition: "center", // ⬅️ 추가된 부분
            }}
          >
            {ADDITIONAL_OPTIONS.map(([value, title, price]) => (
              <div
                key={value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: theme.spacing.sm,
                }}
              >
                <Checkbox value={value} style={{ borderRadius: "50%" }}>
                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      color: theme.colors.text,
                      fontFamily: "GumiRomanceTTF",
                    }}
                  >
                    <span>{title}</span>
                    <span>{price.toLocaleString()}won</span>
                  </span>
                </Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        </Form.Item>

        <Form.Item
          label={
            <div
              style={{
                color: theme.colors.label,
                fontFamily: "GumiRomanceTTF",
              }}
            >
              {"사진 장수"}
            </div>
          }
          colon={false}
          help={
            <div style={{ color: "#FF7B00DD" }}>
              {"ㄴ * 5+1 서비스 장수 포함하여 기재 바랍니다. *"}
            </div>
          }
          style={{ marginBottom: theme.spacing.lg }}
        >
          <Input
            name="photoCount"
            value={formData.photoCount}
            onChange={handleInputChange}
            type="number"
            style={{
              color: theme.colors.text,
            }}
          />
        </Form.Item>
      </Flex>
    </Form>
  );
};

export default OrderForm;
