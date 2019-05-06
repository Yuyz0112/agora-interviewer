import AgoraRTC from "agora-rtc-sdk";
import AgoraSig from "../../vendor/AgoraSig-1.4.0";

const client = AgoraRTC.createClient({ mode: "live", codec: "h264" });

const init = appId =>
  new Promise((resolve, reject) => {
    client.init(appId, () => resolve(), err => reject(err));
  });

const join = (tokenOrKey, channel, uid) =>
  new Promise((resolve, reject) => {
    client.join(
      tokenOrKey,
      channel,
      uid,
      joinedId => resolve(joinedId),
      err => reject(err)
    );
  });

const createStream = AgoraRTC.createStream;

const initStream = stream =>
  new Promise((resolve, reject) => {
    stream.init(() => resolve(), err => reject(err));
  });

const publish = stream =>
  new Promise((resolve, reject) => {
    client.publish(stream, err => reject(err));
    client.on("stream-published", evt => resolve(evt));
  });

const subscribe = cb =>
  new Promise((resolve, reject) => {
    client.on("stream-added", evt => {
      const { stream } = evt;
      client.subscribe(stream, err => reject(err));
    });
    client.on("stream-subscribed", evt => {
      resolve(evt.stream);
      if (cb) {
        cb(evt.stream);
      }
    });
  });

export const rtc = {
  client,
  init,
  join,
  createStream,
  initStream,
  publish,
  subscribe
};

export class Signal {
  constructor(appId) {
    this.signal = new AgoraSig(appId);
  }

  login(account, token = "_no_need_token") {
    return new Promise((resolve, reject) => {
      this.session = this.signal.login(account, token);
      this.session.onLoginSuccess = resolve;
      this.session.onLoginFailed = reject;
    });
  }

  messageInstantSend(account, message) {
    return new Promise(resolve => {
      this.session.messageInstantSend(account, message, resolve);
    });
  }

  on(event, cb) {
    switch (event) {
      case "messageInstantReceive":
        this.session.onMessageInstantReceive = cb;
        break;
      default:
        break;
    }
  }
}
