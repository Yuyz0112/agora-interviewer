import { rtc, Signal } from "./sdk";
import { getRoomId, playRemoteStream, log } from "./utils";
import { APP_ID, START } from "./constant";
import "../css/style.css";

async function main() {
  try {
    const roomId = getRoomId();
    const account = `${roomId}-interviewee`;
    const interviewerAccount = `${roomId}-interviewer`;
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
    // 4. publish local stream, no need to wait it done
    rtc.publish(stream);
    // 5. try to subscribe the remote stream and play it in the
    //    remote video wrapper when subscribed
    rtc.subscribe(playRemoteStream);
    // 6. login signal
    const signal = new Signal(APP_ID);
    await signal.login(account);
    // 7. listen to message
    signal.on("messageInstantReceive", (messageAccount, uid, message) => {
      if (messageAccount === interviewerAccount && message === START) {
        log("start");
        setInterval(() => {
          signal.messageInstantSend(interviewerAccount, "ping");
        }, 1000);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

main();
