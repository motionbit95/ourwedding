import React from "react";
import { Upload, Button, Typography, Space, Flex } from "antd";
import { FiFilePlus } from "react-icons/fi";
import { MdAttachFile } from "react-icons/md";
import { theme } from "../../utils/theme";

const { Title, Text, Paragraph } = Typography;

const PhotoUpload = ({
  title,
  fileList,
  onChange,
  maxCount,
  accept,
  showUploadList = true,
  uploadText = "사진 업로드",
  showMessage,
}) => {
  const customUpload = ({ file, onSuccess }) => {
    onSuccess("ok");
  };

  return (
    <Flex vertical gap="middle">
      <Space>
        <Title level={4} style={{ margin: "0 0 3px 0" }}>
          {title}
        </Title>
        <MdAttachFile size={18} />
      </Space>

      <div
        style={{
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.background,
        }}
      >
        <Typography.Paragraph style={{ color: theme.colors.label }}>
          {title === "사진 업로드" ? (
            <Flex vertical gap="large">
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
          ) : (
            <Flex vertical gap={"large"}>
              <li style={{ whiteSpace: "pre-line" }}>
                {`해당창은 참고사진을 업로드 하는 창으로 원하시는 작업 방향을 참고 할 수 있는 사진 업로드 부탁드립니다.
ex) 셀카 or 스튜디오 보정본`}
              </li>
              <li style={{ whiteSpace: "pre-line" }}>
                {`참고사진은 1장만 업로드 가능하여 최대한 [ 얼굴과 몸이 잘보이는 정면인 사진 ]  으로 업로드 바랍니다.`}
              </li>
            </Flex>
          )}
        </Typography.Paragraph>
      </div>

      <Space
        size="large"
        style={{
          alignItems: "flex-start",
          justifyContent: "flex-end",
          marginBottom: theme.spacing.lg,
        }}
      >
        {!maxCount && fileList.length >= maxCount ? (
          <Button
            type="primary"
            icon={<FiFilePlus color={theme.colors.label} />}
            style={{ color: theme.colors.label }}
            // disabled
            onClick={() => showMessage("error", "사진 장수를 확인해주세요!")}
          >
            {uploadText}
          </Button>
        ) : (
          <Upload
            accept={accept}
            multiple
            maxCount={maxCount}
            onChange={onChange}
            fileList={fileList}
            showUploadList={showUploadList}
            customRequest={customUpload}
          >
            <Space size={"large"}>
              {showUploadList && (
                <Text
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: theme.colors.label,
                  }}
                >
                  업로드 된 사진 파일 갯수 : {fileList.length}장
                </Text>
              )}
              <Button
                type="primary"
                icon={<FiFilePlus color={theme.colors.label} />}
                style={{ color: theme.colors.label }}
              >
                {uploadText}
              </Button>
            </Space>
          </Upload>
        )}
      </Space>
    </Flex>
  );
};

export default PhotoUpload;
