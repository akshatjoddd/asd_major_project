import { describe, expect, it } from 'vitest';
import { matchGlobal, matchOption, matchSlot, parseCounts, parseDate, parseVisitor, normalize } from './nlu';

const now = new Date(2026, 10, 11); // 11 Nov 2026

const options = [
  { id: 'book', labelKey: 'option.book' },
  { id: 'info', labelKey: 'option.info' },
  { id: 'entry', labelKey: 'option.entry' },
  { id: 'show', labelKey: 'option.show' },
];

describe('normalize', () => {
  it('lowercases, strips punctuation and collapses spaces', () => {
    expect(normalize('  Book   a TICKET!! ')).toBe('book a ticket');
  });
});

describe('matchGlobal', () => {
  it('finds commands in English and Hindi', () => {
    expect(matchGlobal('menu')).toBe('menu');
    expect(matchGlobal('go back')).toBe('back');
    expect(matchGlobal('फिर से शुरू')).toBe('restart');
    expect(matchGlobal('भाषा')).toBe('language');
  });

  it('returns null for unrelated text', () => {
    expect(matchGlobal('planetarium timings')).toBeNull();
  });
});

describe('matchOption', () => {
  it('matches English, Hindi and Hinglish keywords', () => {
    expect(matchOption('i want to book', options)).toBe('book');
    expect(matchOption('प्रदर्शनी', [...options, { id: 'exhibition' }])).toBe('exhibition');
    expect(matchOption('ticket chahiye', options)).toBe('book');
    expect(matchOption('show', options)).toBe('show');
  });

  it('matches loaded option labels', () => {
    const loaded = [{ id: 'exhibition:2', label: 'Human Biology', labelHi: 'मानव जीव विज्ञान' }];
    expect(matchOption('human biology please', loaded)).toBe('exhibition:2');
    expect(matchOption('मानव जीव विज्ञान', loaded)).toBe('exhibition:2');
  });

  it('ignores options that are not offered', () => {
    expect(matchOption('show me the gallery', [{ id: 'book' }])).toBeNull();
  });
});

describe('parseDate', () => {
  it('understands today, tomorrow and Hindi words', () => {
    expect(parseDate('today', now)).toBe('2026-11-11');
    expect(parseDate('tomorrow', now)).toBe('2026-11-12');
    expect(parseDate('कल', now)).toBe('2026-11-12');
    expect(parseDate('आज', now)).toBe('2026-11-11');
  });

  it('parses ISO and day-first dates', () => {
    expect(parseDate('2026-12-05', now)).toBe('2026-12-05');
    expect(parseDate('05/12/2026', now)).toBe('2026-12-05');
    expect(parseDate('5-12-26', now)).toBe('2026-12-05');
  });

  it('rejects past, malformed and impossible dates', () => {
    expect(parseDate('2026-11-01', now)).toBeNull();
    expect(parseDate('31/02/2026', now)).toBeNull();
    expect(parseDate('sometime next week', now)).toBeNull();
  });
});

describe('parseCounts', () => {
  it('reads quantities per category', () => {
    expect(parseCounts('2 adults and 1 child')).toEqual({ adult: 2, child: 1 });
    expect(parseCounts('3 students')).toEqual({ student: 3 });
  });

  it('treats a bare number as adults', () => {
    expect(parseCounts('2')).toEqual({ adult: 2 });
    expect(parseCounts('hello')).toBeNull();
  });
});

describe('parseVisitor', () => {
  it('extracts a name and email from one message', () => {
    expect(parseVisitor('Asha Rao, asha@example.com')).toEqual({
      name: 'Asha Rao',
      email: 'asha@example.com',
      phone: '',
    });
  });

  it('extracts a phone number written with spaces', () => {
    expect(parseVisitor('Rohan 98765 43210')).toEqual({
      name: 'Rohan',
      email: '',
      phone: '9876543210',
    });
  });

  it('handles contact labels and both contacts', () => {
    expect(parseVisitor('Meera email meera@example.com phone 9876543210')).toEqual({
      name: 'Meera',
      email: 'meera@example.com',
      phone: '9876543210',
    });
  });

  it('rejects a bare contact with no name', () => {
    expect(parseVisitor('asha@example.com')).toBeNull();
    expect(parseVisitor('9876543210')).toBeNull();
    expect(parseVisitor('hello there')).toBeNull();
  });
});

describe('matchSlot', () => {
  const slots = [
    { id: 'slot:1', meta: { startTime: '10:00' } },
    { id: 'slot:2', meta: { startTime: '11:00' } },
  ];

  it('matches a time to a slot', () => {
    expect(matchSlot('11:00', slots)).toBe('slot:2');
    expect(matchSlot('10.00', slots)).toBe('slot:1');
    expect(matchSlot('9:00', slots)).toBeNull();
  });
});
