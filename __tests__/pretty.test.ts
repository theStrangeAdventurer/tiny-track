import { tinyTrack } from '../src/logger';

/**
 * Tests for pretty format
 */

let val = ''

let tt = tinyTrack({
    format: 'pretty',
    stream: {
        write(value) {
            val += value;
        }
    }
})

beforeEach(() => {
    val = '';
})

test('should write logs', () => {
    {
        tt`Hello world`
        expect(val).toBe('INFO: Hello world\n\n');
        val = ''
    }
    {
        tt`!Hello world`
        expect(val).toBe('ERROR: Hello world\n\n');
        val = ''
    }
    {
        tt`d!Hello world`
        expect(val).toBe('DEBUG: Hello world\n\n');
        val = ''
    }
    {
        tt`w!Hello world`
        expect(val).toBe('WARN: Hello world\n\n');
        val = ''
    }
});


test('should write logs with extra data', () => {
    tt`w!Hello world${{ message: 'error message', response: { ok: false }}}`
    
    const expected = [
        'WARN: Hello world\n' +
        '↳\n' +
        ' ›message: "error message"\n' +
        ' ›response:   \n' +
        '  ↳\n' +
        '   ›ok: false  \n' +
        '\n'
    ].join('');
    expect(val).toBe(expected);
});

test('should handle meta name', () => {
    const ttWithMeta = tinyTrack({
        format: 'pretty',
        meta: {
            name: 'awesome'
        },
        stream: {
            write(value) {
                val += value;
            }
        }
    })
    ttWithMeta`w!Hello world${{ message: 'error message', response: { ok: false }}}`
    
    const expected = [
        '[awesome] WARN: Hello world\n' +
        '↳\n' +
        ' ›message: "error message"\n' +
        ' ›response:   \n' +
        '  ↳\n' +
        '   ›ok: false  \n' +
        '\n'
    ].join('');
    expect(val).toBe(expected);
});