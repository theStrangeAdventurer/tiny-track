import { serializer } from '../src/serializer';
import { EscSequences } from '../src/constants/esc-sequences';

/**
 * Tests for serializer
 */

test('should handle objects', () => {
    const val = JSON.parse(serializer({ test: 'Hello world' }, { colorize: false, format: 'json' }) as string)
    expect(val.test).toBe('Hello world');
});

test('should handle objects with circular reference', () => {
    const testObj = { test: 'Hello world' } as any;

    testObj.self = testObj;

    const val = JSON.parse(serializer(testObj, { colorize: false, format: 'json' }) as string)
    expect(val.self).toBe('<circularRef>');
});

test('should handle objects with circular reference in nested objects', () => {
    const testObj = { test: 'Hello world', nested: { nested: { } } } as any;

    testObj.nested.nested.self = testObj;

    const val = JSON.parse(serializer(testObj, { colorize: false, format: 'json' }) as string)
    expect(val.nested.nested.self).toBe('<circularRef>');
});

test('should handle objects with maxDepth', () => {
    const testObj = { test: 'Hello world', nested: { nested: { nested: true } } } as any;

    const val = JSON.parse(serializer(testObj, { colorize: false, maxDepth: 1, format: 'json' }) as string)
    expect(val.nested.nested).toBe('<object>')
});