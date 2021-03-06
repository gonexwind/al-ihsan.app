import type { AppProps } from "next/app";
import Head from "next/head";
import { config, dom } from "@fortawesome/fontawesome-svg-core";
import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { AppData, BookmarkedVerse } from "../types";
import { getData, persistData } from "../services/data";
import AppContext from "../context/AppContext";
import "../styles/globals.css";

config.autoAddCss = false;
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const [data, setData] = useState<AppData>(getData());

  function toggleBookmarkVerse(verse: BookmarkedVerse) {
    setData((data) => {
      if (
        data.quran.bookmarkedVerse &&
        data.quran.bookmarkedVerse.numberInQuran === verse.numberInQuran
      ) {
        data.quran.bookmarkedVerse = null;
      } else {
        data.quran.bookmarkedVerse = verse;
      }

      persistData(data);
      return { ...data };
    });
  }

  function toggleStarSurah(number: number) {
    setData((data) => {
      const isStarred = data.quran.starredSurah.indexOf(number) > -1;
      if (isStarred) {
        data.quran.starredSurah = data.quran.starredSurah.filter(
          (n) => n !== number
        );
      } else {
        data.quran.starredSurah = [...data.quran.starredSurah, number];
      }

      persistData(data);
      return { ...data };
    });
  }

  const bookmarkedVerseNumber = useMemo(() => {
    return data.quran.bookmarkedVerse
      ? data.quran.bookmarkedVerse.numberInQuran
      : null;
  }, [data]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider
        value={{
          data,
          toggleBookmarkVerse,
          toggleStarSurah,
          bookmarkedVerseNumber,
        }}
      >
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <style>{dom.css()}</style>
        </Head>
        <div>
          <Component {...pageProps} />
        </div>
      </AppContext.Provider>
    </QueryClientProvider>
  );
}

export default MyApp;
