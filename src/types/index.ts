export type TinyTrackLevel = 'error' | 'warn' | 'debug' | 'info';

export type TinyTrackFormat = 'pretty' | 'json';

export type SerializerOptions = Partial<{
  colorize: boolean;
  maxDepth: number;
  format: TinyTrackFormat;
}>;

export type SerializedValue = string | number | boolean;

export type TinyTrackOptionsItem = Partial<{
  level: TinyTrackLevel | Array<TinyTrackLevel>;
  colorize: Boolean;
  format: TinyTrackFormat;
  maxDepth: number;
  meta: Partial<{ name: string }>;
  stream: { write(msg: string): void };
  serializer: (value: any, options?: SerializerOptions) => string;
}>;

export type TinyTrackOptions =
  | TinyTrackOptionsItem
  | Array<TinyTrackOptionsItem>;

/**
 * Tagged function which provides minimalistic logger interface
 */
export type TinyTrackLogger = (
  strParts: TemplateStringsArray,
  ...replacers: any[]
) => void;

export type TinyTrack = (options: TinyTrackOptions) => TinyTrackLogger;
