import { MESSAGES, FILE_TYPES, UPLOAD_LIMITS } from "../constants";

export const beforeUpload = (file, fileList, type = "photo") => {
  const isImage = FILE_TYPES.some((type) =>
    file.name.toLowerCase().endsWith(type)
  );
  if (!isImage) {
    return false;
  }

  const isLt50M = file.size / 1024 / 1024 < 50;
  if (!isLt50M) {
    return false;
  }

  const limit =
    type === "photo" ? UPLOAD_LIMITS.PHOTOS : UPLOAD_LIMITS.REFERENCE;
  if (fileList.length >= limit) {
    return false;
  }

  return true;
};

export const customUpload = async ({ file, onSuccess, onError }) => {
  try {
    // 여기서 실제 파일 업로드 로직을 구현할 수 있습니다.
    // 현재는 임시로 성공 처리만 합니다.
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  } catch (error) {
    onError(error);
  }
};

export const handleUploadChange = (
  { file, fileList },
  setFileList,
  showMessage
) => {
  if (file.status === "done") {
    showMessage("success", MESSAGES.UPLOAD_SUCCESS(file.name));
  } else if (file.status === "error") {
    showMessage("error", MESSAGES.UPLOAD_ERROR(file.name));
  }
  setFileList(fileList);
};

export const validateFile = (file, fileList, type = "photo") => {
  const errors = [];

  // 파일 형식 검사
  const isImage = FILE_TYPES.some((type) =>
    file.name.toLowerCase().endsWith(type)
  );
  if (!isImage) {
    errors.push(MESSAGES.INVALID_FILE_TYPE);
  }

  // 파일 크기 검사 (50MB)
  const isLt50M = file.size / 1024 / 1024 < 50;
  if (!isLt50M) {
    errors.push("파일 크기는 50MB를 초과할 수 없습니다.");
  }

  // 업로드 제한 검사
  const limit =
    type === "photo" ? UPLOAD_LIMITS.PHOTOS : UPLOAD_LIMITS.REFERENCE;
  if (fileList.length >= limit) {
    errors.push(`최대 ${limit}개의 파일만 업로드할 수 있습니다.`);
  }

  return errors;
};

export const getFileExtension = (fileName) => {
  return fileName.substring(fileName.lastIndexOf("."));
};

export const generateFileName = (
  userName,
  userId,
  index,
  isReference = false
) => {
  const prefix = "테일리티_신규";
  const suffix = isReference ? "_참고" : `_${index + 1}`;
  return `${prefix}_${userName}_${userId}${suffix}`;
};
