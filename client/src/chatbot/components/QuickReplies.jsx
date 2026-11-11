import { useTranslation } from 'react-i18next';

function labelOf(option, lang, t) {
  if (option.meta?.label) return option.meta.label;
  if (option.labelKey) return t(`chat.${option.labelKey}`);
  if (lang === 'hi') return option.labelHi || option.label;
  return option.label;
}

export default function QuickReplies({ options, onPick }) {
  const { t, i18n } = useTranslation();
  if (!options?.length) return null;

  return (
    <div className="quick-replies" aria-label={t('chat.quickReplies')}>
      {options.map((option, index) => {
        const soldOut = Boolean(option.meta?.soldOut);
        return (
          <button
            key={option.id}
            type="button"
            className={`quick-reply ${soldOut ? 'is-soldout' : ''}`}
            disabled={soldOut}
            onClick={() => onPick(option.id)}
          >
            <span className="quick-reply__index">{index + 1}</span>
            <span className="quick-reply__body">
              <span className="quick-reply__label">{labelOf(option, i18n.language, t)}</span>
              {option.meta ? (
                <span className="quick-reply__meta">
                  {soldOut ? t('chat.soldOut') : t('chat.slotLeft', { count: option.meta.remaining })}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
