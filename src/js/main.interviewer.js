import { Replayer } from "rrweb";
import { rtc, Signal } from "./sdk";
import { getRoomId, playRemoteStream, log, CHUNK_START } from "./utils";
import { APP_ID, START, ACK } from "./constant";
import "rrweb/dist/rrweb.min.css";
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
    let replayer;
    let initialEvents = [];
    let largeMessage = "";
    signal.on("messageInstantReceive", async (messageAccount, uid, message) => {
      await signal.messageInstantSend(`${roomId}-interviewee`, ACK);
      const events = [];
      if (message.startsWith(CHUNK_START)) {
        largeMessage += message.slice(CHUNK_START.length, message.length);
      } else {
        if (largeMessage) {
          // reset chunks
          events.push(JSON.parse(largeMessage));
          largeMessage = "";
        }
        events.push(JSON.parse(message));
      }
      if (!events.length) {
        return;
      }
      for (const event of events) {
        log(event.type, event.timestamp);
        if (initialEvents.length < 2) {
          initialEvents.push(event);
          if (initialEvents.length === 2) {
            replayer = new Replayer(initialEvents, {
              root: document.querySelector(".editor"),
              liveMode: true
            });
            replayer.play();
          }
        } else {
          replayer.addEvent(event);
        }
      }
    });
    signal.messageInstantSend(`${roomId}-interviewee`, START);
  } catch (error) {
    console.error(error);
  }
}

main();
