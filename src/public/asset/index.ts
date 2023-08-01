import * as socketIO from './socket.io.min';

//////////////////////////////// global vars ///////////////////////////

// rtc peer connection configuration
const configuration = {
    iceServers: [
        {
            urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
            ],
        },
    ],
    iceCandidatePoolSize: 10,
};

// connected peer connections
const peers: Map<string, RTCPeerConnection> = new Map();

// connected remote streams
const remoteStreams: Map<string, MediaStream> = new Map();

// my stream
let localStream: MediaStream;

// socket io client
let socket;

// video grid to show all the users streaming
const videoGrid = document.getElementById('videos-grid');

////////////////////////////////// function call ///////////////////////////////

// start local stream, add it to video grid and initiate socket connection
startStreaming();

///////////////////////////////// function decleration //////////////////////////

/// start my streaming
async function startStreaming() {
    try {

        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        // add local to the video grid
        addVideo(undefined, localStream);

        initiateSocketConnection();
    }
    catch (e) {
        console.log('startStreaming - error: ' + e);
    }
}

// initiate socket connection
function initiateSocketConnection() {

    socket = socketIO.io('/');

    socket.on('ON_JOIN_REQUEST', async (data: any) => {
        console.log('ON_JOIN_REQUEST');

        const socketId = data.socket_id;

        // create new peer connection
        const pc: RTCPeerConnection = addNewPeerConnection(socketId);

        // Get candidates for sender
        pc.onicecandidate = (event) => {

            if (event.candidate) {
                socket!.emit("ON_OFFER_CANDIDATE", {
                    socket_id: socketId,
                    candidate: event.candidate.toJSON(),
                });
            }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(new RTCSessionDescription(offer));

        socket!.emit("ON_OFFER_CREATED", {
            socket_id: socketId,
            offer: offer,
        });

    });

    socket.on('ON_OFFER_CREATED', async (data: any) => {
        console.log('ON_OFFER_CREATED');

        const socketId = data.socket_id;

        // create new peer connection
        const pc: RTCPeerConnection = addNewPeerConnection(socketId);

        // Get candidates for receiver
        pc.onicecandidate = (event) => {

            if (event.candidate) {
                socket!.emit("ON_ANSWER_CANDIDATE", {
                    socket_id: socketId,
                    candidate: event.candidate.toJSON(),
                });
            }
        };

        await pc.setRemoteDescription(
            new RTCSessionDescription(data.offer)
        );

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(new RTCSessionDescription(answer));

        socket!.emit("ON_ANSWER_CREATED", {
            answer: answer,
            socket_id: socketId,
        });
    });

    socket.on('ON_ANSWER_CREATED', async (data: any) => {
        console.log('ON_ANSWER_CREATED');

        await peers.get(data.socket_id)?.setRemoteDescription(
            new RTCSessionDescription(data.answer)
        );
    });

    socket.on('ON_OFFER_CANDIDATE', async (data: any) => {
        console.log('ON_OFFER_CANDIDATE');

        const socketId = data.socket_id;
        const pc = peers.get(socketId);

        if (!pc) return;

        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    socket.on('ON_ANSWER_CANDIDATE', async (data: any) => {
        console.log('ON_ANSWER_CANDIDATE');

        const socketId = data.socket_id;
        const pc = peers.get(socketId);

        if (!pc) return;

        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    socket.on('ON_DISCONNECTED', (data: any) => {
        console.log('ON_DISCONNECTED: ' + data.socket_id);

        const socketId = data.socket_id;

        removePeerConnection(socketId);
    });
}

function addNewPeerConnection(socketId: string) {

    const pc: RTCPeerConnection = new RTCPeerConnection(configuration);
    peers.set(socketId, pc);

    const stream = new MediaStream();

    remoteStreams.set(socketId, stream);

    addVideo(socketId, stream);

    pushLocalStream(pc);
    listenToRemoteStream(pc, remoteStreams.get(socketId));

    return pc;
}

function removePeerConnection(socketId: string) {

    const pc = peers.get(socketId);

    if (!pc) return;

    pc.close();
    peers.delete(socketId);
    remoteStreams.delete(socketId);
    removeVideo(socketId);
}

// push local stream to peer
function pushLocalStream(pc: RTCPeerConnection) {

    localStream.getTracks().forEach((track: MediaStreamTrack) => {

        pc.addTrack(track, localStream);
    });
}

// get remote stream from peer
function listenToRemoteStream(pc: RTCPeerConnection, stream?: MediaStream) {

    pc.ontrack = function (this: RTCPeerConnection, ev: RTCTrackEvent) {
        console.log('ontrack: ' + ev.streams.map((stream: MediaStream) => stream.id));
        console.log('locale stream: ' + localStream.id);

        ev.streams[0].getTracks().forEach((track: MediaStreamTrack) => {

            stream?.addTrack(track);
        });
    };
}

/// add video to the video grid
function addVideo(socketId: string | undefined, stream: MediaStream) {

    const video = document.createElement('video');
    video.srcObject = stream;

    if (socketId) video.setAttribute('id', socketId);
    else video.muted = true; // i like the echo but not this time :)

    video.addEventListener('loadedmetadata', () => {
        video.play()
    });

    videoGrid!.append(video);
}

/// remove video from the video grid
function removeVideo(socketId: string) {

    const video = document.getElementById(socketId);

    if (video) {
        videoGrid?.removeChild(video);
    }
}
