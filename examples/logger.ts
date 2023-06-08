import { tinyTrack } from '@src/logger';

const tt = tinyTrack([
  { colorize: true, stream: process.stdout, format: 'pretty', maxDepth: 1 },
  // { colorize: true, stream: process.stdout, format: 'json', maxDepth: 2 },
  // {
  //   level: ['debug', 'warn'],
  //   colorize: false,
  //   stream: fs.createWriteStream(path.resolve(process.cwd(), 'debug.log')),
  // },
  // {
  //   level: 'error',
  //   colorize: false,
  //   stream: fs.createWriteStream(path.resolve(process.cwd(), 'error.log')),
  // },
]);

const objWithCirular = {
  url: 'http://ya.ru',
  another: true,
  nested: {},
  data: [
    1,
    ['true', false, { ulala: 123 }],
    3,
    function main() {
      console.log('123');
    },
  ],
} as any;

objWithCirular.self = objWithCirular;
objWithCirular.nested.self = objWithCirular;

tt`Hello world ${404} extra text ${'ololoso'} sssadsad`;
// { level: info, message: "Hello world", data: [ 404, "extra text", "olololol", "assssdsd" ] }
tt`wImportant message ${{ status: 'ok' }}`;
// { level: warning, message: "Important message", date: [{ status: ok }] }
tt`!Failed get data from ${objWithCirular} exasdsadsad`;
// { level: error, message: Failed get data from, data: [{...}, exasdsadsad]}
tt`dverbose messsage for debugging`;
// { level: error, message: verbose messsage for debugging }
