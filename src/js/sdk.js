import AgoraRTC from "agora-rtc-sdk";

const client = AgoraRTC.createClient({ mode: "live", codec: "h264" });

export const init = appId =>
  new Promise((resolve, reject) => {
    client.init(appId, () => resolve(), err => reject(err));
  });

export const join = (tokenOrKey, channel, uid) =>
  new Promise((resolve, reject) => {
    client.join(
      tokenOrKey,
      channel,
      uid,
      joinedId => resolve(joinedId),
      err => reject(err)
    );
  });

export const createStream = AgoraRTC.createStream;

export const initStream = stream =>
  new Promise((resolve, reject) => {
    stream.init(() => resolve(), err => reject(err));
  });

export const publish = stream =>
  new Promise((resolve, reject) => {
    client.publish(stream, err => reject(err));
    client.on("stream-published", evt => resolve(evt));
  });

export const subscribe = () =>
  new Promise((resolve, reject) => {
    client.on("stream-added", evt => {
      const { stream } = evt;
      client.subscribe(stream, err => reject(err));
    });
    client.on("stream-subscribed", evt => {
      resolve(evt.stream);
    });
  });
