import moment from 'moment';

import { IDataset, ISimpleAuthorization, IUserData } from '../data/types';

import { generateDiceAdventurer } from './avatars';

export function isEmpty(obj: object) {
  return obj ? Object.keys(obj).length === 0 : true;
}

export const padNumberIfLessThan10 = (n: number, padWith: string = '0') =>
  n < 10 ? `${padWith}${n}` : n;

export async function pingGoogle() {
  return window.navigator.onLine;
}

export function constainsSubstring_i(needle: string, haystack: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export function containsStringInStringArr(q: string, arr: string[]) {
  //strict
  return arr.some((el) => {
    return el === q;
  });
}

export function containsNumberInNumberArr(q: number, arr: number[]) {
  //strict
  return arr.some((el) => {
    return el === q;
  });
}

export function containsStringInStringArr_i(q: string, arr: string[]) {
  if (q) {
    return arr.some((el) => {
      return el.toLowerCase() === q.toLowerCase();
    });
  }
  return false; // we dont compare nulls, :/
}

export function containsStringOrNumberInStringArr_i(q: string, arr: string[]) {
  if (q) {
    return arr.some((el) => {
      return el.toLowerCase() === q.toLowerCase() || Number(el) === Number(q);
    });
  }
  return false; // we dont compare nulls, :/
}

export function containsUser_i(q: string, arr: IUserData[]) {
  if (q) {
    return arr.some((el) => {
      return el.email.toLowerCase() === q.toLowerCase();
    });
  }
  return false; // we dont compare nulls, :/
}

export function containsSimpleAuthorization_i(
  q: string,
  arr: ISimpleAuthorization[]
) {
  if (q) {
    return arr.some((el) => {
      return el.operation.toLowerCase() === q.toLowerCase();
    });
  }
  return false; // we dont compare nulls, :/
}

export function containsDataset_i(q: string, arr: IDataset[]) {
  if (q) {
    return arr.some((el) => {
      return el.label.toLowerCase() === q.toLowerCase();
    });
  }
  return false; // we dont compare nulls, :/
}

export function equalStrings_i(str1?: string, str2?: string) {
  if (str1 && str2) {
    return str1.toLowerCase() === str2.toLowerCase();
  }
  return false; // we dont compare nulls, :/
}

export function equalNumbers_i(num1?: number, num2?: number) {
  if (num1 && num2) {
    return num1 === num2;
  }
  return false; // we dont compare nulls, :/
}

export function noSpacesPlease(str: string) {
  return str.replace(/\s/g, '');
}

export function noMultipleSpacesPlease(str: string) {
  return str.replace(/\s\s+/g, ' ');
}

export function noLineBreaksPlease(str: string) {
  return str.replace(/[\n\r]/g, '');
}

export function noCommasPlease(str: string) {
  return str.replace(/,/g, '');
}

export function removeNumberBulletsPlease(str: string) {
  //IN:6. Be polite.
  //OUT:Be polite.
  return str ? str.replace(/^\d+\./, '').trim() : '';
}

export function removeLeadingFullstopPlease(str: string) {
  //IN:. 6
  //OUT:6
  return str ? str.replace(/^\./, '').trim() : '';
}

export function removeLeadingCommaPlease(str: string) {
  //IN:, 666
  //OUT:666
  return str ? str.replace(/^\,/, '').trim() : '';
}

export function removeLeadingHashSignPlease(str: string) {
  //IN:# 666
  //OUT:666
  return str ? str.replace(/^\#/, '').trim() : '';
}

export function removeLeadingDPlease(str: string) {
  //IN:# 666
  //OUT:666
  return str ? str.replace(/^D\s/, '').trim() : '';
}

export function removeTrailingFullstopPlease(str: string) {
  //IN:6.
  //OUT:6
  return str ? str.replace(/\.$/, '').trim() : '';
}

export function removingLeadingChunkBeforeSplitterChunk(
  input: string,
  splitterChunk: string,
  prependSplitterChunk: boolean = true
) {
  //IN: 'https://www.google.com/analytics';
  //IN splitterChunk: 'google.com';
  //OUT: /analytics

  const output = input.substring(
    input.indexOf(splitterChunk) + splitterChunk.length
  );

  return prependSplitterChunk ? splitterChunk + output : output;
}

export function removeOneOccurencePlease(needle: string, haystack: string) {
  return needle && haystack ? haystack.replace(needle, '').trim() : '';
}

export function exceptConjuctionsFromTitleCasePlease(haystack: string) {
  if (haystack) {
    //' Or ', ' And ', ' With ', ' Scripts'
    let step1 = titleCasePlease(haystack);

    let step2 = step1.replace(/\sOr\s/g, ' or ');
    let step3 = step2.replace(/\sAnd\s/g, ' and ');
    let step4 = step3.replace(/\sWith\s/g, ' with ');

    return step4;
  }
  return haystack;
}

export function stripTags(str: string) {
  return str.replace(/<\/?[^>]+(>|$)/g, '');
}

export function replaceNonAsciiQuotes(
  str: string,
  replaceSingleWith: string = "'",
  replaceDoubleWith: string = '"'
) {
  let step1 = str.replace(/[‘’]/g, replaceSingleWith);
  let step2 = step1.replace(/["“”]/g, replaceDoubleWith);
  return step2;
}

export function removeBrackets(str: string) {
  return str.replace(/["\(\)”]/g, '');
}

export function separateCamelCaseWord(str: string) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}
export function wikiWandPlease(str: string) {
  //IN:https://en.wikipedia.org/wiki/Xi_Jinping
  //OUT:https://www.wikiwand.com/en/Xi_Jinping
  return str
    ? str.replace(/en.wikipedia.org\/wiki/g, 'www.wikiwand.com/en')
    : '';
}

export function noUnderscoresPlease(str: string) {
  return str.replace(/_/g, ' ');
}

export function noSpacesLeadingAndTrailingPlease(str: string) {
  return str.trim();
}

export function removeBracketsAndTextItSurrounds(str: string) {
  return str.replace(/ *\([^)]*\) */g, '');
}

export function removeSquareBracketsAndTextItSurrounds(str: string) {
  return str.replace(/ *\[[^)]*\] */g, '');
}

export function extractTextWithinBrackets(
  str: string,
  returnBracketsPairAtIndex: number = 0
) {
  // var str = '(Charles) de (Gaulle), (Paris) [CDG]';
  var reBrackets = /\((.*?)\)/g;
  var listOfText = [];
  var found;
  while ((found = reBrackets.exec(str))) {
    listOfText.push(found[1]);
  }
  return listOfText.length > 0 ? listOfText[returnBracketsPairAtIndex] : '';
}

export function underscoreSpaces(str: string) {
  return str.replace(/\s/g, '_');
}

export function hyphenateSpaces(str: string) {
  return str.replace(/\s/g, '-');
}

export function spacifySlashes(str: string) {
  return str.replace(/\//g, ' / ');
}

export function camelize(str: string) {
  return str.replace(
    /(?:^\w|[A-Z]|\b\w|\s+)/g,
    function (match: string, index: number) {
      if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    }
  );
}

export function pascalize(str: string) {
  return str
    .toLowerCase()
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w*)/, 'g'),
      ($1, $2, $3) => `${$2.toUpperCase() + $3}`
    )
    .replace(new RegExp(/\w/), (s) => s.toUpperCase());
}

export function pascalizeNonTitleCaseAnd(str: string) {
  let step1 = pascalize(str);
  let step2 = step1.replace(/And/g, 'and');
  return step2;
}

export function slugify(str: string) {
  return String(str)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks, thn=ank to https://byby.dev/js-slugify-string
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-'); // remove consecutive hyphens
}

export function capitalizeFirstLetter(input: string) {
  let str = input.trim();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function stripUTC(str: string) {
  return str == 'UTC' ? '+00:00' : str.split('UTC')[1];
}

export function determinePlural(input: number) {
  return input == 1 ? '' : 's';
}

export function determinePluralPrefix(input: number) {
  return input == 1 ? 'just' : 'a total of';
}

export function determineComma(idx: number, total: number) {
  if (idx == total - 2 && total > 1) {
    return ' and ';
  }
  return idx + 1 < total ? ', ' : '';
}

export function determineSeparator(
  idx: number,
  total: number,
  separator: string = '\n'
) {
  if (idx == total - 2 && total > 1) {
    return `${separator}`;
  }
  return idx + 1 < total ? `${separator}` : ``;
}

export function simpleErrorPlease(verbose: any) {
  let err = verbose.toString();
  if (err.toLowerCase().includes('certificate has expired'.toLowerCase())) {
    err = 'Certificate Expired';
  }
  if (err.toLowerCase().includes('FetchError'.toLowerCase())) {
    err = 'FetchError';
  }
  return err;
}

export function titleCasePlease(input: string) {
  if (input) {
    let str = input.toLowerCase();

    return str.replace(/\b\w+/g, function (s) {
      return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
    });
  }
  return input;
}

export function thousandsOfCommas(x: any) {
  return parseInt(x).toLocaleString();
}

export function thousandsOfCommasWithPrecision(
  x: number,
  digitsToKeep: number = 2
) {
  let precision = digitsToKeep;
  //maximumFractionDigits: =flexible; precision check takes care of currencies, there is no zero out unless it is < 0.000001
  //minimumFractionDigits: =2; pads with zero to beautify those currencies if rounded to 1 or zero decimal places
  //don't need commas? use truncateCurrency() it also applies flexible precision

  switch (true) {
    case x < 0.00001:
      precision = digitsToKeep + 5;
      break;
    case x < 0.0001:
      precision = digitsToKeep + 4;
      break;
    case x < 0.001:
      precision = digitsToKeep + 3;
      break;
    case x < 0.01:
      precision = digitsToKeep + 3;
      break;
    case x < 0.1:
      precision = digitsToKeep + 2;
      break;
    default:
  }
  return x.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: precision,
  });
}

export function timeToSeconds(h: number, m: number, s: number) {
  return h * 3600 + m * 60 + s;
}

export function isNegative(num: number) {
  //-0 is positive
  if (Math.sign(num) === -1) {
    return true;
  }

  return false;
}

export function isNegativeRegex(str: string) {
  //-0 is negative
  var match = /^-/i.test(str);

  return match;
}

export function validJwtInput(str: string) {
  var match = /[a-zA-Z0-9-_.]+/i.test(str);
  return match;
}

export function utcOffsetToSeconds(offset: string) {
  if (offset == null) {
    return 0;
  }

  //1. split the offset..
  //in: +00:30
  //in: +02:15
  //in: -01:00

  let hh = Math.abs(parseInt(offset.split(':')[0]));
  let mm = Math.abs(parseInt(offset.split(':')[1]));

  //2. -ve tz? make both hr and minute -ve..

  if (isNegativeRegex(offset)) {
    hh = hh * -1;
    mm = mm * -1;
  }

  //3. add them up..
  return timeToSeconds(hh, mm, 0);
}

export function typeIsArray(input: any) {
  return input.constructor.name == 'Array';
}

export function niceMonthPlease(m: number, abbr: boolean = false) {
  //in: m
  //out: nice

  const calendarMonthsNice: string[] = [
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
  const calendarMonthsAbbr: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return abbr ? calendarMonthsAbbr[m - 1] : calendarMonthsNice[m - 1];
}

export function padNumber(n: number, width = 3, z = 0) {
  return (String(z).repeat(width) + String(n)).slice(String(n).length);
}

export function truncateString(
  str: string,
  length: number,
  elipsis: string = '..'
) {
  if (str) {
    return str.length > length ? str.substring(0, length - 3) + elipsis : str;
  }
  return '';
}

export function roundMe(input: number, decimalPlaces: number = 2) {
  if (decimalPlaces == 0) {
    return Math.round(input);
  }
  return Math.round(input * (10 * decimalPlaces)) / (10 * decimalPlaces);
}

export function truncateCurrency(x: number, digitsToKeep: number = 2) {
  let precision = digitsToKeep;
  //note: a flexible precision takes care of worst performing currencies during forex comparisons against the best ones ie no forex rate has 1 XXX = 0 USD

  switch (true) {
    case x < 0.00001:
      precision = digitsToKeep + 5;
      break;
    case x < 0.0001:
      precision = digitsToKeep + 4;
      break;
    case x < 0.001:
      precision = digitsToKeep + 3;
      break;
    case x < 0.01:
      precision = digitsToKeep + 3;
      break;
    case x < 0.1:
      precision = digitsToKeep + 2;
      break;
    default:
  }

  const d = Math.pow(10, precision);
  return Math.round((x + Number.EPSILON) * d) / d;
}

export function abbreviateNumber(input: string) {
  var n: number = Number(input.replace(/\,/g, ''));
  if (n < 1e3) return `${n}`;
  if (n >= 1e3 && n < 1e6) return `${(n / 1e3).toFixed(1)} K`;
  if (n >= 1e6 && n < 1e9) return `${(n / 1e6).toFixed(1)} M`;
  if (n >= 1e9 && n < 1e12) return `${(n / 1e9).toFixed(1)} B`;
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)} T`;
}

export function timeAgo(d: string) {
  return moment(d).fromNow();
}

export function seedLatinAlphabetString(input: string) {
  let numSeed: string = '';
  for (let i = 0; i < input.length; i++) {
    let pos = input.charCodeAt(i) - 96;
    // console.log(
    //   `!!xter ${input[i]} with offset -96 sits at pos ${pos} in the ascii table`
    // );
    numSeed = numSeed + `${pos}`;
  }

  return numSeed;
}

export function walkStringXters(str: string, k: number) {
  // IN: str = "abc", k = 2
  // OUT: cde
  let newS = '';

  // iterate for every characters
  for (let i = 0; i < str.length; ++i) {
    // ASCII value
    let val = str[i].charCodeAt(0);
    // store the duplicate
    let dup = k;

    // if k-th ahead character exceed 'z'
    if (val + k > 122) {
      k -= 122 - val;
      k = k % 26;

      newS += String.fromCharCode(96 + k);
    } else {
      newS += String.fromCharCode(val + k);
    }

    k = dup;
  }
  // console.log(`~~walked string ${str} with offset ${k}==> ${newS}`);

  return newS;
}

export const generateRandomAvatarUrl = (email: string) => {
  {
    let seed = seedLatinAlphabetString(email);
    const avatarUrl = generateDiceAdventurer(seed);
    return avatarUrl;
  }
};

export const shuffle = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remains elements to shuffle.
  while (currentIndex != 0) {
    // Pick element..
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element..
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

export const isNumeric = (value: string) => {
  //matches +ve integers only
  return /^-?\d+$/.test(value);
};

export const isNumericWithOptionalDecimalPoint = (value: string) => {
  //matches +ve integers or real numbers
  //https://regexr.com or https://regex101.com
  return /^\d*\.?\d*$/.test(value);
};

export const wait = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

/*RETURN TYPE REFACTORED*/
//todo: refactor all above
export function normalizeUrl(input: string): string {
  //in "example.com" out "http://example.com"
  //in "https://example.com?a=2&b=1" out "https://example.com"
  //in "https://example.com?" out "https://example.com"
  //to lowercase
  //add http if https not present
  //handle rhs params
  //return

  let output = input.toLowerCase();
  if (!input.startsWith('http')) {
    output = `http://${input}`;
  }

  output = output.replace('www.', '').trim();

  if (output.endsWith('?')) {
    //clean off that trailing ? if no params follow it
    output = output.replace('?', '').trim();
  }

  //strip  off ? if nothing on rhs, :|
  const arrQuestionmark = output.split('?');
  let rhsQuestionmark = null;
  if (arrQuestionmark.length > 0) {
    rhsQuestionmark =
      arrQuestionmark[1] == '' || arrQuestionmark[1] == undefined
        ? null
        : arrQuestionmark[1];

    let paramsList: string[] = [];
    if (rhsQuestionmark) {
      //sort params for comparison in order
      let params = rhsQuestionmark;
      let paramsArr = params.split('&');
      for (let j = 0; j < paramsArr.length; j++) {
        paramsList.push(paramsArr[j]);
      }

      output = output.replace(`${params}`, `${paramsList.sort()}`).trim();
    }
  }

  // const arrFullColon = output.split('://');
  // console.log(`raw url->${input} split with :// --> ${arrFullColon[0]} split ? rhs-> ${rhsQuestionmark} --> output ${output}`);

  return output;
}

export function stripHashTagz(input: string): string {
  let output = input.replace(/#/g, ''); //# only

  return output;
}

export function stripHtmlTagz(input: string): string {
  let deTagged = input.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, ''); //html tags
  let output = deTagged.replace(/\n/g, ''); //new lines

  return output;
}

export function stripLinkz(input: string): string {
  let output = input.replace(
    /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/g,
    ''
  ); //urls https://daringfireball.net/2010/07/improved_regex_for_matching_urls
  return output;
}

export function stripScriptz(input: string): string {
  let output = input.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi,
    ''
  );
  return output;
}

export function stripStylez(input: string): string {
  let output = input.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style\s*>/gi,
    ''
  );
  return output;
}

export const loadMyScript = (url: string, callback?: () => void) => {
  let script: HTMLScriptElement;
  const scripts = Array.from(document.querySelectorAll('script'));
  const existingScript = scripts.find((script) => script.src === url);
  if (existingScript) {
    script = existingScript;
  } else {
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  if (script.src && callback) {
    script.onload = () => callback();
  }
};

export const determineDefaultAvatar = (user: IUserData) => {
  return user.avatar ? user.avatar : generateRandomAvatarUrl(user.email);
};

export function validJsonString(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export const validEmail = (email: any) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const validPassword = (password: any) => {
  return String(password) //dont convert to lowercase!!
    .match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/);
};

export const keepCurrentSelectOption = (
  selectInputId: string,
  currentValue: string,
  selectedValue: string
) => {
  let element: any = document.getElementById(selectInputId);

  if (element) {
    for (let opt of element.options) {
      if (selectedValue == opt.value) {
        element.value = currentValue;
        return;
      }
    }
  }
};

export function utf8_to_b64(str: string) {
  return Buffer.from(str).toString('base64');
}

export function b64_to_utf8(encodedStr: string) {
  return Buffer.from(encodedStr, 'base64').toString();
}

export function determineLeastAllocUser(users: IUserData[]) {
  let leastAllocUser = users[0];
  let leastAllocUserItemCount = 0;

  if (users[0].clientAssignments) {
    leastAllocUserItemCount = users[0].clientAssignments.length;
  }

  for (let i = 0; i < users.length; i++) {
    const user: IUserData = users[i];

    let scoreEntry = `==> assignments for user ${user._id}::${user.clientAssignments?.length} --${user.email} `;
    console.log(scoreEntry);

    if (
      user.clientAssignments &&
      user.clientAssignments.length < leastAllocUserItemCount
    ) {
      leastAllocUserItemCount = user.clientAssignments.length;
      leastAllocUser = user;
    }
  }

  return leastAllocUser;
}

export function isEven(n: number) {
  return n % 2 == 0;
}

export function isOdd(n: number) {
  return Math.abs(n % 2) == 1;
}
