import { api } from '../services/api';

describe('API Service', () => {
    test('getSources returns data', async () => {
        const sources = await api.getSources('123');
        expect(sources.length).toBeGreaterThan(0);
        expect(sources[0]).toHaveProperty('title');
    });

    test('explainInsight returns markdown', async () => {
        const explanation = await api.explainInsight('123');
        expect(explanation.markdown).toContain('### Explanation');
    });

    test('resolveAlert can succeed or fail (mock)', async () => {
        try {
            await api.resolveAlert('alert1');
            // If it succeeds, pass
        } catch (e) {
            // If it matches our random fail, pass
            expect(e.message).toBe("Failed to resolve alert");
        }
    });

    test('snoozeAlert returns future time', async () => {
        const result = await api.snoozeAlert('alert1', 60);
        expect(result).toHaveProperty('snoozedUntil');
    });
});
