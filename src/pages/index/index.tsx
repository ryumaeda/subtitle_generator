import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FaVideo, FaGraduationCap, FaQuestionCircle } from 'react-icons/fa';

const Home: React.FC = () => {
  const router = useRouter();
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        router.push('/login');
      }
    };

    fetchUser();
    // ここで最近の活動を取得する処理を追加
    setRecentActivity(['字幕を生成しました', '学習データを追加しました']);
  }, [router]);

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">ようこそ、{user?.email}さん</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">機能を選択</h2>
            <div className="space-y-4">
              <Link href="/subtitle-generation" className="flex items-center p-4 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                <FaVideo className="text-blue-600 mr-3 text-xl" />
                <span className="text-lg text-blue-800">字幕生成</span>
              </Link>
              <Link href="/learning" className="flex items-center p-4 bg-green-100 rounded-md hover:bg-green-200 transition-colors">
                <FaGraduationCap className="text-green-600 mr-3 text-xl" />
                <span className="text-lg text-green-800">学習</span>
              </Link>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">最近の活動</h2>
            <ul className="space-y-2">
              {recentActivity.map((activity, index) => (
                <li key={index} className="text-gray-600">{activity}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">ヘルプ＆ガイド</h2>
          <Link href="/help" className="flex items-center text-blue-600 hover:text-blue-800">
            <FaQuestionCircle className="mr-2" />
            <span>ヘルプセンターを開く</span>
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Home;