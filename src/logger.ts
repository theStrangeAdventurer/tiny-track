import { colorize as colorizeFn } from './colorize';
import { EscSequences } from './constants/esc-sequences';
import { prettyItem, serializer, wrapBracket } from './serializer';
import type {
  SerializerOptions,
  TinyTrack,
  TinyTrackLevel,
  TinyTrackOptions,
} from './types';

const LvlRe = {
  Error: /^(\!|error|err)/,
  Warn: /^(warning|warn|w\!)/,
  Debug: /^(debug|d\!)/,
};

const prefixByLvl = (lvl: TinyTrackLevel) => lvl.toUpperCase() + ': ';

const wrapLvl = (
  lvl: TinyTrackLevel,
  options: SerializerOptions,
  msg: any = '',
) => {
  const msgPrefix = prefixByLvl(lvl) + msg;

  if (!options.colorize) {
    return msgPrefix;
  }
  switch (lvl) {
    case 'error':
      return colorizeFn(EscSequences.Red, msgPrefix);
    case 'warn':
      return colorizeFn(EscSequences.Yellow, msgPrefix);
    case 'debug':
      return colorizeFn(EscSequences.Cyan, msgPrefix);
    case 'info':
      return colorizeFn(EscSequences.Blue, msgPrefix);
  }
};

export const consoleToStream = (lvl: TinyTrackLevel) => {
  return {
    write(msg: string) {
      if (['error', 'warn'].includes(lvl)) {
        console.error(msg);
        return;
      }
      console.log(msg);
    },
  };
};

export const tinyTrack: TinyTrack =
  (options: TinyTrackOptions) =>
  (strParts: TemplateStringsArray, ...replacers: any[]) => {
    const [lvl, startMsg] = ((startMsg: string): [TinyTrackLevel, string] => {
      if (LvlRe.Error.test(startMsg)) {
        return ['error', startMsg.replace(LvlRe.Error, '')];
      }
      if (LvlRe.Warn.test(startMsg)) {
        return ['warn', startMsg.replace(LvlRe.Warn, '')];
      }
      if (LvlRe.Debug.test(startMsg)) {
        return ['debug', startMsg.replace(LvlRe.Debug, '')];
      }
      return ['info', startMsg];
    })(strParts[0]);

    const _options = Array.isArray(options) ? options : [options];

    _options.forEach(
      ({
        format = 'pretty',
        maxDepth = 3,
        colorize,
        stream,
        level,
        serializer: optSerializer,
      }) => {
        const shouldLogLevel =
          typeof level === 'undefined' ||
          (Array.isArray(level) && level.includes(lvl)) ||
          level === lvl;

        if (!shouldLogLevel) return;

        const result = strParts.reduce((acc, part, index) => {
          const replacer = replacers[index] || '';
          const isLastIteration = index === strParts.length - 1;
          const isFirstIteration = index === 0;

          part = part.trim();

          const _serializer = optSerializer || serializer;
          const _serializerOpts = {
            colorize: Boolean(colorize),
            maxDepth,
            format,
          };

          switch (format) {
            case 'pretty':
              if (isFirstIteration) {
                acc = wrapLvl(lvl, _serializerOpts, acc);
              }

              const arr = [];

              if (part && !isFirstIteration) {
                arr.push(part);
              }

              if (replacer) arr.push(replacer);

              arr.forEach((_part) => {
                acc +=
                  prettyItem(_part, _serializerOpts) +
                  _serializer(_part, _serializerOpts);
              });

              break;
            case 'json':
              if (isFirstIteration) {
                acc =
                  `${wrapBracket('{ ', _serializerOpts)}"level": "${lvl}"` +
                  `, "message":"${acc.trim()}"`;
                if (replacers.length) {
                  // If we have more than 0 replacers define "data" field
                  acc += `, "data":${wrapBracket('[ ', _serializerOpts)}`;
                }
              } else if (!isFirstIteration && part) {
                acc += `${_serializer(part, _serializerOpts)}`;
                if (!isLastIteration && strParts[index + 1]) acc += ', ';
              }
              if (replacer) {
                acc += `${_serializer(replacer, _serializerOpts)}`;
                if (!isLastIteration && strParts[index + 1]) acc += ', ';
              }

              if (isLastIteration && replacers.length) {
                // If we have more than 0 close "data" array, before closing object
                acc += wrapBracket(' ]', _serializerOpts);
              }
              if (isLastIteration) {
                acc += wrapBracket(' }', _serializerOpts);
              }
              break;
          }

          return acc;
        }, startMsg);

        (stream || consoleToStream(lvl)).write(
          result + (format === 'json' ? '\n' : '\n\n'),
        );
      },
    );
  };
