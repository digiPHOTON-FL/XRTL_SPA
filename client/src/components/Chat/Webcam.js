import { useSocketContext } from '../../services/SocketContext'
import React, { useRef, useEffect, useState } from "react";
import { useAppContext } from "../../services/AppContext";
import styles from "./Webcam.module.css";
var Peer = require('simple-peer');
var roomID = '';

const Video = (props) => {
    const ref = useRef();
    const tempRef = useRef();

    const peerStream = () => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }

    tempRef.current = peerStream;

    useEffect(() => {
        tempRef.current();
    }, []);

    return (
        <video playsInline autoPlay ref={ref} />
    );
}

const Webcam = () => {
    const socketCtx = useSocketContext();
    const appCtx = useAppContext();
    var [peers, setPeers] = useState([]);
    const userVideo = useRef();
    const peersRef = useRef([]);
    const tempWebcam = useRef();

    const webcamEmit = () => {
        const videoConstraints = {
            height: window.innerHeight,
            width: window.innerWidth
        };


        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;

            socketCtx.socket.emit('client join room'); // new client will be added to the userList

            socketCtx.socket.on('all users', users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketCtx.socket.id, stream);       // creates a peer for each client that is already in the room
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    });
                    peers.push({
                        peerID: userID,
                        peer,
                    });
                })
                setPeers(peers);
            })

            socketCtx.socket.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream); //creates a new peer & adds it to the list for a freshly joining client
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                });

                const peerObj = {
                    peer,
                    peerID: payload.callerID
                }

                setPeers(users => [...users, peerObj]);
            });

            socketCtx.socket.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

            socketCtx.socket.on('user left', (id) => {
                console.log("hier")
                const peerObj = peersRef.current.find(p => p.peerID === id)

                if (peerObj) {
                    peerObj.peer.destroy();
                }
                const peers = peersRef.current.filter(p => p.peerID !== id);
                peersRef.current = peers;
                setPeers(peers)
            })
        })

        function createPeer(userToSignal, callerID, stream) {       //Erstellen von peer für alle bisher Clienten die sich bisher im Raum schon befinden
            const peer = new Peer({
                initiator: true,        //wichtig, damit Stream in die gesendet werden kann
                trickle: false,
                stream,     //eigener Stream
            });

            peer.on("signal", signal => {
                socketCtx.socket.emit("sending signal", ({ userToSignal, callerID, signal }));
            })
            return peer;
        }

        function addPeer(incomingSignal, callerID, stream) {        //creates peers for all following joining clients
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream,
            });

            peer.on("signal", signal => {
                socketCtx.socket.emit("returning signal", { signal, callerID });
            });
            peer.signal(incomingSignal);
            return peer;
        }
    }

    tempWebcam.current = webcamEmit;

    useEffect(() => {
        tempWebcam.current();
    }, [appCtx.showWebcam])


    return (
        <div className={styles.webcamDiv}>
            <video className={styles.videoSt} muted ref={userVideo} autoPlay playsInline />
            {peers.map((peer) => {           //wenn man diese Schleife weglässt, dann wird nur der eigene Stream dargestellt
                return (
                    <Video key={peer.peerID} peer={peer.peer} />
                );
            })}
        </div>
    );

};

export default Webcam;