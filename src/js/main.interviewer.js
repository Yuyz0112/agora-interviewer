import { rtc, Signal } from "./sdk";
import { getRoomId, playRemoteStream, log } from "./utils";
import { APP_ID, START } from "./constant";
import "../css/style.css";

async function main() {
  try {
    const roomId = getRoomId();
    const account = `${roomId}-interviewer`;
    // 1. init the client
    await rtc.init(APP_ID);
    // 2. join the channel
    const uid = await rtc.join(null, roomId, account);
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
    // 6. login signal
    const signal = new Signal(APP_ID);
    await signal.login(`${roomId}-interviewer`);
    // 7. send notification to interviewee and listen to message
    log("send start");
    await signal.messageInstantSend(`${roomId}-interviewee`, START);
    signal.on("messageInstantReceive", (messageAccount, uid, message) => {
      log(message);
    });
  } catch (error) {
    console.error(error);
  }
}

main();
