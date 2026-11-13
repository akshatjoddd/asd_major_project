
import { addDays, isValidISO, isoDate, todayISO } from '../../lib/format';

const KEYWORDS = {
  book: ['book', 'booking', 'ticket', 'tickets', 'buy', 'purchase', 'reserve', 'बुक', 'टिकट', 'बुकिंग', 'ticket chahiye'],
  info: ['info', 'information', 'about', 'details', 'timings', 'hours', 'जानकारी', 'समय', 'टाइमिंग'],
  cancel: ['cancel', 'cancellation', 'refund', 'रद्द', 'कैंसिल', 'radd'],
  language: ['language', 'hindi', 'english', 'भाषा', 'हिंदी', 'अंग्रेजी'],
  entry: ['entry', 'general', 'general entry', 'museum entry', 'प्रवेश', 'सामान्य प्रवेश', 'एंट्री'],
  exhibition: ['exhibition', 'exhibitions', 'gallery', 'प्रदर्शनी', 'एग्ज़िबिशन'],
  show: ['show', 'shows', 'planetarium', 'film', 'शो', 'तारामंडल'],
  timings: ['timings', 'timing', 'hours', 'open', 'opening', 'closing', 'closed', 'समय', 'टाइमिंग', 'खुला'],
  prices: ['price', 'prices', 'rate', 'cost', 'fee', 'ticket price', 'कीमत', 'दाम', 'शुल्क'],
  exhibitionsList: ['exhibitions', 'exhibition list', 'galleries', 'प्रदर्शनियाँ', 'प्रदर्शनी'],
  showsList: ['shows', 'show list', 'planetarium shows', 'शो'],
  confirm: ['confirm', 'yes', 'pay', 'proceed', 'ok', 'okay', 'continue', 'हाँ', 'पुष्टि', 'भुगतान', 'haan'],
  edit: ['edit', 'change', 'modify', 'बदलें', 'संपादित'],
  cancelBooking: ['cancel booking', 'cancel my booking', 'cancel ticket', 'बुकिंग रद्द', 'टिकट रद्द'],
  retryPayment: ['retry', 'try again', 'pay again', 'फिर कोशिश', 'दोबारा भुगतान'],
  newBooking: ['new booking', 'book again', 'another booking', 'नई बुकिंग', 'फिर बुक'],
  menu: ['menu', 'main menu', 'home', 'start', 'मेन्यू', 'मुख्य मेन्यू'],
  back: ['back', 'previous', 'पीछे', 'वापस'],
  restart: ['restart', 'start over', 'reset', 'शुरू', 'फिर से शुरू'],
  help: ['help', 'support', 'मदद', 'सहायता'],
  changeDate: ['change date', 'another date', 'different date', 'तारीख बदलें', 'दूसरी तारीख'],
  today: ['today', 'आज', 'aaj'],
  tomorrow: ['tomorrow', 'कल', 'kal'],
  english: ['english', 'angrezi', 'अंग्रेजी'],
  hindi: ['hindi', 'हिंदी'],
  retryLoad: ['retry', 'try again', 'reload', 'फिर कोशिश', 'दोबारा'],
  retryCancel: ['retry', 'try again', 'फिर कोशिश', 'दोबारा'],
};

const GLOBAL = ['menu', 'back', 'restart', 'language', 'help'];

export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[.,!?;:"'()[\]{}<>/\\|@#$%^&*_+=~`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function contains(haystack, keyword) {
  const needle = keyword.toLowerCase();
  if (!needle) return false;
  if (needle.includes(' ')) return haystack.includes(needle);
  return ` ${haystack} `.includes(` ${needle} `) || haystack.startsWith(`${needle} `) || haystack.endsWith(` ${needle}`);
}

export function matchGlobal(text) {
  const value = normalize(text);
  let best = null;
  let bestScore = 0;
  GLOBAL.forEach((id) => {
    (KEYWORDS[id] || []).forEach((keyword) => {
      if (contains(value, keyword) && keyword.length > bestScore) {
        best = id;
        bestScore = keyword.length;
      }
    });
  });
  return best;
}

export function matchOption(text, options = []) {
  const value = normalize(text);
  if (!value) return null;
  let best = null;
  let bestScore = 0;

  options.forEach((option) => {
    const candidates = [...(KEYWORDS[option.id] || [])];
    if (option.label) candidates.push(normalize(option.label));
    if (option.labelHi) candidates.push(normalize(option.labelHi));
    if (option.value) candidates.push(normalize(String(option.value)));

    candidates.forEach((keyword) => {
      if (keyword && contains(value, keyword) && keyword.length > bestScore) {
        best = option.id;
        bestScore = keyword.length;
      }
    });
  });

  return best;
}

export function matchSlot(text, options = []) {
  const match = String(text).toLowerCase().match(/\b(\d{1,2})[:.](\d{2})\b/);
  if (!match) return null;
  const start = `${match[1].padStart(2, '0')}:${match[2]}`;
  const option = options.find((row) => row.meta?.startTime === start);
  return option ? option.id : null;
}

export function parseDate(text, now = new Date()) {
  const value = normalize(text);
  const loose = String(text).toLowerCase().trim();
  const today = isoDate(now);
  if (contains(value, 'today') || contains(value, 'aaj') || value.includes('आज')) return today;
  if (contains(value, 'tomorrow') || contains(value, 'kal') || value.includes('कल')) return addDays(today, 1);

  let iso = null;
  const isoMatch = loose.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (isoMatch) iso = `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;

  const dmyMatch = loose.match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})\b/);
  if (!iso && dmyMatch) {
    const year = dmyMatch[3].length === 2 ? `20${dmyMatch[3]}` : dmyMatch[3];
    iso = `${year}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
  }

  if (!iso || !isValidISO(iso) || iso < today) return null;
  return iso;
}

export function parseVisitor(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;

  const emailMatch = raw.match(/[^\s@]+@[^\s@]+\.[A-Za-z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = raw.match(/\+?\d[\d\s-]{8,}\d/);
  const digits = phoneMatch ? phoneMatch[0].replace(/\D/g, '') : '';
  const phone = digits.length >= 10 && digits.length <= 13 ? digits : '';

  if (!email && !phone) return null;

  let name = emailMatch ? raw.replace(emailMatch[0], ' ') : raw;
  if (phone) name = name.replace(phoneMatch[0], ' ');
  name = name
    .replace(/\b(email|e-mail|phone|mobile|ईमेल|फ़ोन|फोन)\b\s*:?/gi, ' ')
    .replace(/[,;|/]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (name.length < 2) return null;
  return { name, email, phone };
}

export function parseCounts(text) {
  const value = normalize(text);
  const buckets = {
    adult: /(adult|adults|वयस्क|बड़े)/,
    child: /(child|children|kid|kids|बालक|बच्चे|बच्चा)/,
    student: /(student|students|विद्यार्थी)/,
  };
  const result = {};
  let matched = false;

  Object.entries(buckets).forEach(([key, pattern]) => {
    const expression = new RegExp(`(\\d{1,2})\\s*(?:${pattern.source})`);
    const match = value.match(expression);
    if (match) {
      result[key] = Number(match[1]);
      matched = true;
    }
  });

  if (!matched) {
    const plain = value.match(/^(\d{1,2})$/);
    if (plain) return { adult: Number(plain[1]) };
    return null;
  }
  return result;
}

export { KEYWORDS, todayISO };
