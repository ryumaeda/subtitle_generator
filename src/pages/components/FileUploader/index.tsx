// components/FileUploader.tsx
import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";

interface FileUploaderProps {
  onSuccess: (fileName: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Data,
            fileType: file.type,
          }),
        });

        if (response.ok) {
          onSuccess(file.name);
        } else {
          console.error('Upload failed');
          alert('アップロードに失敗しました。');
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('アップロード中にエラーが発生しました。');
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        {uploading ? 'アップロード中...' : <><FaUpload className="inline-block mr-2" /> アップロード</>}
      </button>
    </div>
  );
};

export default FileUploader;