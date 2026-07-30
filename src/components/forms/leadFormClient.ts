import { readOrCaptureAxAcquisition } from '../../analytics/axAcquisition';
import { emitGtagEvent } from '../../analytics/gtag';
import { resolveLeadPayloadContext } from '../../lead/pageContext';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const FORM_MESSAGES = {
  ko: {
    request: {
      DELIVERY_FAILED: '상담 신청 전송에 실패했습니다.',
      DELIVERY_NOT_CONFIGURED: '상담 접수 설정을 불러오지 못했습니다.',
      FORM_EXPIRED: '입력 시간이 만료되었습니다. 다시 제출해 주세요.',
      FORM_SUBMITTED_TOO_QUICKLY: '잠시 후 다시 제출해 주세요.',
      RATE_LIMITED: '요청이 많습니다. 잠시 후 다시 시도해 주세요.',
      VALIDATION_ERROR: '입력 내용을 다시 확인해 주세요.',
      network: '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
      unknown: '상담 신청을 전송하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    },
    fields: {
      INVALID_NAME: '성함을 확인해 주세요.',
      INVALID_EMAIL: '이메일 주소를 확인해 주세요.',
      INTEREST_REQUIRED: '관심 있는 컨설팅 형태를 하나 이상 선택해 주세요.',
      INVALID_INTEREST: '관심 있는 컨설팅 형태를 다시 확인해 주세요.',
      OTHER_INTEREST_REQUIRED: '기타 관심 분야를 입력해 주세요.',
      OTHER_INTEREST_TOO_LONG: '기타 관심 분야는 240자 이내로 입력해 주세요.',
      REASON_REQUIRED: '선택한 이유를 입력해 주세요.',
      REASON_TOO_LONG: '선택한 이유는 2,000자 이내로 입력해 주세요.',
      CROSS_BORDER_CONSENT_REQUIRED: '국외 이전에 대한 별도 동의가 필요합니다.',
    },
    fieldFallback: '입력 내용을 확인해 주세요.',
    required: '필수 항목을 모두 올바르게 입력해 주세요.',
    sending: '상담 신청을 안전하게 전송하고 있습니다.',
    sent: '상담 신청이 잘 전송되었습니다.',
  },
  en: {
    request: {
      DELIVERY_FAILED: 'We could not send your consultation request.',
      DELIVERY_NOT_CONFIGURED: 'The consultation service is not available right now.',
      FORM_EXPIRED: 'Your form session expired. Please submit it again.',
      FORM_SUBMITTED_TOO_QUICKLY: 'Please wait a moment and try again.',
      RATE_LIMITED: 'Too many requests. Please try again shortly.',
      VALIDATION_ERROR: 'Please review the information entered.',
      network: 'Check your network connection and try again.',
      unknown: 'We could not send your request. Please try again shortly.',
    },
    fields: {
      INVALID_NAME: 'Please check your name.',
      INVALID_EMAIL: 'Please check your email address.',
      INTEREST_REQUIRED: 'Select at least one consulting area.',
      INVALID_INTEREST: 'Please check the consulting areas selected.',
      OTHER_INTEREST_REQUIRED: 'Please describe the other area of interest.',
      OTHER_INTEREST_TOO_LONG: 'Please keep the other area under 240 characters.',
      REASON_REQUIRED: 'Please tell us why you selected these areas.',
      REASON_TOO_LONG: 'Please keep your reason under 2,000 characters.',
      CROSS_BORDER_CONSENT_REQUIRED: 'Separate consent is required for the international transfer.',
    },
    fieldFallback: 'Please review this field.',
    required: 'Please complete all required fields correctly.',
    sending: 'Sending your consultation request securely.',
    sent: 'Your consultation request has been sent.',
  },
  ja: {
    request: {
      DELIVERY_FAILED: '相談申請を送信できませんでした。',
      DELIVERY_NOT_CONFIGURED: '現在、相談受付サービスを利用できません。',
      FORM_EXPIRED: '入力時間が終了しました。もう一度送信してください。',
      FORM_SUBMITTED_TOO_QUICKLY: 'しばらくしてからもう一度お試しください。',
      RATE_LIMITED: 'リクエストが多すぎます。しばらくしてからお試しください。',
      VALIDATION_ERROR: '入力内容をご確認ください。',
      network: 'ネットワーク接続を確認して、もう一度お試しください。',
      unknown: '相談申請を送信できませんでした。しばらくしてからお試しください。',
    },
    fields: {
      INVALID_NAME: 'お名前をご確認ください。',
      INVALID_EMAIL: 'メールアドレスをご確認ください。',
      INTEREST_REQUIRED: '関心のあるコンサルティング内容を1つ以上選択してください。',
      INVALID_INTEREST: '選択したコンサルティング内容をご確認ください。',
      OTHER_INTEREST_REQUIRED: 'その他の関心内容を入力してください。',
      OTHER_INTEREST_TOO_LONG: 'その他の関心内容は240文字以内で入力してください。',
      REASON_REQUIRED: '選択した理由を入力してください。',
      REASON_TOO_LONG: '選択した理由は2,000文字以内で入力してください。',
      CROSS_BORDER_CONSENT_REQUIRED: '外国への移転について個別の同意が必要です。',
    },
    fieldFallback: '入力内容をご確認ください。',
    required: '必須項目を正しく入力してください。',
    sending: '相談申請を安全に送信しています。',
    sent: '相談申請を送信しました。',
  },
  zh: {
    request: {
      DELIVERY_FAILED: '咨询申请发送失败。',
      DELIVERY_NOT_CONFIGURED: '当前无法使用咨询服务。',
      FORM_EXPIRED: '填写时间已过期，请重新提交。',
      FORM_SUBMITTED_TOO_QUICKLY: '请稍候再试。',
      RATE_LIMITED: '请求过多，请稍后再试。',
      VALIDATION_ERROR: '请检查填写内容。',
      network: '请检查网络连接后重试。',
      unknown: '咨询申请未能发送，请稍后重试。',
    },
    fields: {
      INVALID_NAME: '请检查姓名。',
      INVALID_EMAIL: '请检查电子邮箱地址。',
      INTEREST_REQUIRED: '请至少选择一项咨询服务类型。',
      INVALID_INTEREST: '请检查选择的咨询服务类型。',
      OTHER_INTEREST_REQUIRED: '请填写其他感兴趣的服务类型。',
      OTHER_INTEREST_TOO_LONG: '其他服务类型请控制在240字以内。',
      REASON_REQUIRED: '请告诉我们您选择以上服务的原因。',
      REASON_TOO_LONG: '选择原因请控制在2,000字以内。',
      CROSS_BORDER_CONSENT_REQUIRED: '需要单独同意个人信息跨境传输。',
    },
    fieldFallback: '请检查填写内容。',
    required: '请正确填写所有必填项。',
    sending: '正在安全发送咨询申请。',
    sent: '咨询申请已发送。',
  },
} as const;

function emitAnalytics(event: string, parameters: Record<string, unknown> = {}) {
  emitGtagEvent(window.gtag, event, parameters);
}

function initializeLeadForm(form: HTMLFormElement) {
  if (form.dataset.leadFormInitialized === 'true') return;
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const formAlert = form.querySelector<HTMLElement>('[data-form-alert]');
  if (!submit || !submitLabel || !status || !formAlert) return;
  form.dataset.leadFormInitialized = 'true';
  const defaultSubmitLabel = submitLabel.textContent ?? '2주 진단 상담 신청하기';
  const locale = form.dataset.locale ?? 'ko';
  const messages = FORM_MESSAGES[locale as keyof typeof FORM_MESSAGES] ?? FORM_MESSAGES.ko;
  let startedAt = Date.now();
  let submitting = false;
  const interestOptions = Array.from(
    form.querySelectorAll<HTMLInputElement>('[data-interest-option]'),
  );
  const syncInterestValidity = () =>
    interestOptions[0]?.setCustomValidity(
      interestOptions.some((option) => option.checked) ? '' : 'INTEREST_REQUIRED',
    );
  const syncSubmitState = () => {
    syncInterestValidity();
    const controls = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'),
    );
    const isReady = controls.every((field) => !field.willValidate || field.validity.valid);
    submit.disabled = submitting;
    submit.classList.toggle('is-ready', isReady && !submitting);
  };
  const autoGrowTextareas = Array.from(
    form.querySelectorAll<HTMLTextAreaElement>('textarea[data-autogrow]'),
  );
  const syncTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
  autoGrowTextareas.forEach((textarea) => {
    textarea.addEventListener('input', () => syncTextareaHeight(textarea));
    syncTextareaHeight(textarea);
  });
  const clearErrors = () => {
    form.querySelectorAll<HTMLElement>('[aria-invalid="true"]').forEach((field) => {
      field.removeAttribute('aria-invalid');
    });
    form.querySelectorAll<HTMLElement>('[data-field-error]').forEach((element) => {
      element.textContent = '';
    });
    formAlert.hidden = true;
    formAlert.textContent = '';
  };
  const showRequestError = (code: string) => {
    formAlert.textContent =
      messages.request[code as keyof typeof messages.request] ?? messages.request.unknown;
    formAlert.hidden = false;
    formAlert.focus({ preventScroll: true });
    status.textContent = formAlert.textContent;
    status.className = 'ax-v2-form-status is-error';
    emitAnalytics('form_error', { error_code: code, form_id: 'ax_consultation' });
  };
  const showFieldErrors = (fields: Record<string, string>) => {
    for (const [name, code] of Object.entries(fields)) {
      if (name === 'consulting_interests')
        form
          .querySelector<HTMLElement>('.ax-v2-interest-options')
          ?.setAttribute('aria-invalid', 'true');
      else
        form
          .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)
          .forEach((field) => {
            field.setAttribute('aria-invalid', 'true');
          });
      const error = form.querySelector<HTMLElement>(`[data-field-error="${name}"]`);
      if (error)
        error.textContent =
          messages.fields[code as keyof typeof messages.fields] ?? messages.fieldFallback;
    }
  };
  const fieldCode = (field: HTMLInputElement | HTMLTextAreaElement) =>
    ({
      name: 'INVALID_NAME',
      email: 'INVALID_EMAIL',
      consulting_interests: 'INTEREST_REQUIRED',
      other_interest: 'OTHER_INTEREST_REQUIRED',
      reason: 'REASON_REQUIRED',
      cross_border_consent: 'CROSS_BORDER_CONSENT_REQUIRED',
    })[field.name] ?? 'INVALID_NAME';
  const revealValidationAlert = (invalidFields: Array<HTMLInputElement | HTMLTextAreaElement>) => {
    const fields: Record<string, string> = {};
    invalidFields.forEach((field) => {
      fields[field.name] = fieldCode(field);
    });
    showFieldErrors(fields);
    formAlert.textContent = messages.required;
    formAlert.hidden = false;
    formAlert.focus({ preventScroll: true });
    const firstInvalid = invalidFields[0];
    if (!firstInvalid) return;
    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => firstInvalid.focus({ preventScroll: true }), 320);
  };
  form.addEventListener('invalid', (event) => event.preventDefault(), true);
  form.addEventListener(
    'blur',
    (event) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
      if (field.dataset.requestAutofocus === 'true' && !field.value) return;
      if (!field.willValidate || field.validity.valid) return;
      showFieldErrors({ [field.name]: fieldCode(field) });
    },
    true,
  );
  const otherInterestOption = form.querySelector<HTMLInputElement>(
    '[data-interest-option="other"]',
  );
  const otherInterestField = form.querySelector<HTMLElement>('[data-other-interest]');
  const otherInterestInput = form.querySelector<HTMLInputElement>('[data-other-interest-input]');
  const syncOtherInterest = () => {
    const enabled = Boolean(otherInterestOption?.checked);
    if (otherInterestField) otherInterestField.hidden = !enabled;
    if (!otherInterestInput) return;
    otherInterestInput.disabled = !enabled;
    otherInterestInput.required = enabled;
    if (!enabled) {
      otherInterestInput.value = '';
      otherInterestInput.removeAttribute('aria-invalid');
    }
  };
  otherInterestOption?.addEventListener('change', syncOtherInterest);
  syncOtherInterest();
  form.addEventListener('input', (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
    if (!field.checkValidity()) {
      syncSubmitState();
      return;
    }
    field.removeAttribute('aria-invalid');
    const error = form.querySelector<HTMLElement>(`[data-field-error="${field.name}"]`);
    if (error) error.textContent = '';
    if (!form.querySelector('[aria-invalid="true"]')) {
      formAlert.hidden = true;
      formAlert.textContent = '';
    }
    syncSubmitState();
  });
  form.addEventListener('change', () => {
    syncOtherInterest();
    syncInterestValidity();
    if (!interestOptions.some((option) => option.checked))
      showFieldErrors({ consulting_interests: 'INTEREST_REQUIRED' });
    syncSubmitState();
  });
  syncSubmitState();
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    if (!form.checkValidity()) {
      const invalidFields = Array.from(
        form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(':invalid'),
      );
      revealValidationAlert(invalidFields);
      status.textContent = messages.fieldFallback;
      status.className = 'ax-v2-form-status is-error';
      return;
    }
    submitting = true;
    syncSubmitState();
    submitLabel.textContent = form.dataset.sendingLabel ?? '상담 신청을 전송하고 있습니다.';
    status.textContent = messages.sending;
    status.className = 'ax-v2-form-status';
    const data = new FormData(form);
    let acquisitionStorage: Storage | undefined;
    try {
      acquisitionStorage = window.sessionStorage;
    } catch {
      acquisitionStorage = undefined;
    }
    const acquisition = readOrCaptureAxAcquisition(
      acquisitionStorage,
      window.location.href,
      document.referrer,
    );
    const crossBorderConsent = form.elements.namedItem('cross_border_consent');
    const pageContext = resolveLeadPayloadContext(form.dataset, window.location.pathname);
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      consulting_interests: data.getAll('consulting_interests').map(String),
      other_interest: String(data.get('other_interest') ?? ''),
      reason: String(data.get('reason') ?? ''),
      cross_border_consent:
        crossBorderConsent instanceof HTMLInputElement && crossBorderConsent.checked,
      website: String(data.get('website') ?? ''),
      started_at: startedAt,
      utm: acquisition.utm,
      attribution: {
        initial_referrer_host: acquisition.initial_referrer_host,
        landing_path: acquisition.landing_path,
      },
      ...pageContext,
    };
    const requestController = new AbortController();
    const requestTimeout = window.setTimeout(() => requestController.abort(), 15_000);
    emitAnalytics('form_submit', { form_id: 'ax_consultation', locale });
    try {
      const response = await fetch('/api/ax/consultations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: requestController.signal,
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: { code?: string; fields?: Record<string, string> };
      } | null;
      if (!response.ok || !result?.ok) {
        if (result?.error?.fields) showFieldErrors(result.error.fields);
        showRequestError(result?.error?.code ?? 'unknown');
        return;
      }
      form.reset();
      autoGrowTextareas.forEach(syncTextareaHeight);
      startedAt = Date.now();
      status.textContent = messages.sent;
      status.className = 'ax-v2-form-status is-success';
      status.focus({ preventScroll: true });
      emitAnalytics('generate_lead', { form_id: 'ax_consultation', locale });
      form.dispatchEvent(new CustomEvent('ax:lead-sent', { bubbles: true }));
    } catch {
      showRequestError('network');
    } finally {
      window.clearTimeout(requestTimeout);
      submitting = false;
      syncSubmitState();
      submitLabel.textContent = defaultSubmitLabel;
    }
  });
}

export function initializeLeadForms(root: Pick<Document, 'querySelectorAll'> = document) {
  root.querySelectorAll<HTMLFormElement>('[data-lead-form]').forEach(initializeLeadForm);
}

initializeLeadForms();
document.addEventListener('astro:page-load', () => initializeLeadForms());
