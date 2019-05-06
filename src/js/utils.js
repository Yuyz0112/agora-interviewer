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
