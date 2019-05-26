export function getRoomId() {
  const matches = window.location.search.match(/[?|&]id=(\w+)(&|$)/);
  if (!matches) {
    throw new Error("Room Id is required.");
  }
  return matches[1];
}

const domId = "remote-video";
export function playRemoteStream(stream) {
  document
    .querySelectorAll(`#${domId}`)
    .forEach(el => el.parentNode.removeChild(el));
  document
    .querySelector(".video")
    .insertAdjacentHTML(
      "beforeend",
      `<div class="minor-video-wrapper" id="${domId}"></div>`
    );
  stream.play(domId);
}

const promot = "[interview-app]:";
export function log(...val) {
  console.log(promot, ...val);
}

class Queue {
  constructor() {
    this._list = [];
    this.length = 0;
    this.handlers = {
      enqueue: [],
      dequeue: []
    };
  }

  enqueue(item) {
    this.length++;
    this._list.push(item);
    for (const handler of this.handlers.enqueue) {
      handler(item);
    }
  }

  dequeue() {
    if (this.length > 0) {
      this.length--;
      return this._list.shift();
    }
  }

  on(action, handler) {
    this.handlers[action].push(handler);
  }
}

export const eventQueue = new Queue();

export const CHUNK_START = "_0_";
export const CHUNK_SIZE = 8 * 1024 - CHUNK_START.length;
export const CHUNK_REG = new RegExp(`.{1,${CHUNK_SIZE}}`, "g");
