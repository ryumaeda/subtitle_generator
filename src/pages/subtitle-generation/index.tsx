// pages/SubtitleGeneration.tsx
import React, { useState, useEffect } from "react";
import { NextRouter, useRouter } from "next/router";
import Topbar from "@/components/Topbar";
import { supabase } from "@/supabase";
import { FaUpload, FaFont, FaFilter, FaDownload } from "react-icons/fa";
import FileUploader from "../components/FileUploader";

const SubtitleGeneration = () => {
  const router = useRouter();
  const [subtitleDesign, setSubtitleDesign] = useState({
    font: "Noto Sans JP",
    size: 16,
    color: "#FFFFFF",
    backgroundColor: "#000000",
  });
  const [filter, setFilter] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [checking, setChecking] = useState<boolean>(false);

  useEffect(() => {
    // ユーザーの認証状態を確認
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        (router as unknown as NextRouter).push("/login");
      }
    };
    checkAuth();
  }, [router]);

  const handleSubtitleDesignChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSubtitleDesign({ ...subtitleDesign, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleUploadSuccess = (uploadedFileName: string) => {
    startChecking(uploadedFileName + ".fcpxmld.zip");
  };

  const startChecking = (uploadedFileName: string) => {
    setChecking(true);
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/check-fcpxml?fileName=${encodeURIComponent(uploadedFileName)}`
        );
        const data = await res.json();
        if (data.exists) {
          setDownloadUrl(
            `https://${process.env.NEXT_PUBLIC_FCPXML_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${uploadedFileName}`
          );
          setChecking(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error checking FCPXML file:", error);
        setChecking(false);
        clearInterval(interval);
      }
    }, 5000); // 5秒ごとにチェック
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">字幕生成画面</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaFont className="mr-2" /> 字幕デザイン設定
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">フォント</label>
              <select
                name="font"
                value={subtitleDesign.font}
                onChange={handleSubtitleDesignChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Noto Sans JP">Noto Sans JP</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">サイズ</label>
              <input
                type="number"
                name="size"
                value={subtitleDesign.size}
                onChange={handleSubtitleDesignChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">文字色</label>
              <input
                type="color"
                name="color"
                value={subtitleDesign.color}
                onChange={handleSubtitleDesignChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">背景色</label>
              <input
                type="color"
                name="backgroundColor"
                value={subtitleDesign.backgroundColor}
                onChange={handleSubtitleDesignChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaFilter className="mr-2" /> フィルター設定
          </h2>
          <input
            type="text"
            value={filter}
            onChange={handleFilterChange}
            placeholder="フィルターワードをカンマ区切りで入力"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaUpload className="mr-2" /> 字幕生成
          </h2>
          <FileUploader onSuccess={handleUploadSuccess} />
        </div>

        {checking && (
          <div className="mb-8">
            <div className="bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-blue-500 h-4 rounded-full animate-pulse"
                style={{ width: `100%` }}
              ></div>
            </div>
            <p className="text-center">
              .fcpxmlファイルの生成を待っています...
            </p>
          </div>
        )}

        {downloadUrl && (
          <a
            href={downloadUrl}
            download
            className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded text-center"
          >
            <FaDownload className="inline-block mr-2" />{" "}
            .fcpxmlファイルをダウンロード
          </a>
        )}
      </div>
    </div>
  );
};

export default SubtitleGeneration;
