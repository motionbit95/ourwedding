import { message } from "antd";

export const showMessage = (type, content) => {
  message.open({
    type,
    content,
  });
};

export const showSuccess = (content) => {
  showMessage("success", content);
};

export const showError = (content) => {
  showMessage("error", content);
};

export const showWarning = (content) => {
  showMessage("warning", content);
};

export const showInfo = (content) => {
  showMessage("info", content);
};

export const showLoading = (content = "처리 중...") => {
  const hide = message.loading(content, 0);
  return hide;
};

export const showMessageWithDuration = (type, content, duration = 3) => {
  message.open({
    type,
    content,
    duration,
  });
};
