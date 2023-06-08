import { EscSequences } from './constants/esc-sequences';

export function colorize(color: string, msg: unknown) {
  return `${color}${msg}${EscSequences.Reset}`;
}
