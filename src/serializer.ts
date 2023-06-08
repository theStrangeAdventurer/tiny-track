import { colorize } from './colorize';
import { EscSequences } from './constants/esc-sequences';
import type { SerializedValue, SerializerOptions } from './types';

const wrapNum = (val: number, options: SerializerOptions, depth = 0) => {
  if (options.colorize) {
    return wrapValue(colorize(EscSequences.Yellow, val), options, depth);
  }
  return wrapValue(val, options, depth);
};

const wrapBool = (val: boolean, options: SerializerOptions, depth = 0) => {
  if (options.colorize) {
    return wrapValue(colorize(EscSequences.Blue, val), options, depth);
  }
  return wrapValue(val, options, depth);
};

const wrapStr = (val: string, options: SerializerOptions, depth = 0) => {
  const _val = wrapValue(JSON.stringify(val), options, depth);
  if (options.colorize) {
    return colorize(EscSequences.Green, _val);
  }
  return _val;
};

const wrapValue = (val: any, options: SerializerOptions, depth = 0) => {
  switch (options.format) {
    case 'json':
      return val ? val : `"${val}"`;
    case 'pretty':
      return `${getOffset(depth)}${val}`;
  }
};

export const prettyItem = (value: any, options: SerializerOptions) => {
  let val = `\n › `;
  if (typeof value === 'object') {
    val = ``;
  }
  if (!options.colorize) return val;

  return colorize(EscSequences.Gray, val);
};

export const wrapKey = (key: string, options: SerializerOptions, depth = 0) => {
  let _val = key;

  switch (options.format) {
    case 'pretty':
      _val = `\n${getOffset(depth)} ›${key}: `;
      break;
    case 'json':
      _val = `"${key}":`;
      break;
  }

  if (options.colorize) {
    return colorize(EscSequences.Gray, _val);
  }
  return _val;
};

export const wrapBracket = (bracket: string, options: SerializerOptions) => {
  if (options.colorize) {
    return colorize(EscSequences.Gray, bracket);
  }
  return bracket;
};

const TAB_SIZE = 2;

export const getOffset = (depth: number, symb = ' ') =>
  symb.repeat(depth * TAB_SIZE);

export const openCloseBracket = (
  bracket: string,
  depth: number,
  options: SerializerOptions,
) => {
  switch (options.format) {
    case 'pretty':
      return `${getOffset(depth)}${bracket}`;
    case 'json':
      return bracket;
  }
};

export const serializer = (
  obj: any,
  options: SerializerOptions,
): SerializedValue => {
  const handleValue = (value: any, depth = 0): SerializedValue => {
    const isCircular = depth && value === obj;
    if (!options.format) {
      options.format = 'pretty';
    }

    const { format } = options;

    const partsSeparators = {
      json: ', ',
      pretty: '',
    };
    const pairs = {
      json: ['{ ', ' }'].map((b) => wrapBracket(b, options)),
      pretty: [`\n${getOffset(depth)}↳`, ''].map((b) =>
        wrapBracket(b, options),
      ),
    };

    if (isCircular) {
      return wrapStr('<circularRef>', options);
    }

    switch (typeof value) {
      case 'boolean':
        return wrapBool(value, options);
      case 'number':
        return wrapNum(value, options);
      case 'function':
        return wrapStr('<fn>', options);
      case 'string':
        return wrapStr(value, options);
      case 'object':
        if (value === null) {
          return wrapStr(value, options);
        }
        if (Array.isArray(value)) {
          return `[${value.map((v) => handleValue(v, depth))}]`;
        }
        if (options.maxDepth && depth > options.maxDepth) {
          return wrapStr(`<${typeof value}>`, options, depth);
        }
        const keys = Object.keys(value);
        return keys.reduce((acc, key, index) => {
          acc += `${wrapKey(key, options, depth)}${handleValue(
            value[key],
            depth + 1,
          )}`;
          const isLast = index === keys.length - 1;

          if (!isLast) acc += partsSeparators[format];
          else acc += openCloseBracket(pairs[format][1], depth, options);

          return acc;
        }, openCloseBracket(pairs[format][0], depth, options)!);
    }
    return wrapStr(value?.toString(), options, depth);
  };
  return handleValue(obj);
};
