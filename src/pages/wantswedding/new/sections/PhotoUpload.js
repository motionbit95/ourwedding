import React from "react";
import { Flex, Typography, Space, Upload, Button } from "antd";
import { FiFilePlus } from "react-icons/fi";
import { customUpload } from "../../utils/uploadUtils";
import { theme } from "../../utils/theme";
import { COLORS } from "../../style_vars";

const PhotoUpload = ({
  photoList,
  handlePhotoUpload,
  handleReferenceUpload,
  showMessage,
  paddingBox,
}) => {
  return (
    <Flex
      style={{
        justifyContent: "center",
        maxWidth: "900px",
        width: "100%",
      }}
    >
      <Flex vertical gap={"large"} style={{ width: "100%" }}>
        <Flex vertical gap={"middle"}>
          <Space>
            <Typography.Title
              level={4}
              style={{
                margin: "0 0 3px 0",
                color: theme.colors.label,
                fontFamily: "GumiRomanceTTF",
                fontWeight: 300,
              }}
            >
              Photo upload
            </Typography.Title>
            <Typography style={{ fontFamily: "GumiRomanceTTF" }}>
              사진 업로드
            </Typography>
          </Space>

          <Flex vertical style={{ alignItems: "center" }}>
            <div
              style={{
                padding: paddingBox,
                paddingBottom: "48px",
                border: "1px solid #C0EBFF",
                position: "relative",
                backgroundColor: "white",
                borderRadius: "16px",
              }}
            >
              <Typography.Paragraph
                style={{
                  color: "black",
                  fontFamily: "GumiRomanceTTF",
                }}
              >
                <Flex vertical gap={"large"}>
                  <li style={{ whiteSpace: "pre-line" }}>
                    {`파일 업로드는 raw / jpeg / jpg / cr2 / cr3 / heic만 가능합니다.
                   ㄴ 그 이외에 파일은 해당 사이트에서 파일 변환하여 업로드바랍니다. `}
                    <Typography.Link
                      style={{
                        color: theme.colors.error,
                        fontWeight: 700,
                        fontFamily: "GumiRomanceTTF",
                      }}
                      onClick={() => window.open("https://convertio.co/kr/")}
                    >
                      Convertio — 파일 변환기
                    </Typography.Link>
                    {" : 파일전환 페이지"}
                  </li>

                  <li style={{ whiteSpace: "pre-line" }}>
                    {
                      "사진은 업로드 후 변경이 불가능하니 신중하게 업로드 부탁 드립니다."
                    }
                  </li>

                  <li style={{ whiteSpace: "pre-line" }}>
                    {`파일용량은 꼭 확인 후 가장 큰 파일로 업로드 부탁 드립니다.
                   ㄴ 작업 이후 파일 크기로 인한 재작업은 재주문 후 진행해야 합니다.`}
                  </li>
                </Flex>
              </Typography.Paragraph>
            </div>

            <Upload
              accept=".raw,.jpeg,.jpg,.cr2,.cr3,.heic"
              multiple
              onChange={handlePhotoUpload}
              fileList={photoList}
              showUploadList={false}
              customRequest={customUpload}
              beforeUpload={(file) => {
                const isValidType = [
                  ".raw",
                  ".jpeg",
                  ".jpg",
                  ".cr2",
                  ".cr3",
                  ".heic",
                ].some((ext) => file.name.toLowerCase().endsWith(ext));
                if (!isValidType) {
                  showMessage("error", "지원하지 않는 파일 형식입니다");
                  return Upload.LIST_IGNORE;
                }
                return true;
              }}
            >
              {/* <Button icon={<FiFilePlus color="black" />}>사진 업로드</Button> */}
              <div
                style={{
                  backgroundImage: `url(${require("../../asset/button_click.png")})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  display: "flex",
                  position: "relative",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  transform: "translateY(-50%)",
                }}
              >
                <Button
                  htmlType="submit"
                  icon={<FiFilePlus />}
                  iconPosition="start"
                  type="text"
                  size="middle"
                  style={{
                    width: "auto",
                    alignSelf: "center",
                    fontFamily: "GumiRomanceTTF",

                    whiteSpace: "pre-line",
                    color: "#006C92",
                    fontFamily: "GumiRomanceTTF",
                    backgroundColor: "transparent",
                    border: "none",
                    boxShadow: "none",
                  }}
                >
                  사진 업로드
                </Button>
              </div>
            </Upload>

            <Space
              size={"large"}
              style={{
                justifyContent: "flex-end",
                marginBottom: "24px",
              }}
            >
              <Typography.Text
                style={{
                  fontSize: "16px",
                  color: "black",
                  fontFamily: "GumiRomanceTTF",
                }}
              >
                업로드 된 사진 파일 갯수 : {photoList?.length}장
              </Typography.Text>
            </Space>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default PhotoUpload;
