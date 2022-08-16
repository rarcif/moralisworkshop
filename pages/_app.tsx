import { MoralisProvider } from "react-moralis";
import "../styles/globals.css";
import type { AppProps } from 'next/app'

const MyApp: React.FC<any> = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <MoralisProvider
      serverUrl={process.env.NEXT_PUBLIC_SERVER_URL as any}
      appId={process.env.NEXT_PUBLIC_APP_ID as any}
    >
      <Component {...pageProps} />
    </MoralisProvider>
  );
}

export default MyApp;
