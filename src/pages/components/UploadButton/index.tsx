// components/UploadButton.tsx
import React, { useState } from 'react';

interface UploadButtonProps {
  file: File;
}

const UploadButton: React.FC<UploadButtonProps> = ({ file }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null); // 成功かどうかを示す状態

  const handleUpload = async () => {
    setUploading(true);
    setMessage('');
    setIsSuccess(null);

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; // データ部分のみを抽出

      try {
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

        const result = await response.json();

        if (response.ok) {
          setMessage(result.message);
          setIsSuccess(true); // 成功した場合
        } else {
          setMessage(result.message || 'アップロード中にエラーが発生しました。');
          setIsSuccess(false); // 失敗した場合
        }
      } catch (error) {
        console.error('Upload error:', error);
        setMessage('アップロード中にエラーが発生しました。');
        setIsSuccess(false); // エラーが発生した場合
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      console.error('File reading has failed');
      setMessage('ファイルの読み込みに失敗しました。');
      setIsSuccess(false); // ファイル読み込みに失敗した場合
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleUpload}
        disabled={uploading}
        className={`px-4 py-2 bg-blue-500 text-white rounded ${
          uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
        }`}
      >
        {uploading ? 'アップロード中...' : 'AWS S3にアップロード'}
      </button>
      {message && (
        <p className={`mt-2 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
      )}
    </div>
  );
};

export default UploadButton;