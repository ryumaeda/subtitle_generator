import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import axios from 'axios';
import { FaUpload, FaFont, FaFilter, FaPlay, FaDownload } from 'react-icons/fa';
import FileUploader from '../components/FileUploader';

const SubtitleGeneration = () => {
  const router = useRouter();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitleDesign, setSubtitleDesign] = useState({
    font: 'Noto Sans JP',
    size: 16,
    color: '#FFFFFF',
    backgroundColor: '#000000',
  });
  const [filter, setFilter] = useState('');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    // ユーザーの認証状態を確認
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      }
    };
    checkAuth();
  }, []);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setVideoFile(event.target.files[0]);
    }
  };

  const handleSubtitleDesignChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSubtitleDesign({ ...subtitleDesign, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleConvert = async () => {
    if (!videoFile) return;

    setProgress(0);
    setDownloadUrl('');

    try {
      // 音声テキスト変換
      const formData = new FormData();
      formData.append('video', videoFile);
      const { data: speechToTextData } = await axios.post('/api/speech-to-text', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(percentCompleted / 4);
        },
      });

      // 字幕ファイル生成
      const { data: subtitleFileData } = await axios.post('/api/generate-subtitle-file', {
        textData: speechToTextData,
        subtitleDesign,
        filter,
      });
      setProgress(50);

      // 要点抽出字幕生成
      const { data: summarizedSubtitlesData } = await axios.post('/api/generate-summarized-subtitles', {
        subtitleData: subtitleFileData,
      });
      setProgress(75);

      // 話者別字幕スタイル適用
      const { data: finalSubtitlesData } = await axios.post('/api/apply-speaker-styles', {
        subtitleData: summarizedSubtitlesData,
      });
      setProgress(100);

      setDownloadUrl(finalSubtitlesData.url);
    } catch (error) {
      console.error('変換エラー:', error);
      alert('変換中にエラーが発生しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">字幕生成画面</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaUpload className="mr-2" /> 動画アップロード
          </h2>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

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

        <button
          onClick={handleConvert}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded flex items-center justify-center mb-8"
        >
          <FaPlay className="mr-2" /> 変換実行
        </button>

        {progress > 0 && (
          <div className="mb-8">
            <div className="bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center">{progress}% 完了</p>
          </div>
        )}

        {downloadUrl && (
          <a
            href={downloadUrl}
            download
            className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded text-center"
          >
            <FaDownload className="inline-block mr-2" /> 字幕ファイルをダウンロード
          </a>
        )}
      </div>
      <h1 className="text-3xl font-bold mb-6">ファイルアップロードテスト</h1>
        <FileUploader />
    </div>
  );
};

export default SubtitleGeneration;