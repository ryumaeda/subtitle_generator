import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaDownload, FaEye } from 'react-icons/fa';
import axios from 'axios';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';

const DownloadPage = () => {
  const router = useRouter();
  const [selectedSoftware, setSelectedSoftware] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleSoftwareChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSoftware(e.target.value);
  };

  const handlePreview = async () => {
    try {
      const response = await axios.get('/api/export-project-file', {
        params: { software: selectedSoftware, preview: true }
      });
      setPreviewUrl(response.data.previewUrl);
    } catch (error) {
      console.error('プレビューの取得に失敗しました', error);
      setPreviewUrl('https://placehold.co/600x400?text=プレビュー失敗');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get('/api/export-project-file', {
        params: { software: selectedSoftware }
      });
      setDownloadUrl(response.data.downloadUrl);
    } catch (error) {
      console.error('ダウンロードURLの取得に失敗しました', error);
      alert('ダウンロードに失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">ダウンロード画面</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label htmlFor="software" className="block text-sm font-medium text-gray-700 mb-2">
              編集ソフトを選択
            </label>
            <select
              id="software"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedSoftware}
              onChange={handleSoftwareChange}
            >
              <option value="">選択してください</option>
              <option value="finalcut">Final Cut Pro</option>
              <option value="premiere">Premiere Pro</option>
            </select>
          </div>
          <div className="flex space-x-4 mb-6">
            <button
              onClick={handlePreview}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
              disabled={!selectedSoftware}
            >
              <FaEye className="mr-2" />
              プレビュー
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
              disabled={!selectedSoftware}
            >
              <FaDownload className="mr-2" />
              ダウンロード
            </button>
          </div>
          {previewUrl && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">プレビュー</h2>
              <img src={previewUrl} alt="プレビュー" className="w-full max-w-2xl mx-auto rounded-lg shadow-md" />
            </div>
          )}
          {downloadUrl && (
            <div className="text-center">
              <a
                href={downloadUrl}
                download
                className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-300"
              >
                プロジェクトファイルをダウンロード
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;