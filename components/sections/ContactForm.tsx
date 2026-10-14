'use client';

import { AlertCircle, Check, Loader2, Send } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Script from 'next/script';
import { useEffect, useId, useRef, useState } from 'react';
import { contactSchema, TOPICS } from '@/lib/validation';

type State = 'idle' | 'sending' | 'sent' | 'error';

type TurnstileApi = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      theme: 'dark';
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    },
  ) => string;
  reset: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Section 8. Validated on the client for instant feedback and again on the
 * server, which is the one that counts.
 */
export function ContactForm({ siteKey }: { siteKey?: string }) {
  const t = useTranslations('contact.form');
  const locale = useLocale();
  const formId = useId();

  const [state, setState] = useState<State>('idle');
  const [errors, setErrors] = useState<Record<string, true>>({});
  const [token, setToken] = useState<string | null>(null);

  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  // Render the Turnstile widget once its script is in.
  useEffect(() => {
    if (!scriptReady || !siteKey || !widgetRef.current || widgetId.current) return;

    widgetId.current =
      window.turnstile?.render(widgetRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        callback: (value) => setToken(value),
        'expired-callback': () => setToken(null),
        'error-callback': () => setToken(null),
      }) ?? null;
  }, [scriptReady, siteKey]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === 'sending') return;

    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      company: String(data.get('company') ?? ''),
      topic: String(data.get('topic') ?? 'internship'),
      message: String(data.get('message') ?? ''),
      website: String(data.get('website') ?? ''),
      turnstileToken: token ?? undefined,
      locale,
    };

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Record<string, true> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string') next[key] = true;
      }
      setErrors(next);
      setState('idle');
      return;
    }

    setErrors({});
    setState('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const result = (await response.json()) as { ok: boolean; fields?: Record<string, true> };

      if (!response.ok || !result.ok) {
        if (result.fields) setErrors(result.fields);
        setState('error');
        // A used token cannot be replayed, so fetch a fresh one.
        window.turnstile?.reset(widgetId.current ?? undefined);
        setToken(null);
        return;
      }

      setState('sent');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="glass flex flex-col items-center rounded-2xl p-10 text-center">
        <span className="animate-rise flex size-12 items-center justify-center rounded-full bg-[rgba(52,211,153,0.15)]">
          <Check className="size-6 text-[var(--available)]" strokeWidth={2.5} aria-hidden />
        </span>
        <p className="animate-rise mt-5 text-[15px] font-semibold text-[var(--text)] [animation-delay:80ms]">
          {t('sent.title')}
        </p>
        <p className="animate-rise mt-2 text-[13px] text-[var(--text-muted)] [animation-delay:140ms]">
          {t('sent.body')}
        </p>
      </div>
    );
  }

  const busy = state === 'sending';

  return (
    <form onSubmit={onSubmit} noValidate className="glass rounded-2xl p-6">
      {siteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          onReady={() => setScriptReady(true)}
        />
      )}

      <fieldset disabled={busy} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id={`${formId}-name`}
            label={t('name')}
            error={errors.name}
            hint={t('errors.name')}
          >
            <input
              id={`${formId}-name`}
              name="name"
              type="text"
              maxLength={100}
              autoComplete="name"
              required
              className={inputClass(errors.name)}
            />
          </Field>

          <Field
            id={`${formId}-email`}
            label={t('email')}
            error={errors.email}
            hint={t('errors.email')}
          >
            <input
              id={`${formId}-email`}
              name="email"
              type="email"
              maxLength={254}
              autoComplete="email"
              required
              className={inputClass(errors.email)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={`${formId}-company`} label={t('company')} optional>
            <input
              id={`${formId}-company`}
              name="company"
              type="text"
              maxLength={120}
              autoComplete="organization"
              className={inputClass(false)}
            />
          </Field>

          <Field id={`${formId}-topic`} label={t('topic')}>
            <select id={`${formId}-topic`} name="topic" className={inputClass(false)}>
              {TOPICS.map((topic) => (
                <option key={topic} value={topic} className="bg-[#0A1A3F]">
                  {t(`topics.${topic}`)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          id={`${formId}-message`}
          label={t('message')}
          error={errors.message}
          hint={t('errors.message')}
        >
          <textarea
            id={`${formId}-message`}
            name="message"
            rows={6}
            minLength={10}
            maxLength={5000}
            required
            className={inputClass(errors.message) + ' resize-y'}
          />
        </Field>

        {/* Honeypot. Hidden from people and from assistive technology alike. */}
        <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor={`${formId}-website`}>Website</label>
          <input
            id={`${formId}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {siteKey ? (
          <div ref={widgetRef} className="min-h-[65px]" />
        ) : (
          <p className="rounded-lg border border-[var(--finding)]/40 bg-[rgba(245,158,11,0.06)] px-3 py-2 text-[12px] text-[var(--finding)]">
            {t('noChallenge')}
          </p>
        )}

        <button
          type="submit"
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] text-[15px] font-medium text-white shadow-[0_0_24px_rgba(59,130,246,0.45)] transition-[background-color,box-shadow] duration-200 hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" strokeWidth={2} aria-hidden />
              {t('sending')}
            </>
          ) : (
            <>
              {t('submit')}
              <Send
                className="size-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
                aria-hidden
              />
            </>
          )}
        </button>
      </fieldset>

      {/* Errors are announced, not just coloured. Section 11. */}
      <div aria-live="polite" className="mt-3">
        {state === 'error' && (
          <p className="flex items-start gap-2 text-[13px] text-[var(--finding)]">
            <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden />
            {t('error')}
          </p>
        )}
      </div>

      <p className="mt-3 text-[12px] text-[var(--text-muted)]">{t('privacy')}</p>
    </form>
  );
}

function inputClass(invalid: boolean | undefined) {
  return (
    'w-full rounded-lg border bg-[rgba(255,255,255,0.03)] px-3 py-2.5 text-[14px] text-[var(--text)] ' +
    'transition-colors duration-200 outline-none placeholder:text-[var(--text-muted)] ' +
    'focus-visible:border-[var(--border-glow)] ' +
    (invalid ? 'border-[var(--finding)]' : 'border-[var(--border)]')
  );
}

function Field({
  id,
  label,
  optional,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: true;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] text-[var(--text-muted)]">
        {label}
        {optional && <span className="ml-1 opacity-60">·</span>}
      </label>
      {children}
      {error && hint && <p className="mt-1.5 text-[11px] text-[var(--finding)]">{hint}</p>}
    </div>
  );
}
