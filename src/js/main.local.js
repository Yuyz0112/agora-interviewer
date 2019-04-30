import {
  init,
  join,
  createStream,
  initStream,
  publish,
  subscribe
} from "./sdk";
import { APP_ID } from "./constant";
import "../css/style.css";

async function main() {
  try {
    // 1. init the client
    await init(APP_ID);
    // 2. join the channel
    const uid = await join(null, "interview-0", "user-0");
    // 3. create a stream, init it and play it in the local video wrapper
    const stream = createStream({
      streamID: uid,
      audio: true,
      video: true,
      screen: false
    });
    await initStream(stream);
    stream.play("video");
    // 4. try to subscribe the remote stream and play it in the
    //    remote video wrapper when subscribed
    const remoteStream = await subscribe();
    remoteStream.play("remote-video");
    // 5. publish local stream after subscribed
    await publish(stream);
  } catch (error) {
    console.error(error);
  }
}

main();
