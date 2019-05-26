import { rtc, Signal } from "./sdk";
import {
  getRoomId,
  playRemoteStream,
  log,
  eventQueue,
  CHUNK_START,
  CHUNK_SIZE,
  CHUNK_REG
} from "./utils";
import { APP_ID, START, ACK } from "./constant";
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
    let onFlight = false;
    signal.on("messageInstantReceive", async (messageAccount, uid, message) => {
      if (messageAccount !== interviewerAccount) {
        return;
      }
      if (message === START) {
        onFlight = true;
        console.log("send first");
        await signal.messageInstantSend(
          interviewerAccount,
          eventQueue.dequeue()
        );
        eventQueue.on("enqueue", async () => {
          if (!onFlight) {
            console.log("resend first");
            await signal.messageInstantSend(
              interviewerAccount,
              eventQueue.dequeue()
            );
          }
        });
      }
      if (message === ACK) {
        if (eventQueue.length > 0) {
          console.log("send with ack");
          await signal.messageInstantSend(
            interviewerAccount,
            eventQueue.dequeue()
          );
        } else {
          console.log("finish all");
          onFlight = false;
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
}

log("start record");
window._e = [];
window.addEventListener("message", e => {
  if (!e.data.event) {
    return;
  }
  const eventStr = JSON.stringify(e.data.event);
  window._e.push(e.data.event);
  if (eventStr.length < CHUNK_SIZE) {
    eventQueue.enqueue(eventStr);
  } else {
    for (const chunk of eventStr.match(CHUNK_REG)) {
      eventQueue.enqueue(CHUNK_START + chunk);
    }
  }
});

main();
