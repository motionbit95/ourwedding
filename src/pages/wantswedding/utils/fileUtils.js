import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../../../firebaseConfig";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const uploadFiles = async (fileList, userName, userId, onProgress) => {
  try {
    const total = fileList.length;
    let completed = 0;

    const uploadPromises = fileList.map(async (file, index) => {
      const fileObj = file.originFileObj;
      const fileExtension = fileObj.name.substring(
        fileObj.name.lastIndexOf(".")
      );
      const rawFileName = `원츠웨딩_신규_${userName}_${userId}_${
        index + 1
      }${fileExtension}`;
      const encodedFileName = encodeURIComponent(rawFileName);

      const storageRef = ref(storage, `temp/${encodedFileName}`);

      await uploadBytes(storageRef, fileObj);
      const downloadURL = await getDownloadURL(storageRef);

      const res = await axios.post(`${API_URL}/upload`, {
        fileUrl: downloadURL,
        originalFileName: encodedFileName,
      });

      await deleteObject(storageRef);

      completed++;
      if (onProgress) {
        onProgress((completed / total) * 100);
      }

      return {
        originalFileName: encodedFileName,
        downloadLink: res.data.downloadLink,
      };
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("파일 업로드 중 오류 발생:", error);
    throw error;
  }
};

export const uploadReferenceFiles = async (fileList, userName, userId) => {
  if (!fileList.length) return null;

  try {
    const file = fileList[0];
    const fileObj = file.originFileObj;
    const fileExtension = fileObj.name.substring(fileObj.name.lastIndexOf("."));
    const rawFileName = `원츠웨딩_참고_${userName}_${userId}${fileExtension}`;
    const encodedFileName = encodeURIComponent(rawFileName);

    const storageRef = ref(storage, `temp/${encodedFileName}`);

    await uploadBytes(storageRef, fileObj);
    const downloadURL = await getDownloadURL(storageRef);

    const res = await axios.post(`${API_URL}/upload`, {
      fileUrl: downloadURL,
      originalFileName: encodedFileName,
    });

    await deleteObject(storageRef);

    return {
      originalFileName: encodedFileName,
      downloadLink: res.data.downloadLink,
    };
  } catch (error) {
    console.error("참고 파일 업로드 중 오류 발생:", error);
    throw error;
  }
};
