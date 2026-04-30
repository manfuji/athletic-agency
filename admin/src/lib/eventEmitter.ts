const eventEmitter = new EventTarget();

export const emitLogUpdate = (fixtureId: string) => {
  const event = new CustomEvent('logUpdate', { detail: { fixtureId } });
  eventEmitter.dispatchEvent(event);
};

export const onLogUpdate = (callback: (fixtureId: string) => void) => {
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<{ fixtureId: string }>;
    callback(customEvent.detail.fixtureId);
  };
  eventEmitter.addEventListener('logUpdate', listener);
  return () => eventEmitter.removeEventListener('logUpdate', listener);
};
