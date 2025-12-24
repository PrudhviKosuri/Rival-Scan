export const trackEvent = (eventName: string, data?: Record<string, any>) => {
    console.log(`[Telemetry] ${eventName}`, data);
};
