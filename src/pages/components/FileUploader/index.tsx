// components/FileUploader.tsx
import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";

interface FileUploaderProps {
  onSuccess: (fileName: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Data,
            fileType: file.type,
          }),
        });

        if (response.ok) {
          onSuccess(file.name);
          setUploadComplete(true);
        } else {
          console.error("アップロードに失敗しました");
          alert("アップロードに失敗しました。");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("アップロードエラー:", error);
      alert("アップロード中にエラーが発生しました。");
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer mb-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {file ? (
          <p>選択されたファイル: {file.name}</p>
        ) : (
          <>
            <FaUpload className="mx-auto mb-2 text-3xl text-gray-400" />
            <p>ここに動画ファイルをドラッグ＆ドロップしてください</p>
            <p className="text-sm text-gray-500 mt-2">または</p>
            <label className="mt-2 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
              ファイルを選択
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>
      {!uploading ? (
        !uploadComplete ? (
          <button
            onClick={handleUpload}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            <FaUpload className="inline-block mr-2" /> 字幕生成開始
          </button>
        ) : (
          <p className="text-center text-green-500 font-bold">
            動画ファイルのアップロードが完了しました！
          </p>
        )
      ) : (
        <p className="text-center text-blue-500 font-bold">
          動画ファイルをアップロード中...
        </p>
      )}
    </div>
  );
};

export default FileUploader;
