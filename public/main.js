const constraints = { video: true, audio: true };
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;
let localPeerConnection;
let remotePeerConnection;

const socket = io();

socket.on('peer sdp', sdp => {
  remotePeerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
});

function gotStream(localMediaStream) {
  localStream = localMediaStream;
  window.stream = localMediaStream;

  localVideo.src = window.URL.createObjectURL(localMediaStream);
  localVideo.play();
}

function gotRemoteStream(event) {
  remoteVideo.src = window.URL.createObjectURL(event.stream);
}

function errorCallback(error) {
  console.log('getUserMedia error: ', error);
}

function gotRemoteIceCandidate(event) {
  console.log(`Remote Ice connection: ${event}`);
  localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
}

function gotLocalIceCandidate(event) {
  console.log(`Local Ice connection: ${event}`);
  // remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
  socket.emit('new peer', event.candidate);
}

function gotRemoteDescription(description) {
  remotePeerConnection.setLocalDescription(description);
  localPeerConnection.setRemoteDescription(description);
}

function gotLocalDescription(description) {
  localPeerConnection.setLocalDescription(description);
  remotePeerConnection.setRemoteDescription(description);
  remotePeerConnection.createAnswer(gotRemoteDescription, err => {
    console.log(err);
  });
}

function start() {
  navigator.getUserMedia =
    navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  navigator.getUserMedia(constraints, gotStream, errorCallback);
}

function call() {
  const servers = null;

  localPeerConnection = new RTCPeerConnection(servers);
  localPeerConnection.onicecandidate = gotLocalIceCandidate;

  remotePeerConnection = new RTCPeerConnection(servers);
  remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
  remotePeerConnection.onaddstream = gotRemoteStream;

  localPeerConnection.addStream(localStream);
  localPeerConnection.createOffer(gotLocalDescription, error => {
    console.log(error);
  });
}
