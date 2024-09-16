import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { software, preview } = req.query;

  if (!software || (software !== 'finalcut' && software !== 'premiere')) {
    return res.status(400).json({ error: '無効な編集ソフトが指定されました' });
  }

  try {
    // ユーザー認証の確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: '認証されていません' });
    }

    // 字幕データの取得（実際のプロジェクトでは適切なテーブルから取得する）
    const { data: subtitlesData, error: subtitlesError } = await supabase
      .from('subtitles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (subtitlesError || !subtitlesData || subtitlesData.length === 0) {
      return res.status(404).json({ error: '字幕データが見つかりません' });
    }

    // プロジェクトファイルのフォーマット指定
    const format = software === 'finalcut' ? 'fcpxml' : 'prproj';

    // AIを使用してプロジェクトファイルを生成
    const prompt = `以下の字幕データを${format}形式のプロジェクトファイルに変換してください：
${JSON.stringify(subtitlesData[0])}`;
    const aiResponse = await getLlmModelAndGenerateContent('Gemini', '動画編集ソフト用のプロジェクトファイル生成AI', prompt);

    // AIの応答をバイナリデータに変換
    const projectFileBuffer = Buffer.from(aiResponse, 'utf-8');

    if (preview) {
      // プレビュー用の画像URLを生成（実際のプロジェクトでは適切な画像生成処理を実装）
      const previewUrl = 'https://placehold.co/600x400?text=プレビュー';
      return res.status(200).json({ previewUrl });
    } else {
      // プロジェクトファイルをSupabaseのストレージにアップロード
      const fileName = `project_${Date.now()}.${format}`;
      const { data, error: uploadError } = await supabase.storage
        .from('project_files')
        .upload(fileName, projectFileBuffer);

      if (uploadError) {
        throw new Error('ファイルのアップロードに失敗しました');
      }

      // ダウンロード用の一時URLを生成
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('project_files')
        .getPublicUrl(fileName);

      if (urlError) {
        throw new Error('ダウンロードURLの生成に失敗しました');
      }

      return res.status(200).json({ downloadUrl: publicUrl });
    }
  } catch (error) {
    console.error('エラー:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}