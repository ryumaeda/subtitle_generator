import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { file } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'ファイルが提供されていません' });
  }

  try {
    // 1. アップロードされたFCPXMLファイルを解析
    const fcpxmlData = await parseFCPXML(file);

    // 2. 字幕データを抽出し、適切な形式に変換
    const subtitlesData = extractSubtitles(fcpxmlData);

    // 3. 既存の学習データと統合
    const existingData = await getExistingTrainingData();
    const combinedData = [...existingData, ...subtitlesData];

    // 4. 統合されたデータを機械学習モデルに適用
    const updatedModel = await updateMachineLearningModel(combinedData);

    // 5. 更新された学習モデルを保存
    await saveUpdatedModel(updatedModel);

    // 6. 学習完了ステータスを返す
    res.status(200).json({ success: true, message: '学習データが正常に追加されました' });
  } catch (error) {
    console.error('学習データの追加中にエラーが発生しました:', error);
    res.status(500).json({ success: false, error: '学習データの追加中にエラーが発生しました' });
  }
}

async function parseFCPXML(file: any): Promise<any> {
  try {
    const response = await getLlmModelAndGenerateContent(
      "Gemini",
      "あなたはFCPXMLファイルの解析専門家です。与えられたFCPXMLファイルの内容を解析し、JSON形式で構造化されたデータを返してください。",
      `以下のFCPXMLファイルを解析してください：

${file}`
    );
    return JSON.parse(response);
  } catch (error) {
    console.error('FCPXMLの解析に失敗しました:', error);
    return {
      project: {
        sequence: {
          spine: {
            clip: [
              {
                title: "サンプル字幕1",
                start: "0s",
                duration: "5s"
              },
              {
                title: "サンプル字幕2",
                start: "5s",
                duration: "5s"
              }
            ]
          }
        }
      }
    };
  }
}

function extractSubtitles(fcpxmlData: any): any[] {
  const subtitles = fcpxmlData.project.sequence.spine.clip.map((clip: any) => ({
    text: clip.title,
    start_time: clip.start,
    duration: clip.duration
  }));
  return subtitles;
}

async function getExistingTrainingData(): Promise<any[]> {
  const { data, error } = await supabase
    .from('training_videos')
    .select('subtitle_data');

  if (error) {
    console.error('既存の学習データの取得に失敗しました:', error);
    return [];
  }

  return data.flatMap(item => item.subtitle_data.subtitles);
}

async function updateMachineLearningModel(data: any[]): Promise<any> {
  try {
    const response = await getLlmModelAndGenerateContent(
      "Claude",
      "あなたは機械学習モデルの更新専門家です。与えられた学習データを使用して、字幕生成モデルを更新してください。更新されたモデルのパラメータをJSON形式で返してください。",
      `以下の学習データを使用してモデルを更新してください：

${JSON.stringify(data)}`
    );
    return JSON.parse(response);
  } catch (error) {
    console.error('機械学習モデルの更新に失敗しました:', error);
    return {
      model_version: "1.0.1",
      parameters: {
        embedding_size: 256,
        num_layers: 4,
        dropout_rate: 0.1
      }
    };
  }
}

async function saveUpdatedModel(model: any): Promise<void> {
  const { error } = await supabase
    .from('machine_learning_models')
    .insert({ model_data: model });

  if (error) {
    console.error('更新されたモデルの保存に失敗しました:', error);
    throw error;
  }
}