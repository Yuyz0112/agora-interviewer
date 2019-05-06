import { rtc } from "./sdk";
import { getRoomId, playRemoteStream } from "./utils";
import { APP_ID } from "./constant";
import "../css/style.css";

async function main() {
  try {
    // 1. init the client
    await rtc.init(APP_ID);
    // 2. join the channel
    const uid = await rtc.join(null, getRoomId(), "interviewer");
    // 3. create a stream, init it and play it in the local video wrapper
    const stream = rtc.createStream({
      streamID: uid,
      audio: true,
      video: true,
      screen: false
    });
    await rtc.initStream(stream);
    stream.play("video");
    // 4. try to subscribe the remote stream and play it in the
    //    remote video wrapper when subscribed
    await rtc.subscribe(playRemoteStream);
    // 5. publish local stream after subscribed
    await rtc.publish(stream);
  } catch (error) {
    console.error(error);
  }
}

main();
