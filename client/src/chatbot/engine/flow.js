// The conversation is a finite state machine. Prompts are i18n keys, options are
// ids resolved by QuickReplies, and every transition is declared here as data.
//
// State fields:
//   say      prompt i18n key (omit for states that load data or run an action)
//   options  static option ids, or omitted when the state loads them (options)
//   control  rich control rendered in the message: date | counts | visitor | summary | cancelForm
//   load     async loader name handled by useChat: exhibitions | shows | slots | info
//   action   async action name handled by useChat: startPayment
//   next     next step id, or map of option id -> step id | { step, infoKey }

export const flow = {
  authRequired: {
    say: 'authRequiredMessage',
    control: 'signInRequired',
    options: ['menu'],
    next: { menu: 'start' },
  },
  start: {
    say: 'welcome',
    options: ['book', 'info', 'cancel', 'language'],
    next: { book: 'target', info: 'infoMenu', cancel: 'cancelAsk', language: 'language' },
  },
  target: {
    say: 'askTarget',
    options: ['entry', 'exhibition', 'show', 'menu'],
    next: { entry: 'date', exhibition: 'pickExhibition', show: 'pickShow', menu: 'start' },
  },
  pickExhibition: {
    load: 'exhibitions',
    say: 'askWhichExhibition',
    next: 'date',
  },
  pickShow: {
    load: 'shows',
    say: 'askWhichShow',
    next: 'date',
  },
  date: {
    say: 'askDate',
    control: 'date',
    next: 'slot',
  },
  slot: {
    load: 'slots',
    say: 'askSlot',
    next: 'counts',
  },
  counts: {
    say: 'askCounts',
    control: 'counts',
    next: 'visitor',
  },
  visitor: {
    say: 'askVisitor',
    control: 'visitor',
    next: 'summary',
  },
  summary: {
    say: 'summaryIntro',
    control: 'summary',
    options: ['confirm', 'edit', 'cancelBooking'],
    next: { confirm: 'pay', edit: 'target', cancelBooking: 'start' },
  },
  pay: {
    action: 'startPayment',
  },
  payFailed: {
    say: 'payFailed',
    options: ['retryPayment', 'cancelBooking'],
    next: { retryPayment: 'pay', cancelBooking: 'start' },
  },
  ticket: {
    say: 'ticketIssued',
    options: ['newBooking', 'menu'],
    next: { newBooking: 'target', menu: 'start' },
  },
  infoMenu: {
    say: 'infoMenu',
    options: ['timings', 'prices', 'exhibitionsList', 'showsList', 'menu'],
    next: {
      timings: { step: 'infoAnswer', infoKey: 'timings' },
      prices: { step: 'infoAnswer', infoKey: 'prices' },
      exhibitionsList: { step: 'infoAnswer', infoKey: 'exhibitions' },
      showsList: { step: 'infoAnswer', infoKey: 'shows' },
      menu: 'start',
    },
  },
  infoAnswer: {
    load: 'info',
    options: ['book', 'info', 'menu'],
    next: { book: 'target', info: 'infoMenu', menu: 'start' },
  },
  cancelAsk: {
    say: 'cancelAsk',
    control: 'cancelForm',
    options: ['menu'],
    next: { menu: 'start' },
  },
  cancelResult: {
    options: ['retryCancel', 'menu'],
    next: { retryCancel: 'cancelAsk', menu: 'start' },
  },
  language: {
    say: 'languageAsk',
    options: ['english', 'hindi'],
    next: { english: 'start', hindi: 'start' },
  },
  help: {
    say: 'help',
    options: ['book', 'info', 'cancel', 'menu'],
    next: { book: 'target', info: 'infoMenu', cancel: 'cancelAsk', menu: 'start' },
  },
  slotEmpty: {
    say: 'slotEmpty',
    options: ['changeDate', 'menu'],
    next: { changeDate: 'date', menu: 'start' },
  },
  loadFailed: {
    say: 'loadFailed',
    options: ['retryLoad', 'menu'],
    next: { retryLoad: 'retry', menu: 'start' },
  },
};

export const GLOBAL_OPTIONS = ['menu', 'back', 'restart', 'language', 'help'];
