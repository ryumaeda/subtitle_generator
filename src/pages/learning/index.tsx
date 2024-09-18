import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FiUpload, FiPlay, FiList } from 'react-icons/fi';
import axios from 'axios';

const LearningPage = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [learningHistory, setLearningHistory] = useState<any[]>([]);
  const [isLearning, setIsLearning] = useState(false);

  useEffect(() => {
    fetchLearningHistory();
  }, []);

  const fetchLearningHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('training_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLearningHistory(data || []);
    } catch (error) {
      console.error('学習履歴の取得に失敗しました:', error);
      setLearningHistory([
        { id: 1, video_url: 'https://example.com/video1.mp4', created_at: '2023-06-01T12:00:00Z' },
        { id: 2, video_url: 'https://example.com/video2.mp4', created_at: '2023-06-02T14:30:00Z' },
      ]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleLearning = async () => {
  //  hoge
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Head>
        <title>学習画面 - 字幕生成システム</title>
        <meta name="description" content="学習用の動画をアップロードし システムの精度を向上させる画面" />
      </Head>

      <Topbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">学習画面</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">動画アップロード</h2>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">クリックしてアップロード</span> または ドラッグ&ドロップ</p>
                <p className="text-xs text-gray-500">FCPXML (最大 100MB)</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".fcpxml" />
            </label>
          </div>
          {file && <p className="mt-2 text-sm text-gray-600">選択されたファイル: {file.name}</p>}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">学習実行</h2>
          <button
            onClick={handleLearning}
            disabled={!file || isLearning}
            className={`flex items-center justify-center px-4 py-2 rounded-md text-white ${
              !file || isLearning ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <FiPlay className="mr-2" />
            {isLearning ? '学習中...' : '学習を開始'}
          </button>
          {isLearning && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{progress}% 完了</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">学習履歴</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">ID</th>
                  <th scope="col" className="px-6 py-3">動画URL</th>
                  <th scope="col" className="px-6 py-3">作成日時</th>
                </tr>
              </thead>
              <tbody>
                {learningHistory.map((item) => (
                  <tr key={item.id} className="bg-white border-b">
                    <td className="px-6 py-4">{item.id}</td>
                    <td className="px-6 py-4">{item.video_url}</td>
                    <td className="px-6 py-4">{new Date(item.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearningPage;