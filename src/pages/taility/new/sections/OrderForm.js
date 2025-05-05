import React from "react";
import { Flex, Typography, Form, Input, Select, Checkbox } from "antd";
import { theme } from "../../utils/theme";
import { GRADES, ADDITIONAL_OPTIONS } from "../../constants";

const OrderForm = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleCheckboxChange,
  screens,
  paddingBlock,
}) => {
  return (
    <Flex
      vertical
      style={{
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {screens.lg ? (
        <>
          <Typography
            style={{
              fontFamily: "Linden Hill",
              fontSize: "196px",
              whiteSpace: "nowrap",
              marginBottom: -96,
            }}
          >
            Order Information
          </Typography>
          <Typography
            style={{
              fontFamily: "Linden Hill",
              whiteSpace: "nowrap",
              fontWeight: 300,
              fontSize: "64px",
            }}
          >
            (New)
          </Typography>
        </>
      ) : (
        <>
          <Typography
            style={{
              fontFamily: "Linden Hill",
              fontSize: "15vw",
              whiteSpace: "nowrap",
              width: "100%",
              display: "block",
              textAlign: "center",
              transform: "translateX(-5vw)",
              position: "relative",
              marginBottom: "-8vw",
            }}
          >
            Order Information
          </Typography>
          <Typography
            style={{
              fontFamily: "Linden Hill",
              whiteSpace: "nowrap",
              fontWeight: 300,
              fontSize: "5vw",
            }}
          >
            (New)
          </Typography>
        </>
      )}
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ paddingBlock, paddingInline: "20px" }}
      >
        <Flex gap={screens.lg ? "large" : "middle"} vertical>
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
              <strong style={{ color: theme.colors.label }}>
                {"사진 장수"}
              </strong>
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
              <strong style={{ color: theme.colors.label }}>
                {"보정등급"}
              </strong>
            }
            colon={false}
            style={{ marginBottom: theme.spacing.lg }}
          >
            <Select
              placeholder={"보정등급을 선택해주세요."}
              value={formData.grade}
              onChange={handleSelectChange}
              style={{ width: "100%" }}
            >
              {GRADES.map(([grade, time]) => (
                <Select.Option key={grade} value={grade}>
                  {`${grade}`}
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
    </Flex>
  );
};

export default OrderForm;
