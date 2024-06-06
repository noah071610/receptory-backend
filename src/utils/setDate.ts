import { Langs } from 'src/types';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
function formatDateToEnglish(month: number) {
  return months[month];
}

function getJapaneseEra(year: number) {
  const japaneseEras = [
    { name: '明治', startYear: 1868, endYear: 1912 },
    { name: '大正', startYear: 1912, endYear: 1926 },
    { name: '昭和', startYear: 1926, endYear: 1989 },
    { name: '平成', startYear: 1989, endYear: 2019 },
    { name: '令和', startYear: 2019, endYear: Infinity },
  ];

  for (const era of japaneseEras) {
    if (year >= era.startYear && year < era.endYear) {
      return `${era.name}${year - era.startYear + 1}年`;
    }
  }

  return year;
}

export function dateToString(date: Date) {
  const year = date.getFullYear(); // 연도를 추출합니다.
  const month = date.getMonth(); // 월을 추출하고 2자리로 만듭니다.
  const day = date.getDate(); // 일을 추출하고 2자리로 만듭니다.

  return `${year}/${month + 1}/${day}`;
}

export function stringToDate(date: string, lang: Langs = 'en') {
  const [year, month, day] = date.split('/').map((v) => +v);

  switch (lang) {
    case 'ko':
      return `${year}년 ${month}월 ${day}일`;

    case 'en':
      return `${formatDateToEnglish(month)} ${day}, ${year}`;

    case 'ja':
      return `${getJapaneseEra(year)} ${month}月 ${day}日`;

    case 'th':
      return `พ.ศ. ${year + 543} ${month}. ${day}.`;

    default:
      return `${year}/${month}/${day}`;
  }
}

export function setDateFormat({
  date,
  lang = 'en',
  isTime,
}: {
  date: Date;
  lang: any;
  isTime?: boolean;
}) {
  date = typeof date === 'string' ? new Date(date) : date;

  const year = date.getFullYear(); // 연도를 추출합니다.
  const month = date.getMonth(); // 월을 추출하고 2자리로 만듭니다.
  const day = date.getDate(); // 일을 추출하고 2자리로 만듭니다.
  const hours = date.getHours(); // 일을 추출하고 2자리로 만듭니다.
  const minutes = date.getMinutes(); // 일을 추출하고 2자리로 만듭니다.

  switch (lang) {
    case 'ko':
      return (
        `${year}년 ${month + 1}월 ${day}일` +
        (isTime ? ` ${hours}시 ${minutes}분` : '')
      );

    case 'en':
      return (
        `${formatDateToEnglish(month + 1)} ${day}, ${year}` +
        (isTime ? ` ${hours}:${minutes}` : '')
      );

    case 'ja':
      return (
        `${getJapaneseEra(year)} ${month + 1}月 ${day}日` +
        (isTime ? ` ${hours}時${minutes}分` : '')
      );

    case 'th':
      return (
        `พ.ศ. ${year + 543} ${month + 1}. ${day}.` +
        (isTime ? ` ${hours}:${minutes}` : '')
      );

    default:
      return (
        `${year}/${month + 1}/${day}` + (isTime ? ` ${hours}:${minutes}` : '')
      );
  }
}
// พ.ศ. 2562
