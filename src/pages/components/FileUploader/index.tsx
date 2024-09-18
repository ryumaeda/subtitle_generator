// components/FileUploader.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import UploadButton from '../UploadButton';

const FileUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        {...getRootProps()}
        className={`w-full max-w-md p-6 border-2 border-dashed rounded-md text-center cursor-pointer ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">ファイルをここにドロップしてください...</p>
        ) : (
          <p>ファイルをドラッグ＆ドロップするか、クリックして選択してください</p>
        )}
      </div>

      {selectedFile && (
        <div className="mt-4 w-full max-w-md">
          <p className="mb-2">
            選択されたファイル: <span className="font-semibold">{selectedFile.name}</span>
          </p>
          <UploadButton file={selectedFile} />
        </div>
      )}
    </div>
  );
};

export default FileUploader;