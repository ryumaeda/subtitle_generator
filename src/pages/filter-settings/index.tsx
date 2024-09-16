import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import { FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';

const FilterSettings: NextPage = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<any[]>([]);
  const [newFilter, setNewFilter] = useState('');

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    const { data, error } = await supabase
      .from('filters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('フィルターの取得に失敗しました:', error);
    } else {
      setFilters(data || []);
    }
  };

  const addFilter = async () => {
    if (newFilter.trim() === '') return;

    const { data, error } = await supabase
      .from('filters')
      .insert({ filter_string: newFilter })
      .single();

    if (error) {
      console.error('フィルターの追加に失敗しました:', error);
    } else {
      setFilters([data, ...filters]);
      setNewFilter('');
    }
  };

  const updateFilter = async (id: string, newValue: string) => {
    const { error } = await supabase
      .from('filters')
      .update({ filter_string: newValue })
      .eq('id', id);

    if (error) {
      console.error('フィルターの更新に失敗しました:', error);
    } else {
      setFilters(filters.map(f => f.id === id ? { ...f, filter_string: newValue } : f));
    }
  };

  const deleteFilter = async (id: string) => {
    const { error } = await supabase
      .from('filters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('フィルターの削除に失敗しました:', error);
    } else {
      setFilters(filters.filter(f => f.id !== id));
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">フィルター設定</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">新しいフィルターを追加</h2>
          <div className="flex items-center">
            <input
              type="text"
              value={newFilter}
              onChange={(e) => setNewFilter(e.target.value)}
              className="flex-grow mr-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="フィルターを入力してください"
            />
            <button
              onClick={addFilter}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 flex items-center"
            >
              <FiPlus className="mr-2" />
              追加
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">既存のフィルター</h2>
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center mb-4">
              <input
                type="text"
                value={filter.filter_string}
                onChange={(e) => updateFilter(filter.id, e.target.value)}
                className="flex-grow mr-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => deleteFilter(filter.id)}
                className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition duration-300"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => router.push('/home')}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition duration-300 flex items-center"
          >
            <FiSave className="mr-2" />
            保存して戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSettings;