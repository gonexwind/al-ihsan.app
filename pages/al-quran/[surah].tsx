import {
  faArrowLeft,
  faBars,
  faChevronLeft,
  faChevronRight,
  faForward,
  faInfoCircle,
  faPause,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { useImmerReducer } from "use-immer";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import LayoutWithNavbar from "../../components/LayoutWithNavbar";
import VerseCard from "../../components/VerseCard";
import { mergeClasses } from "../../helpers/utils";
import useAppContext from "../../hooks/useAppData";
import {
  getDetailSurah,
  getListSurah,
  getPrevAndNextSurah,
} from "../../services/al-quran";
import { PrevAndNextSurah, SurahDetail } from "../../types";

interface SurahPageProps {
  surah: SurahDetail;
  metadata: PrevAndNextSurah;
}

interface SurahPageState {
  isAudioLoading: boolean;
  isPlayTrack: boolean;
  audioSrc: string | null;
  playedVerseNumber: number | null;
}

type SurahPageAction =
  | { type: "play_all"; src: string }
  | { type: "play_audio"; src: string; verseNumber?: number }
  | { type: "set_audio_loading"; loading: boolean }
  | { type: "set_play_track"; playTrack: boolean }
  | { type: "stop_audio" };

function reducer(state: SurahPageState, action: SurahPageAction) {
  switch (action.type) {
    case "play_all": {
      state.audioSrc = action.src;
      state.playedVerseNumber = null;
      state.isPlayTrack = true;
      break;
    }
    case "play_audio": {
      state.audioSrc = action.src;
      state.playedVerseNumber = action.verseNumber || null;
      break;
    }
    case "set_audio_loading": {
      state.isAudioLoading = action.loading;
      break;
    }
    case "set_play_track": {
      state.isPlayTrack = action.playTrack;
      break;
    }
    case "stop_audio": {
      state.isPlayTrack = false;
      state.playedVerseNumber = null;
      state.audioSrc = null;
      state.isAudioLoading = false;
      break;
    }
  }
}

const initialState: SurahPageState = {
  isAudioLoading: false,
  isPlayTrack: false,
  audioSrc: null,
  playedVerseNumber: null,
};

const SurahPage: NextPage<SurahPageProps> = ({ surah, metadata }) => {
  const { bookmarkedVerseNumber, toggleBookmarkVerse } = useAppContext();
  const [audio, setAudio] = useState<HTMLAudioElement>(null);
  const [
    { isAudioLoading, isPlayTrack, audioSrc, playedVerseNumber },
    dispatch,
  ] = useImmerReducer(reducer, initialState);

  useEffect(() => {
    if (process.browser) {
      setAudio(new Audio());
    }
  }, [process]);

  useEffect(() => {
    if (!audio) {
      return;
    }

    if (audioSrc) {
      audio.src = audioSrc;
    } else {
      audio.src = "";
      audio.pause();
    }

    return () => audio && audio.pause();
  }, [audio, audioSrc]);

  useEffect(() => {
    if (!audio) {
      return;
    }

    audio.onloadstart = () =>
      dispatch({ type: "set_audio_loading", loading: true });
    audio.oncanplay = () => {
      dispatch({ type: "set_audio_loading", loading: false });
      audio.play();
    };

    audio.onended = () => {
      const playTrackIsAtPreVerse =
        isPlayTrack && audioSrc && playedVerseNumber === null;
      const playTrackIsInVerse = isPlayTrack && audioSrc && playedVerseNumber;

      if (playTrackIsInVerse) {
        const verseIndex = surah.verses.findIndex(
          (verse) => verse.number.inSurah === playedVerseNumber
        );
        const nextVerse = surah.verses[verseIndex + 1];
        if (nextVerse) {
          dispatch({
            type: "play_audio",
            src: nextVerse.audio.primary,
            verseNumber: nextVerse.number.inSurah,
          });
        } else {
          dispatch({ type: "stop_audio" });
        }
      } else if (playTrackIsAtPreVerse) {
        const firstVerse = surah.verses[0];
        dispatch({
          type: "play_audio",
          src: firstVerse.audio.primary,
          verseNumber: firstVerse.number.inSurah,
        });
      } else {
        dispatch({ type: "stop_audio" });
      }
    };
  }, [audio, surah, playedVerseNumber, isPlayTrack]);

  if (!surah) {
    return <span>Surah Data Not Found</span>;
  }

  return (
    <LayoutWithNavbar
      navbarTitle={
        <span>
          <img
            src="/icon-quran.svg"
            alt="Al-Qur'an"
            className="h-5 inline-block mr-2 -mt-1"
          />
          Surah {surah.name.transliteration.id}
        </span>
      }
      leftButton={
        <Link href="/al-quran">
          <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer" />
        </Link>
      }
      rightButton={
        <span>
          <FontAwesomeIcon icon={faInfoCircle} className="cursor-pointer" />
        </span>
      }
    >
      <Head>
        <title>
          Al-Ihsan Apps &mdash; Al-Qur'an &middot; Surah{" "}
          {surah.name.transliteration.id}
        </title>
      </Head>
      <div className="mb-5 w-full">
        <div className="mt-5 w-full grid grid-cols-1 gap-4">
          {surah.preBismillah && (
            <div className="flex px-1 w-full justify-between content-center text-oxford-blue text-2xl mb-3">
              <div className="w-auto">
                {!isPlayTrack && (
                  <ButtonCircle
                    className="bg-gray-400 hover:bg-violet-red hover:shadow-lg"
                    icon={faForward}
                    onClick={() =>
                      dispatch({
                        type: "play_all",
                        src: surah.preBismillah.audio.primary,
                      })
                    }
                  />
                )}
                {isPlayTrack && playedVerseNumber && (
                  <ButtonCircle
                    className="bg-gray-400 hover:bg-violet-red hover:shadow-lg"
                    icon={faForward}
                    onClick={() =>
                      dispatch({
                        type: "play_all",
                        src: surah.preBismillah.audio.primary,
                      })
                    }
                  />
                )}
                {isPlayTrack && !playedVerseNumber && (
                  <ButtonCircle
                    className="bg-violet-red hover:shadow-lg"
                    icon={faPause}
                    onClick={() =>
                      dispatch({
                        type: "stop_audio",
                      })
                    }
                  />
                )}
              </div>
              <h4 className="font-arab text-3xl inline-block opacity-75">
                {surah.preBismillah.text.arab}
              </h4>
            </div>
          )}
          {surah.verses.map((verse) => (
            <div key={verse.number.inSurah} className="w-full">
              <VerseCard
                key={verse.number.inSurah}
                number={verse.number.inSurah}
                arab={verse.text.arab}
                latin={verse.text.transliteration.en}
                translation={verse.translation.id}
                isBookmarked={bookmarkedVerseNumber === verse.number.inQuran}
                isAudioLoading={isAudioLoading}
                isAudioPlaying={playedVerseNumber === verse.number.inSurah}
                isPlayTrack={isPlayTrack}
                onClickPlay={() =>
                  dispatch({
                    type: "play_audio",
                    src: verse.audio.primary,
                    verseNumber: verse.number.inSurah,
                  })
                }
                onClickPlayTrack={() =>
                  dispatch({ type: "set_play_track", playTrack: true })
                }
                onClickStop={() => dispatch({ type: "stop_audio" })}
                onClickBookmark={() => {
                  toggleBookmarkVerse({
                    surahNumber: surah.number,
                    surahName: surah.name.transliteration.id,
                    numberInQuran: verse.number.inQuran,
                    numberInSurah: verse.number.inSurah,
                  });
                }}
              />
            </div>
          ))}
          <div className="flex flex-wrap w-full">
            <div className="w-5/12 text-center">
              {metadata.prev && (
                <Link href={`/al-quran/${metadata.prev.number}`}>
                  <div role="button" className="cursor-pointer bg-oxford-blue text-white px-2 py-2 text-sm rounded overflow-ellipsis">
                    <span className="inline-block mr-2"><FontAwesomeIcon icon={faChevronLeft} /></span>
                    {metadata.prev.name.transliteration.id}
                  </div>
                </Link>
              )}
            </div>
            <div className="w-2/12 text-center px-2">
              <Link href="/al-quran">
                <div role="button" className="cursor-pointer rounded bg-secondary text-white text-center px-2 py-2 text-sm">
                  <FontAwesomeIcon icon={faBars}/>
                </div>
              </Link>
            </div>
            <div className="w-5/12 text-center">
              {metadata.next && (
                <Link href={`/al-quran/${metadata.next.number}`}>
                  <div role="button" className="cursor-pointer bg-oxford-blue text-white px-2 py-2 text-sm rounded overflow-ellipsis">
                    {metadata.next.name.transliteration.id}
                    <span className="inline-block ml-2"><FontAwesomeIcon icon={faChevronRight} /></span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutWithNavbar>
  );
};

export default SurahPage;

const ButtonCircle: FC<{
  className: string;
  onClick: () => void;
  icon: IconDefinition;
}> = ({ className, onClick, icon }) => (
  <div
    role="button"
    className={mergeClasses(
      [
        "cursor-pointer inline-block rounded-full w-7 h-7",
        "text-center leading-6 text-sm text-white",
      ],
      className
    )}
    onClick={onClick}
  >
    <FontAwesomeIcon icon={icon} />
  </div>
);

interface SurahPageContext {
  params: {
    surah: string;
  };
}

export const getStaticProps: GetStaticProps<SurahPageProps> = async ({
  params,
}: SurahPageContext) => {
  const surah = await getDetailSurah(parseInt(params.surah));
  const prevAndNext = await getPrevAndNextSurah(surah.number);
  return {
    props: {
      surah,
      metadata: prevAndNext,
    },
  };
};

export const getStaticPaths: GetStaticPaths<{ surah: string }> = async () => {
  const listSurah = await getListSurah();
  return {
    paths: listSurah.map((surah) => ({
      params: {
        surah: surah.number.toString(),
      },
    })),
    fallback: false,
  };
};
