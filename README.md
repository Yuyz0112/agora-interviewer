# agora-interviewer

This project is the prototype of a live code interview tooling.
It could not be used in production because of the current implementation is:

1. Not quite optimized for network efficiency.
2. Does not handle some corner case like reconnect.

But it is still interesting to see the power of the combination of WebRTC(using agora.io), Monaco-editor(VScode's frontend editor) and rrweb(a web session replay library).

## try the demo

1. build the project

```
npm run build
```

2. start a http server

```
npm run start
```

3. open interviewee page in `http://localhost:1234/interviewee.html?id=1`

4. open interviewer page in `http://localhost:1234/interviewer.html?id=1`
