(function() {
  var queue = window.FeatureKeeper;
  if (!queue || !queue.length) return;

  var opts = queue[0];
  var slug = opts.project;
  if (!slug) return;

  var token = opts.user ? opts.user.token : null;
  var position = opts.position || 'right';
  var showButton = opts.button !== false;
  var baseUrl = opts.baseUrl || window.location.origin;

  var isOpen = false;
  var iframe, overlay, button;

  // Build iframe URL
  var iframeSrc = baseUrl + '/' + slug + '?widget=true';
  if (token) iframeSrc += '&token=' + encodeURIComponent(token);

  // Create iframe (hidden off-screen initially)
  iframe = document.createElement('iframe');
  iframe.src = 'about:blank'; // lazy load on first open
  iframe.setAttribute('data-src', iframeSrc);
  iframe.style.cssText = [
    'position:fixed',
    'top:0',
    position + ':-420px',
    'width:400px',
    'height:100vh',
    'height:100dvh',
    'border:none',
    'z-index:2147483647',
    'transition:' + position + ' 0.3s cubic-bezier(0.4,0,0.2,1)',
    'background:#faf9f7',
    'box-shadow:-4px 0 30px rgba(0,0,0,0.15)',
    'border-radius:0'
  ].join(';');
  document.body.appendChild(iframe);

  // Create overlay
  overlay = document.createElement('div');
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'background:rgba(0,0,0,0.25)',
    'z-index:2147483646',
    'display:none',
    'transition:opacity 0.3s ease',
    'opacity:0',
    'cursor:pointer'
  ].join(';');
  overlay.addEventListener('click', close);
  document.body.appendChild(overlay);

  // Create floating button
  if (showButton) {
    button = document.createElement('button');
    button.setAttribute('aria-label', 'Open feedback');
    button.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>';
    button.style.cssText = [
      'position:fixed',
      'bottom:20px',
      position + ':20px',
      'width:52px',
      'height:52px',
      'border-radius:50%',
      'background:#c2410c',
      'border:none',
      'color:white',
      'cursor:pointer',
      'z-index:2147483645',
      'box-shadow:0 4px 14px rgba(194,65,12,0.4)',
      'transition:transform 0.15s ease,box-shadow 0.15s ease',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:0'
    ].join(';');
    button.addEventListener('mouseenter', function() {
      button.style.transform = 'scale(1.08)';
      button.style.boxShadow = '0 6px 20px rgba(194,65,12,0.5)';
    });
    button.addEventListener('mouseleave', function() {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 14px rgba(194,65,12,0.4)';
    });
    button.addEventListener('click', toggle);
    document.body.appendChild(button);
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    // Lazy load iframe on first open
    if (iframe.src === 'about:blank') {
      iframe.src = iframe.getAttribute('data-src');
    }
    iframe.style[position] = '0';
    overlay.style.display = 'block';
    requestAnimationFrame(function() {
      overlay.style.opacity = '1';
    });
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    iframe.style[position] = '-420px';
    overlay.style.opacity = '0';
    setTimeout(function() {
      overlay.style.display = 'none';
    }, 300);
    document.body.style.overflow = '';
  }

  function toggle() {
    isOpen ? close() : open();
  }

  // Listen for messages from iframe
  window.addEventListener('message', function(e) {
    if (e.data === 'featurekeeper:close') close();
  });

  // Escape key closes
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen) close();
  });

  // Public API (replaces the queue array)
  window.FeatureKeeper = {
    open: open,
    close: close,
    toggle: toggle,
  };
})();
