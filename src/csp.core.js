// @flow
import { fixed, promise } from './impl/buffers';
import { putThenCallback, Process } from './impl/process';
import { chan as channel, Channel, CLOSED } from './impl/channels';
import type { BufferInterface } from './impl/protocols';

export function spawn(gen: Generator<any, void, any>): Channel {
  const ch = channel(fixed(1));
  const process = new Process(gen, value => {
    if (value === CLOSED) {
      ch.close();
    } else {
      putThenCallback(ch, value, () => ch.close());
    }
  });

  process.run();
  return ch;
}

export function go(f: Function, args: any[] = []): Channel {
  return spawn(f(...args));
}

export function chan(
  bufferOrNumber: ?BufferInterface<any>,
  xform: ?Function,
  exHandler: ?Function
): Channel {
  if (typeof bufferOrNumber === 'number') {
    return channel(
      bufferOrNumber === 0 ? null : fixed(bufferOrNumber),
      xform,
      exHandler
    );
  }

  return channel(bufferOrNumber, xform, exHandler);
}

export function promiseChan(xform: ?Function, exHandler: ?Function): Channel {
  return channel(promise(), xform, exHandler);
}
