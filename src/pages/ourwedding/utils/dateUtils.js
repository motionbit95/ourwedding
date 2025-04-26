import dayjs from "dayjs";

export const getDurationByGrade = (grade) => {
  const GRADES = [
    ["S 샘플", "4일이내"],
    ["1 씨앗", "7일이내"],
    ["2 새싹", "4일이내"],
    ["3 나무", "2일이내"],
    ["# 숲", "3시간이내"],
  ];
  const found = GRADES.find(([g]) => g === grade);
  return found?.[1];
};

export const getDeadline = (duration) => {
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

export const getFormattedDate = () => {
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
};
