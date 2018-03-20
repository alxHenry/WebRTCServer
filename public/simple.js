const socket = io('http://10.89.100.232:8111');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

const configuration = { audio: true, video: true };
let peerConnection;

function gotDescription(desc) {
  peerConnection.setLocalDescription(desc);
  socket.emit('peer sdp', desc);
}

// run start(true) to initiate a call
function start(isCaller) {
  peerConnection = new RTCPeerConnection();

  // send any ice candidates to the other peer
  peerConnection.onicecandidate = evt => {
    socket.emit('new peer candidate', evt.candidate);
  };

  // once remote stream arrives, show it in the remote video element
  peerConnection.onaddstream = evt => {
    console.log(`evt.stream: ${evt.stream.id}`);
    remoteVideo.srcObject = evt.stream;
  };

  // get the local stream, show it in the local video element and send it
  navigator.getUserMedia(
    configuration,
    stream => {
      localVideo.srcObject = stream;
      console.log(`stream id: ${stream.id}`);
      peerConnection.addStream(stream);

      if (isCaller) {
        peerConnection.createOffer(gotDescription, err => {
          console.log(err);
        });
      } else {
        peerConnection.createAnswer(gotDescription, err => {
          console.log(err);
        });
      }
    },
    err => {
      console.log(err);
    }
  );
}

socket.on('new peer candidate', candidate => {
  if (!peerConnection) {
    start(false);
  }

  if (!candidate) {
    return;
  }
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on('peer sdp', desc => {
  if (!peerConnection) {
    start(false);
  }

  peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
});
