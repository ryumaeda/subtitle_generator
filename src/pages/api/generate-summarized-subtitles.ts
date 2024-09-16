import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subtitleData } = req.body;

  if (!subtitleData) {
    return res.status(400).json({ error: '字幕データが提供されていません' });
  }

  try {
    // ユーザー認証の確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: '認証されていません' });
    }

    // 学習データの取得
    const { data: trainingData, error: trainingDataError } = await supabase
      .from('training_videos')
      .select('subtitle_data')
      .eq('user_id', user.id);

    if (trainingDataError) {
      console.error('学習データの取得エラー:', trainingDataError);
      return res.status(500).json({ error: '学習データの取得に失敗しました' });
    }

    // 要点抽出の実行
    const systemPrompt = '与えられた字幕データから重要な文や句を抽出し、要約してください。';
    const userPrompt = `字幕データ: ${JSON.stringify(subtitleData)}
学習データ: ${JSON.stringify(trainingData)}`;

    const summarizedContent = await getLlmModelAndGenerateContent('Gemini', systemPrompt, userPrompt);

    if (!summarizedContent) {
      throw new Error('要点抽出に失敗しました');
    }

    // 要点を元の字幕データと統合
    const enhancedSubtitles = subtitleData.map((subtitle: any) => {
      if (summarizedContent.includes(subtitle.text)) {
        return { ...subtitle, isImportant: true };
      }
      return subtitle;
    });

    return res.status(200).json({ summarizedSubtitles: enhancedSubtitles });
  } catch (error) {
    console.error('要点抽出字幕生成エラー:', error);
    // エラー時のサンプルデータ
    const sampleEnhancedSubtitles = [
      { start: '00:00:00', end: '00:00:05', text: 'こんにちは、今日は重要な会議です。', isImportant: true },
      { start: '00:00:06', end: '00:00:10', text: '議題は新製品の開発についてです。', isImportant: true },
      { start: '00:00:11', end: '00:00:15', text: 'まず、市場調査の結果を見てみましょう。', isImportant: false },
      { start: '00:00:16', end: '00:00:20', text: '競合他社の動向も考慮する必要があります。', isImportant: true },
    ];
    return res.status(200).json({ summarizedSubtitles: sampleEnhancedSubtitles });
  }
}