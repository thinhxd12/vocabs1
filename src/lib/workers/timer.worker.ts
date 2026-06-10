let intervalId: ReturnType<typeof setInterval>;

self.onmessage = (event) => {
  const { action } = event.data;

  if (action === "START") {
    if (intervalId) return;

    intervalId = setInterval(() => {
      self.postMessage({ timestamp: Date.now() });
    }, 1000);
  }

  if (action === "STOP") {
    clearInterval(intervalId);
  }
};
