import React, { useState, useEffect } from "react";
import { NextRouter, useRouter } from "next/router";
import Topbar from "@/components/Topbar";
import { supabase } from "@/supabase";
import { FaUpload, FaFont, FaFilter, FaDownload, FaUser } from "react-icons/fa";
import FileUploader from "../components/FileUploader";

const SubtitleGeneration = () => {
  const router = useRouter();
  const [subtitleDesigns, setSubtitleDesigns] = useState([
    {
      font: "Noto Sans JP",
      size: 50,
      color: "#0000FF",
      outlineColor: "#FFFFFF",
      outlineWidth: 3,
      fontWeight: 700,
    },
  ]);
  const [filter, setFilter] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [checking, setChecking] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");

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
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.name === "fontWeight"
        ? parseInt(e.target.value)
        : e.target.value;
    const newSubtitleDesigns = [...subtitleDesigns];
    newSubtitleDesigns[index] = {
      ...newSubtitleDesigns[index],
      [e.target.name]: value,
    };
    setSubtitleDesigns(newSubtitleDesigns);
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

  const addSubtitleDesign = () => {
    setSubtitleDesigns([
      ...subtitleDesigns,
      {
        font: "Noto Sans JP",
        size: 50,
        color: "#0000FF",
        outlineColor: "#FFFFFF",
        outlineWidth: 3,
        fontWeight: 700,
      },
    ]);
  };

  const removeSubtitleDesign = () => {
    if (subtitleDesigns.length > 1) {
      setSubtitleDesigns(subtitleDesigns.slice(0, -1));
    }
  };

  return (
    <div className="relative flex-grow flex flex-col min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaFont className="mr-2" /> 字幕デザイン設定
          </h2>

          {subtitleDesigns.map((subtitleDesign, index) => (
            <div
              key={index}
              className="bg-white shadow-2xl rounded-3xl p-6 mb-4"
            >
              <div className="text-xl font-semibold mb-4 flex items-center">
                <FaUser className="mr-2" /> Speaker {index + 1}
              </div>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer mb-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    setFileName(file.name);
                  }
                }}
              >
                {!fileName && (
                  <p>ここに動画ファイルをドラッグ＆ドロップしてください</p>
                )}
                {fileName && <p>選択されたファイル: {fileName}</p>}
              </div>
              <div className="mt-4 flex">
                <div
                  className="w-1/3 mr-4"
                  style={{
                    fontFamily: subtitleDesign.font,
                    fontSize: `${subtitleDesign.size * 2}px`,
                    color: subtitleDesign.color,
                    WebkitTextStroke: `${subtitleDesign.outlineWidth}px ${subtitleDesign.outlineColor}`,
                    fontWeight: subtitleDesign.fontWeight,
                    padding: "20px",
                    borderRadius: "8px",
                    backgroundColor: "#808080",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "200px",
                  }}
                >
                  A a あ
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">フォント</label>
                      <select
                        name="font"
                        value={subtitleDesign.font}
                        onChange={(e) => handleSubtitleDesignChange(index, e)}
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
                        onChange={(e) => handleSubtitleDesignChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">文字色</label>
                      <div className="w-full h-10 border border-gray-300 rounded overflow-hidden">
                        <input
                          type="color"
                          name="color"
                          value={subtitleDesign.color}
                          onChange={(e) => handleSubtitleDesignChange(index, e)}
                          className="w-full h-full p-0 border-none"
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2">アウトライン色</label>
                      <div className="w-full h-10 border border-gray-300 rounded overflow-hidden">
                        <input
                          type="color"
                          name="outlineColor"
                          value={subtitleDesign.outlineColor}
                          onChange={(e) => handleSubtitleDesignChange(index, e)}
                          className="w-full h-full p-0 border-none"
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2">アウトライン幅</label>
                      <input
                        type="number"
                        name="outlineWidth"
                        value={subtitleDesign.outlineWidth}
                        onChange={(e) => handleSubtitleDesignChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">文字の太さ</label>
                      <input
                        type="number"
                        name="fontWeight"
                        value={subtitleDesign.fontWeight}
                        onChange={(e) => handleSubtitleDesignChange(index, e)}
                        min="100"
                        max="900"
                        step="100"
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="flex space-x-4">
            <button
              onClick={addSubtitleDesign}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              追加
            </button>
            <button
              onClick={removeSubtitleDesign}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              disabled={subtitleDesigns.length <= 1}
            >
              削除
            </button>
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
