import React from "react";
import { Segmented, Table, Tabs } from "antd";
const onChange = (key) => {
  console.log(key);
};
const items = [
  { key: "1", label: "신규", children: "이번주 작업한 총 장수 : " },
  { key: "2", label: "재수정", children: "이번주 작업한 총 장수 : " },
];

const columns = [
  {
    title: "신규 / 재수정",
    dataIndex: "type",
  },
  {
    title: "고객명",
    dataIndex: "userName",
  },
  {
    title: "보정장수",
    dataIndex: "photoLength",
    render: (_, record) => {
      return record.photoLength + "장";
    },
  },
];
const data = [
  {
    key: "1",
    userName: "하정연",
    type: "신규",
    photoLength: 15,
  },
  {
    key: "2",
    userName: "하정연",
    type: "재수정",
    photoLength: 10,
  },
  {
    key: "3",
    userName: "하정연",
    type: "신규",
    photoLength: 20,
  },
];

const Settlement = () => {
  const [alignValue, setAlignValue] = React.useState("center");
  return (
    <>
      <Segmented
        value={alignValue}
        style={{ marginBottom: 8 }}
        onChange={setAlignValue}
      />
      <Tabs
        defaultActiveKey="1"
        items={items}
        onChange={onChange}
        style={{ marginBottom: "5vh" }}
      />

      <Table columns={columns} dataSource={data} size="middle" />
    </>
  );
};
export default Settlement;
