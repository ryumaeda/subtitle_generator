import { AppProps } from "next/app";
import "../styles/globals.css"; // 必要に応じてグローバルスタイルをインポート

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
