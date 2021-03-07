import {
  faArrowLeft,
  faArrowRight,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import format from "date-fns/format";
import id from "date-fns/locale/id";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { FC, useEffect, useMemo, useState } from "react";
import LayoutWithNavbar from "../components/LayoutWithNavbar";
import { getCalendarDates } from "../helpers/calendar";
import { CalendarEvent, DateConversion } from "../types";
import { classNames } from "../helpers/utils";
import { useQuery } from "react-query";
import { getCalendarEvents } from "../services/calendar-events";
import { isFriday, isSunday } from "date-fns";
import Modal from "../components/Modal";
import Code from "../components/Code";
import ExternalLink from "../components/ExternalLink";
import NavbarTitle from "../components/NavbarTitle";

type MonthYear = {
  month: number;
  year: number;
};

const IslamicCalendarPage: NextPage = () => {
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [today] = useState<Date>(new Date(format(new Date(), "yyyy-MM-dd")));
  const [{ month, year }, setMonthYear] = useState<MonthYear>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const { data: events } = useQuery("events", getCalendarEvents);

  const [dates, setDates] = useState<DateConversion[]>(
    getCalendarDates(new Date())
  );

  const date = useMemo(() => {
    const d = new Date();
    d.setMonth(month);
    d.setFullYear(year);
    d.setDate(1);

    return d;
  }, [month, year]);

  const displayEvents: {
    event: CalendarEvent;
    date: DateConversion;
  }[] = useMemo(() => {
    if (!events) {
      return [];
    }

    const dateIndexes: { [key: string]: DateConversion } = dates.reduce(
      (indexes, date) => {
        indexes[`${date.hijri.day}/${date.hijri.month}`] = date;
        return indexes;
      },
      {}
    );

    return events
      .filter((event) => dateIndexes[`${event.day}/${event.month}`])
      .map((event) => ({
        event,
        date: dateIndexes[`${event.day}/${event.month}`],
      }));
  }, [dates, events]);

  const months: string[] = useMemo(() => {
    return dates
      .filter((date) => !date.isOtherMonth)
      .reduce(
        (result, date) =>
          result.indexOf(date.hijri.monthName) > -1
            ? result
            : [...result, date.hijri.monthName],
        []
      );
  }, [dates]);

  useEffect(() => {
    setDates(getCalendarDates(date));
  }, [date]);

  function next() {
    setMonthYear(({ month, year }) => {
      return {
        month: month === 11 ? 1 : month + 1,
        year: month === 11 ? year + 1 : year,
      };
    });
  }

  function prev() {
    setMonthYear(({ month, year }) => {
      return {
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year,
      };
    });
  }

  return (
    <LayoutWithNavbar
      navbarTitle={
        <NavbarTitle
          title="Kalender Islam"
          icon="/icon-islamic-calendar.svg"
        />
      }
      leftButton={
        <Link href="/">
          <span>
            <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer" />
          </span>
        </Link>
      }
      rightButton={
        <span onClick={() => setShowInfo(!showInfo)}>
          <FontAwesomeIcon icon={faInfoCircle} className="cursor-pointer" />
        </span>
      }
    >
      <Head>
        <title>Al-Ihsan Apps &mdash; Kalender Islam</title>
      </Head>

      <ModalInfo shown={showInfo} onClose={() => setShowInfo(false)} />

      <div className="mb-5 w-full mt-3">
        <div className="flex rounded overflow-hidden mt-3 select-none">
          <div
            role="button"
            className="w-2/12 cursor-pointer flex flex-wrap content-center justify-center px-2 py-1 text-white bg-primary"
            onClick={prev}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
          <div className="w-8/12 text-center px-2 py-2 text-sm text-white bg-secondary">
            {format(date, "MMMM yyyy", { locale: id })}
          </div>
          <div
            role="button"
            className="w-2/12 cursor-pointer flex flex-wrap content-center justify-center px-2 py-1 text-white bg-primary"
            onClick={next}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </div>
        </div>
        <div className="rounded overflow-hidden bg-white w-full mt-3 grid grid-cols-7">
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
            <div
              key={day}
              className="select-none text-center border-b text-sm font-semibold px-2 py-1 bg-oxford-blue text-white"
            >
              {day}
            </div>
          ))}
          {dates.map((date) => {
            const isToday =
              !date.isOtherMonth &&
              format(today, "ddMMyyyy") === format(date.date, "ddMMyyyy");
            return (
              <div
                key={date.date.toString()}
                className={classNames([
                  "select-none rounded cursor-default text-center",
                  date.isOtherMonth && "opacity-20",
                  !isToday && "z-0",
                  isToday && "border-2 font-bold shadow-lg z-10",
                  isToday &&
                    date.hijri.monthName === "Muharam" &&
                    "border-muharram-500",
                  isToday &&
                    date.hijri.monthName === "Safar" &&
                    "border-shafar-500",
                  isToday &&
                    date.hijri.monthName === "Rabiulawal" &&
                    "border-rabiul-awal-500",
                  isToday &&
                    date.hijri.monthName === "Rabiulakhir" &&
                    "border-rabiul-akhir-500",
                  isToday &&
                    date.hijri.monthName === "Jumadilawal" &&
                    "border-jumadil-awal-500",
                  isToday &&
                    date.hijri.monthName === "Jumadilakhir" &&
                    "border-jumadil-akhir-500",
                  isToday &&
                    date.hijri.monthName === "Rajab" &&
                    "border-rajab-500",
                  isToday &&
                    date.hijri.monthName === "Syakban" &&
                    "border-syaban-500",
                  isToday &&
                    date.hijri.monthName === "Ramadan" &&
                    "border-ramadhan-500",
                  isToday &&
                    date.hijri.monthName === "Syawal" &&
                    "border-syawal-500",
                  isToday &&
                    date.hijri.monthName === "Zulkaidah" &&
                    "border-zulqaidah-500",
                  isToday &&
                    date.hijri.monthName === "Zulhijah" &&
                    "border-zulhijjah-500",
                ])}
              >
                <span
                  className={classNames([
                    "inline-block p-2 text-sm",
                    isSunday(date.date) && "text-violet-red font-semibold",
                    isFriday(date.date) && "text-primary font-semibold",
                  ])}
                >
                  {format(date.date, "d", { locale: id })}
                </span>
                <span
                  className={classNames([
                    "w-full block text-white text-xs overflow-hidden font-semibold px-1 overflow-ellipsis whitespace-nowrap",
                    date.hijri.monthName === "Muharam" && "bg-muharram-500",
                    date.hijri.monthName === "Safar" && "bg-shafar-500",
                    date.hijri.monthName === "Rabiulawal" &&
                      "bg-rabiul-awal-500",
                    date.hijri.monthName === "Rabiulakhir" &&
                      "bg-rabiul-akhir-500",
                    date.hijri.monthName === "Jumadilawal" &&
                      "bg-jumadil-awal-500",
                    date.hijri.monthName === "Jumadilakhir" &&
                      "bg-jumadil-akhir-500",
                    date.hijri.monthName === "Rajab" && "bg-rajab-500",
                    date.hijri.monthName === "Syakban" && "bg-syaban-500",
                    date.hijri.monthName === "Ramadan" && "bg-ramadhan-500",
                    date.hijri.monthName === "Syawal" && "bg-syawal-500",
                    date.hijri.monthName === "Zulkaidah" && "bg-zulqaidah-500",
                    date.hijri.monthName === "Zulhijah" && "bg-zulhijjah-500",
                  ])}
                >
                  {date.hijri.day}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex content-center">
          {months.map((month) => (
            <div className="text-sm flex flex-wrap content-center justify-center select-none hover:bg-white rounded px-1 py-1 mr-2">
              <span
                className={classNames([
                  "inline-block w-4 h-4 mr-2 rounded",
                  month === "Muharam" && "bg-muharram-500",
                  month === "Safar" && "bg-shafar-500",
                  month === "Rabiulawal" && "bg-rabiul-awal-500",
                  month === "Rabiulakhir" && "bg-rabiul-akhir-500",
                  month === "Jumadilawal" && "bg-jumadil-awal-500",
                  month === "Jumadilakhir" && "bg-jumadil-akhir-500",
                  month === "Rajab" && "bg-rajab-500",
                  month === "Syakban" && "bg-syaban-500",
                  month === "Ramadan" && "bg-ramadhan-500",
                  month === "Syawal" && "bg-syawal-500",
                  month === "Zulkaidah" && "bg-zulqaidah-500",
                  month === "Zulhijah" && "bg-zulhijjah-500",
                ])}
              />
              <span className="inline-block -mt-1 text-oxford-blue opacity-75">
                {month}
              </span>
            </div>
          ))}
        </div>
        {displayEvents.length > 0 && (
          <div className="mt-3">
            <h4 className="mb-2 text-gray-500 font-semibold">Hari Spesial</h4>
            {displayEvents.map((data) => (
              <div className="rounded bg-white w-full px-3 py-2 mb-3 select-none">
                <div className="flex">
                  <div className="flex-grow">
                    <p className="text-sm">
                      <span className="font-semibold text-primary">
                        {data.date.hijri.day} {data.date.hijri.monthName}
                      </span>
                      <span className="mx-2 opacity-20">/</span>
                      <small className="text-secondary font-semibold">
                        {format(data.date.date, "EEEE, dd MMMM", {
                          locale: id,
                        })}
                      </small>
                    </p>
                    <h4 className="text-lg font-semibold text-oxford-blue">
                      {data.event.name}
                    </h4>
                  </div>
                  <div className="w-auto text-2xl flex flex-wrap content-center justify-center">
                    <a
                      className="text-gray-300 hover:text-primary"
                      href={data.event.url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutWithNavbar>
  );
};

export default IslamicCalendarPage;

const ModalInfo: FC<{ shown: boolean; onClose: () => void }> = ({
  shown,
  onClose,
}) => (
  <Modal shown={shown} size="sm">
    <Modal.Header title="Kalender Islam" onClose={onClose} />
    <Modal.Body>
      <p>
        Data penanggalan hijriah diambil menggunakan fungsi bawaan{" "}
        <em>javascript</em>{" "}
        <ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat">
          <Code>Intl.DateTimeFormat</Code>
        </ExternalLink>{" "}
        dengan format <em>locale</em> <Code>id-TN-u-ca-islamic-umalqura</Code>.
      </p>
    </Modal.Body>
  </Modal>
);
