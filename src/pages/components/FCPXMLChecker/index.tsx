// components/FCPXMLChecker.jsx
import { useState, useEffect } from "react";

const FCPXMLChecker = ({ fileName }) => {
  const [exists, setExists] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/check-fcpxml?fileName=${encodeURIComponent(fileName)}`
        );
        const data = await res.json();
        if (data.exists) {
          setExists(true);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error checking FCPXML file:", error);
      }
    }, 5000); // 5秒ごとにチェック

    return () => clearInterval(interval);
  }, [fileName]);

  if (exists) {
    return (
      <a
        href={`https://${process.env.NEXT_PUBLIC_FCPXML_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileName}`}
        download
      >
        .fcpxmlファイルをダウンロード
      </a>
    );
  }

  return <p>.fcpxmlファイルの生成を待っています...</p>;
};

export default FCPXMLChecker;
