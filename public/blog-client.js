function setStatus(container, message) {
  const status = container.querySelector('[data-blog-action-status]');
  if (status) status.textContent = message;
}

async function sharePost(container) {
  const payload = {
    title: document.title,
    text: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(payload);
      setStatus(container, '공유 창을 열었습니다.');
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
  }

  await navigator.clipboard.writeText(window.location.href);
  setStatus(container, '공유 링크를 복사했습니다.');
}

async function downloadPost(container, slug) {
  const response = await fetch(window.location.href, { cache: 'no-store' });
  if (!response.ok) throw new Error('Download source unavailable');
  const html = await response.text();
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${slug}.html`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  setStatus(container, 'HTML 파일을 저장했습니다.');
}

async function initBlogActions(container) {
  const slug = container.getAttribute('data-slug');
  if (!slug) return;

  container.querySelector('[data-blog-share]')?.addEventListener('click', async () => {
    try {
      await sharePost(container);
    } catch {
      setStatus(container, '공유에 실패했습니다.');
    }
  });

  container.querySelector('[data-blog-download]')?.addEventListener('click', async () => {
    try {
      await downloadPost(container, slug);
    } catch {
      setStatus(container, '저장에 실패했습니다.');
    }
  });
}

for (const container of document.querySelectorAll('[data-blog-actions]')) {
  void initBlogActions(container);
}
