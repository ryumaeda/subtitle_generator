import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  try {
    const { textData, subtitleDesign, filter } = req.body;

    // JSONファイルからテキストデータを取得
    const textContent = textData.text;

    // テキストデータを解析し、タイムスタンプと字幕テキストを抽出
    const subtitles = textContent.split('
').map((line, index) => {
      const [timestamp, text] = line.split(' ', 2);
      return {
        id: index + 1,
        start: timestamp,
        end: (parseInt(timestamp) + 5).toString().padStart(2, '0') + ':00',
        text: text
      };
    });

    // フィルター適用
    const filteredSubtitles = subtitles.filter(subtitle => 
      !filter.split(',').some(word => subtitle.text.toLowerCase().includes(word.trim().toLowerCase()))
    );

    // FCPXMLフォーマットに沿ってデータを構造化
    const fcpxml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.8">
  <resources>
    <format id="r1" name="FFVideoFormat1080p30" frameDuration="1001/30000s" width="1920" height="1080"/>
  </resources>
  <library>
    <event name="字幕イベント">
      <project name="字幕プロジェクト">
        <sequence format="r1">
          <spine>
            ${filteredSubtitles.map(subtitle => `
              <title start="${subtitle.start}" duration="${subtitle.end}" lane="1">
                <text>
                  <text-style font="${subtitleDesign.font}" fontSize="${subtitleDesign.size}" fontColor="${subtitleDesign.color}" backgroundColor="${subtitleDesign.backgroundColor}">
                    ${subtitle.text}
                  </text-style>
                </text>
              </title>
            `).join('')}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;

    // FCPXMLファイルを生成し、Supabaseのストレージにアップロード
    const { data, error } = await supabase.storage
      .from('subtitles')
      .upload(`subtitle_${Date.now()}.fcpxml`, fcpxml, {
        contentType: 'application/xml',
      });

    if (error) {
      throw new Error('FCPXMLファイルのアップロードに失敗しました');
    }

    // 生成されたFCPXMLファイルの公開URLを取得
    const { data: { publicUrl }, error: urlError } = supabase.storage
      .from('subtitles')
      .getPublicUrl(data.path);

    if (urlError) {
      throw new Error('公開URLの取得に失敗しました');
    }

    res.status(200).json({ url: publicUrl });
  } catch (error) {
    console.error('字幕ファイル生成エラー:', error);
    res.status(500).json({ error: '字幕ファイルの生成中にエラーが発生しました' });
  }
}