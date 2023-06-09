import { tinyTrack } from '../src/logger';

/**
 * Tests for json format
 */

let val = ''

let tt = tinyTrack({
    format: 'json',
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
        const loggedVal = JSON.parse(val);
        
        expect(new Date(loggedVal.time)).toBeInstanceOf(Date);
        expect(loggedVal.level).toBe('info');
        expect(loggedVal.message).toBe('Hello world');
    }

    val = ''; // Clear stream value

    {
        tt`!Hello world`
        const loggedVal = JSON.parse(val);
    
        expect(loggedVal.level).toBe('error');
        expect(loggedVal.message).toBe('Hello world');
    }

    val = ''; // Clear stream value

    {
        tt`d!Hello world`
        const loggedVal = JSON.parse(val);
    
        expect(loggedVal.level).toBe('debug');
        expect(loggedVal.message).toBe('Hello world');
    }

    val = ''; // Clear stream value

    {
        tt`w!Hello world`
        const loggedVal = JSON.parse(val);
    
        expect(loggedVal.level).toBe('warn');
        expect(loggedVal.message).toBe('Hello world');
    }
});

test('should write additional data', () => {
    const testData = { testData: { foo: 'bar', result: true } };

    tt`Hello world${testData}`
    const loggedVal = JSON.parse(val);

    expect(loggedVal.data[0]).toEqual(testData);
});

test('should write all data in data field, except first message', () => {
    const testData = { testData: { foo: 'bar', result: true } };

    tt`Hello world${testData} another data`
    const loggedVal = JSON.parse(val);
    expect(loggedVal.data[1]).toEqual('another data');
});

test('should handle meta name', () => {
    const tt = tinyTrack({
        colorize: false,
        format: 'json',
        meta: {
            name: 'awesome'
        },
        stream: {
            write(value) {
                val += value;
            }
        }
    });
    const testData = { testData: { foo: 'bar', result: true } };

    tt`Hello world${testData} another data`
    const loggedVal = JSON.parse(val);
    expect(loggedVal.name).toEqual('awesome');
});

