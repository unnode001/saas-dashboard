(() => {
  const websiteId = document.currentScript.getAttribute('data-website-id');
  if (!websiteId) {
    console.error('Tracker: data-website-id attribute not found.');
    return;
  }

  // Generate or retrieve a session ID
  let sessionId = sessionStorage.getItem('tracker_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('tracker_session_id', sessionId);
  }

  const trackEvent = (eventName) => {
    const payload = {
      websiteId: websiteId,
      sessionId: sessionId,
      path: window.location.pathname,
      referrer: document.referrer,
      eventName: eventName,
    };

    navigator.sendBeacon('/api/collect', JSON.stringify(payload));
  };

  // Track pageview on load
  trackEvent('pageview');

  // You can add more event listeners here, for example, for clicks:
  // document.addEventListener('click', () => trackEvent('click'), true);
})();
