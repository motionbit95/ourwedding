import React from "react";
import { Form, Input, Select, Checkbox, Typography, Flex } from "antd";
import { theme } from "../../utils/theme";

const { Title } = Typography;

const OrderForm = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleCheckboxChange,
}) => {
  const GRADES = [
    ["S 샘플", "4일이내"],
    ["1 씨앗", "7일이내"],
    ["2 새싹", "4일이내"],
    ["3 나무", "2일이내"],
    ["# 숲", "3시간이내"],
  ];

  const ADDITIONAL_OPTIONS = [
    ["film", "필름 추가", 1500],
    ["person", "인원 추가", 2000],
    ["edit", "합성", 2000],
  ];

  return (
    <Form
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{
        padding: theme.spacing.lg,
        paddingBlock: theme.spacing.xxl,
      }}
    >
      <div style={{ position: "relative", marginBottom: theme.spacing.xl }}>
        <Title
          level={2}
          style={{
            color: theme.colors.primary,
            margin: 0,
            paddingLeft: theme.spacing.xl,
            display: "inline-block",
          }}
        >
          주문자 정보(신규)
        </Title>
        <div
          style={{
            height: "16px",
            backgroundColor: theme.colors.divider,
            opacity: 0.3,
            width: "300px",
            position: "absolute",
            top: "50%",
            zIndex: -1,
          }}
        />
      </div>

      <Flex vertical gap={"middle"} style={{ padding: "2vh" }}>
        <Form.Item
          label={
            <strong style={{ color: theme.colors.label }}>
              {"(자동) 주문자 성함 / 아이디"}
            </strong>
          }
          colon={false}
          style={{ marginBottom: theme.spacing.lg }}
        >
          <Input
            variant="underlined"
            readOnly
            value={`${formData.userName} / ${formData.userId}`}
            style={{
              borderBottom: `1px solid ${theme.colors.border}`,
              color: theme.colors.text,
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <strong style={{ color: theme.colors.label }}>
              {"(자동) 접수 날짜"}
            </strong>
          }
          colon={false}
          style={{ marginBottom: theme.spacing.lg }}
        >
          <Input
            variant="underlined"
            readOnly
            value={formData.receivedDate}
            style={{
              borderBottom: `1px solid ${theme.colors.border}`,
              color: theme.colors.text,
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <strong style={{ color: theme.colors.label }}>
              {"상품주문번호"}
            </strong>
          }
          colon={false}
          help={
            <div style={{ color: theme.colors.error }}>
              {"ㄴ * 오타없이 꼭 정확한 상품 주문번호 기재 바랍니다. *"}
            </div>
          }
          style={{ marginBottom: theme.spacing.lg }}
        >
          <Input
            name="orderNumber"
            variant="underlined"
            value={formData.orderNumber}
            onChange={handleInputChange}
            style={{
              borderBottom: `1px solid ${theme.colors.border}`,
              color: theme.colors.text,
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <strong style={{ color: theme.colors.label }}>{"사진 장수"}</strong>
          }
          colon={false}
          help={
            <div style={{ color: theme.colors.error }}>
              {"ㄴ * 5+1 서비스 장수 포함하여 기재 바랍니다. *"}
            </div>
          }
          style={{ marginBottom: theme.spacing.lg }}
        >
          <Input
            name="photoCount"
            variant="underlined"
            value={formData.photoCount}
            onChange={handleInputChange}
            type="number"
            style={{
              borderBottom: `1px solid ${theme.colors.border}`,
              color: theme.colors.text,
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <strong style={{ color: theme.colors.label }}>{"보정등급"}</strong>
          }
          colon={false}
          style={{ marginBottom: theme.spacing.lg }}
        >
          <Select
            value={formData.grade}
            onChange={handleSelectChange}
            style={{ width: "100%" }}
          >
            {GRADES.map(([grade, time]) => (
              <Select.Option key={grade} value={grade}>
                {`${grade} (${time})`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={
            <strong style={{ color: theme.colors.label }}>
              {"추가 결제 여부"}
            </strong>
          }
          colon={false}
        >
          <div
            className="checkbox-group"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.sm,
            }}
          >
            <Checkbox.Group
              onChange={handleCheckboxChange}
              value={formData.additionalOptions}
            >
              {ADDITIONAL_OPTIONS.map(([value, title, price]) => (
                <div
                  key={value}
                  className="checkbox-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: theme.spacing.sm,
                    borderRadius: "4px",
                  }}
                >
                  <Checkbox value={value}>
                    <span
                      className="checkbox-label"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        color: theme.colors.text,
                      }}
                    >
                      <span className="checkbox-title">{title}</span>
                      <span
                        className="checkbox-price"
                        style={{
                          color: theme.colors.primary,
                          fontWeight: "bold",
                        }}
                      >
                        +{price.toLocaleString()}원
                      </span>
                    </span>
                  </Checkbox>
                </div>
              ))}
            </Checkbox.Group>
          </div>
        </Form.Item>
      </Flex>
    </Form>
  );
};

export default OrderForm;
