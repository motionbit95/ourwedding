import React from "react";
import { Flex, Typography, Space, Upload, Button } from "antd";
import { FiFilePlus } from "react-icons/fi";
import { customUpload } from "../../utils/uploadUtils";
import { theme } from "../../utils/theme";

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
              style={{ margin: "0 0 3px 0", fontFamily: "Baskervville" }}
            >
              Photo upload
            </Typography.Title>
            <Typography>사진 업로드</Typography>
          </Space>

          <div
            style={{
              padding: paddingBox,
              border: "1px solid black",
              position: "relative",
            }}
          >
            <img
              src={require("../../../../asset/s.png")}
              alt="decoration"
              style={{
                position: "absolute",
                left: "-10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "20px",
                height: "auto",
                backgroundColor: "white",
                zIndex: 1,
              }}
            />
            <Typography.Paragraph style={{ color: theme.colors.label }}>
              <Flex vertical gap={"large"}>
                <li style={{ whiteSpace: "pre-line" }}>
                  {`파일 업로드는 raw / jpeg / jpg / cr2 / cr3 / heic만 가능합니다.
                   ㄴ 그 이외에 파일은 해당 사이트에서 파일 변환하여 업로드바랍니다. `}
                  <Typography.Link
                    style={{
                      color: theme.colors.error,
                      fontWeight: 700,
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
                fontWeight: 600,
                color: "black",
              }}
            >
              업로드 된 사진 파일 갯수 : {photoList.length}장
            </Typography.Text>

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
              <Button icon={<FiFilePlus color="black" />}>사진 업로드</Button>
            </Upload>
          </Space>
        </Flex>

        <Flex vertical gap={"middle"}>
          <Space>
            <Typography.Title
              level={4}
              style={{ margin: "0 0 3px 0", fontFamily: "Baskervville" }}
            >
              Reference photo upload
            </Typography.Title>
            <Typography>참고 사진 업로드</Typography>
          </Space>

          <div
            style={{
              padding: paddingBox,
              borderBlock: "1px solid black",
            }}
          >
            <Typography.Paragraph style={{ color: "black" }}>
              <Flex vertical gap={"large"}>
                <li style={{ whiteSpace: "pre-line" }}>
                  {`해당창은 참고사진을 업로드 하는 창으로 원하시는 작업 방향을 참고 할 수 있는 사진 업로드 부탁드립니다.
ex) 셀카 or 스튜디오 보정본`}
                </li>
                <li style={{ whiteSpace: "pre-line" }}>
                  {`참고사진은 1장만 업로드 가능하여 최대한 [ 얼굴과 몸이 잘보이는 정면인 사진 ]  으로 업로드 바랍니다.`}
                </li>
              </Flex>
            </Typography.Paragraph>
          </div>

          <Space
            size={"large"}
            style={{
              justifyContent: "flex-end",
              marginBottom: "24px",
            }}
          >
            <Upload
              accept=".raw,.jpeg,.jpg,.cr2,.cr3,.heic"
              maxCount={1}
              showUploadList={false}
              onChange={handleReferenceUpload}
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
              <Button icon={<FiFilePlus color="black" />}>사진 업로드</Button>
            </Upload>
          </Space>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default PhotoUpload;
