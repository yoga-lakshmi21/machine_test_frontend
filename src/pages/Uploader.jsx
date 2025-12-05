import React, { useState } from "react";
import { Upload, Button, Modal, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const Uploader = () => {
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState(null);

  const beforeUpload = (file) => {
    const isXml = file.type === "text/xml" || file.name.endsWith(".xml");
    if (!isXml) {
      message.error("Please upload only XML files");
      return Upload.LIST_IGNORE;
    }
    setFile(file);
    return false; 
  };

  const handleUpload = async () => {
    if (!file) return message.error("Please select an XML file");

    const formData = new FormData();
    formData.append("file", file); 
  
    try {
      const res = await axios.post(
        "http://localhost:5000/api/upload-xml",
        formData
      );

      const existing = res.data.results.find(r => r.exists);
      if (existing) {
        setUploadData(existing.data);
        setIsModalOpen(true);
      } else {
        message.success("New record uploaded successfully");
        setFile(null); 
      }
    } catch (err) {
      message.error("Upload failed");
    }
  };

  const handleOverwrite = async () => {
    if (!uploadData) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/overwrite-xml",
        { 
          Email: uploadData.Email, 
          updateData: uploadData 
        }
      );
      message.success(res.data.message);
      setIsModalOpen(false);
      setFile(null); // reset file after overwrite
    } catch (err) {
      message.error("Overwrite failed");
    }
  };

  return (
    <div style={{ width: 400, margin: "80px auto", textAlign: "center" }}>
      <h2>XML Upload</h2><br/>

      <Upload
        beforeUpload={beforeUpload}
        maxCount={1}
        accept=".xml"
        onRemove={() => setFile(null)}
      >
        <Button icon={<UploadOutlined />}>Choose XML File</Button>
      </Upload>

      <Button
        type="primary"
        onClick={handleUpload}
        disabled={!file}
        style={{ marginTop: 20 }}
      >
        Upload
      </Button>

      {/* Overwrite Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="no" onClick={() => setIsModalOpen(false)}>No</Button>,
          <Button key="yes" type="primary" onClick={handleOverwrite}>Yes, Overwrite</Button>,
        ]}
      >
        <p>Record already exists. Do you want to overwrite?</p>
      </Modal>
    </div>
  );
};

export default Uploader;
