import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaFont, FaPalette, FaEye, FaSave } from 'react-icons/fa';
import Topbar from '@/components/Topbar';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

const SubtitleDesignSettings = () => {
  const router = useRouter();
  const [font, setFont] = useState('Noto Sans JP');
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [previewText, setPreviewText] = useState('サンプル字幕テキスト');

  const fonts = ['Noto Sans JP', 'Roboto', 'Meiryo', 'Arial', 'Helvetica'];

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('subtitle_styles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFont(data.font_name);
        setFontSize(data.font_size);
        setFontColor(data.font_color);
        setBackgroundColor(data.background_color);
      }
    } catch (error) {
      console.error('設定の取得に失敗しました:', error);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('subtitle_styles')
        .upsert({
          user_id: user.id,
          font_name: font,
          font_size: fontSize,
          font_color: fontColor,
          background_color: backgroundColor,
        });

      if (error) throw error;

      alert('設定を保存しました');
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      alert('設定の保存に失敗しました');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">字幕デザイン設定</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="font">
              <FaFont className="inline mr-2" />
              フォント
            </label>
            <select
              id="font"
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {fonts.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fontSize">
              フォントサイズ
            </label>
            <input
              id="fontSize"
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <FaPalette className="inline mr-2" />
              色設定
            </label>
            <div className="flex space-x-4">
              <div>
                <label className="block text-gray-700 text-xs mb-1" htmlFor="fontColor">
                  フォント色
                </label>
                <input
                  id="fontColor"
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="w-full h-10 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs mb-1" htmlFor="backgroundColor">
                  背景色
                </label>
                <input
                  id="backgroundColor"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 rounded"
                />
              </div>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <FaEye className="inline mr-2" />
              プレビュー
            </label>
            <div
              className="border rounded p-4"
              style={{
                fontFamily: font,
                fontSize: `${fontSize}px`,
                color: fontColor,
                backgroundColor: backgroundColor,
              }}
            >
              {previewText}
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
            >
              <FaSave className="mr-2" />
              設定を保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtitleDesignSettings;