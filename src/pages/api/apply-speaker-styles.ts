import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function applySpeakerStyles(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { subtitleData } = req.body;

    if (!subtitleData) {
      return res.status(400).json({ error: '字幕データが提供されていません' });
    }

    // 話者識別データを取得
    const speakerIdentificationData = await identifySpeakers(subtitleData);

    // 各話者にスタイルを割り当て
    const stylizedSubtitles = assignStylesToSpeakers(subtitleData, speakerIdentificationData);

    // スタイルが適用された字幕データをS3にアップロード
    const { data, error } = await supabase.storage
      .from('stylized-subtitles')
      .upload(`${Date.now()}_stylized_subtitles.json`, JSON.stringify(stylizedSubtitles));

    if (error) {
      throw new Error('字幕データのアップロードに失敗しました');
    }

    // アップロードされたファイルの公開URLを取得
    const { data: { publicUrl }, error: urlError } = supabase.storage
      .from('stylized-subtitles')
      .getPublicUrl(data.path);

    if (urlError) {
      throw new Error('公開URLの取得に失敗しました');
    }

    res.status(200).json({ url: publicUrl });
  } catch (error) {
    console.error('エラー:', error);
    res.status(500).json({ error: '話者別字幕スタイルの適用中にエラーが発生しました' });
  }
}

async function identifySpeakers(subtitleData: any) {
  try {
    const prompt = `以下の字幕データから話者を識別してください：
${JSON.stringify(subtitleData)}`;
    const response = await getLlmModelAndGenerateContent("Gemini", "あなたは優秀な話者識別AIです。", prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('話者識別APIのリクエストに失敗しました:', error);
    // サンプルデータを返す
    return [
      { speakerId: 1, speakerName: "話者A" },
      { speakerId: 2, speakerName: "話者B" },
    ];
  }
}

function assignStylesToSpeakers(subtitleData: any, speakerIdentificationData: any) {
  const speakerStyles = {
    1: { font: 'Arial', color: '#FF0000' },
    2: { font: 'Helvetica', color: '#0000FF' },
  };

  return subtitleData.map((subtitle: any) => {
    const speaker = speakerIdentificationData.find((s: any) => s.speakerId === subtitle.speakerId);
    if (speaker) {
      return {
        ...subtitle,
        ...speakerStyles[speaker.speakerId as keyof typeof speakerStyles],
      };
    }
    return subtitle;
  });
}