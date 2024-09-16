import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { user } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: '認証されていません' });
  }

  try {
    const formData = req.body as FormData;
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return res.status(400).json({ error: '動画ファイルが見つかりません' });
    }

    // S3バケットにアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(`${user.id}/${videoFile.name}`, videoFile);

    if (uploadError) {
      throw new uploadError;
    }

    // 音声抽出（この部分は実際のライブラリに合わせて実装する必要があります）
    const audioData = await extractAudioFromVideo(uploadData.path);

    // 音声認識API（例：Google Cloud Speech-to-Text）を使用してテキストに変換
    const transcription = await transcribeAudio(audioData);

    // 変換結果をJSONファイルとして保存
    const jsonFileName = `${user.id}/${Date.now()}_transcription.json`;
    const { data: jsonData, error: jsonError } = await supabase.storage
      .from('transcriptions')
      .upload(jsonFileName, JSON.stringify(transcription));

    if (jsonError) {
      throw jsonError;
    }

    // 保存したJSONファイルのURLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('transcriptions')
      .getPublicUrl(jsonFileName);

    return res.status(200).json({ url: publicUrl });
  } catch (error) {
    console.error('音声テキスト変換エラー:', error);
    return res.status(500).json({ error: '音声テキスト変換中にエラーが発生しました' });
  }
}

async function extractAudioFromVideo(videoPath: string): Promise<ArrayBuffer> {
  try {
    // 実際の音声抽出ライブラリを使用してください
    // この例では、サンプルデータを返しています
    return new ArrayBuffer(1024);
  } catch (error) {
    console.error('音声抽出エラー:', error);
    throw error;
  }
}

async function transcribeAudio(audioData: ArrayBuffer): Promise<any> {
  try {
    // 実際の音声認識APIを使用してください
    // この例では、AI APIを使用してテキスト生成をシミュレートしています
    const prompt = "次の音声データを文字起こししてください: [音声データの説明]";
    const transcription = await getLlmModelAndGenerateContent("Gemini", "あなたは高精度な音声認識AIです。", prompt);
    return transcription;
  } catch (error) {
    console.error('音声認識エラー:', error);
    // エラーが発生した場合、サンプルデータを返す
    return {
      transcription: "これはサンプルの文字起こしテキストです。実際の音声認識結果はここに表示されます。",
      confidence: 0.95
    };
  }
}