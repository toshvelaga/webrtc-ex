import React, { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { Button } from '@material-ui/core'
import { changeCssVideos } from './utils'
import { Row } from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.css'
import './Video.css'

const Video = () => {
  const localVideoref = useRef(null)

  const [videoPreview, setvideoPreview] = useState(true)
  const [streams, setstreams] = useState([])

  var connections = {}
  var socket = null
  var socketId = null
  var elms = 0
  const peerConnectionConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  }

  useEffect(() => {
    // GET USER VIDEO PREVIEW BEFORE ENTERING ROOM IF ghost IS NOT IN QUERY PARAM
    getPermissions()
  }, [])

  const getPermissions = async () => {
    await navigator.mediaDevices
      .getUserMedia({
        video: window.location.href.includes('ghost') ? false : true,
        audio: true,
      })
      .then((stream) => {
        streams.push(stream)
        window.localStream = stream
        localVideoref.current.srcObject = stream
      })
      .catch((e) => console.log(e))
  }

  const getUserMedia = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: window.location.href.includes('ghost') ? false : true,
        audio: true,
      })
      .then((stream) => {
        getUserMediaSuccess(stream)
      })
      .catch((e) => console.log(e))
  }

  const getUserMediaSuccess = (stream) => {
    streams.push(window.localStream)
    window.localStream = stream
    localVideoref.current.srcObject = stream

    for (let id in connections) {
      if (id === socketId) continue

      stream.getTracks().forEach((track) => {
        !window.location.href.includes('ghost') &&
          connections[id].addTrack(track, stream)
      })

      // User creates offers to connect with other users who join room
      // eslint-disable-next-line no-loop-func
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            // emit local description to other users
            socket.emit(
              'signal',
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            )
          })
          .catch((e) => console.log(e))
      })
    }
  }

  const gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message)
    // get remote descriptions from other users and create an answer to send to them
    if (fromId !== socketId) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === 'offer') {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socket.emit(
                        'signal',
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      )
                    })
                    .catch((e) => console.log(e))
                })
                .catch((e) => console.log(e))
            }
          })
          .catch((e) => console.log(e))
      }
      // ADD NEW ICE CANDIDATES
      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e))
      }
    }
  }

  const connectToSocketServer = () => {
    socket = io.connect('http://localhost:4001', { secure: true })

    socket.on('signal', gotMessageFromServer)

    socket.on('connect', () => {
      socket.emit('join-call', window.location.href)
      socketId = socket.id
      console.log('socketId', socketId)
      // REMOVE VIDEO WHEN USER LEAVES
      socket.on('user-left', (id) => {
        let video = document.querySelector(`[data-socket="${id}"]`)
        if (video !== null) {
          elms--
          //remove video from DOM
          video.parentNode.removeChild(video)

          let main = document.getElementById('main')
          // resize the remaining videos height and width after user leaves
          changeCssVideos(main, elms)
        }
      })

      socket.on('user-joined', (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConnectionConfig
          )
          // Wait for their ice candidate
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socket.emit(
                'signal',
                socketListId,
                JSON.stringify({ ice: event.candidate })
              )
            }
          }

          // Wait for video stream from other participants and add it to DOM
          connections[socketListId].ontrack = (event) => {
            var searchVideo = document.querySelector(
              `[data-socket="${socketListId}"]`
            )
            console.log(searchVideo)
            if (searchVideo !== null) {
              searchVideo.srcObject = event.streams[0]
            } else {
              // ADD NEW VIDEO ELEMENT TO THE DOM AND CHANGE CSS WIDTH + HEIGHT OF VIDEOS
              elms = clients.length - 1
              let main = document.getElementById('main')
              let cssMesure = changeCssVideos(main, elms)

              let video = document.createElement('video')

              let css = {
                minWidth: cssMesure.minWidth,
                minHeight: cssMesure.minHeight,
                maxHeight: '100%',
                objectFit: 'fill',
              }
              for (let i in css) video.style[i] = css[i]

              video.style.setProperty('width', cssMesure.width)
              video.style.setProperty('height', cssMesure.height)
              video.setAttribute('data-socket', socketListId)
              video.srcObject = event.stream
              video.autoplay = true
              video.playsinline = true

              main.appendChild(video)
            }
          }

          // Add the local video stream's tracks
          if (window.localStream !== undefined && window.localStream !== null) {
            window.localStream.getTracks().forEach(function (track) {
              connections[socketListId].addTrack(track, window.localStream)
            })
          }
        })

        if (id === socketId) {
          for (let id2 in connections) {
            if (id2 === socketId) continue

            try {
              window.localStream.getTracks().forEach(function (track) {
                connections[id2].addTrack(track, window.localStream)
              })
            } catch (e) {}

            // eslint-disable-next-line no-loop-func
            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socket.emit(
                    'signal',
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  )
                })
                .catch((e) => console.log(e))
            })
          }
        }
      })
    })
  }

  const connect = () => {
    setvideoPreview(false)
    getUserMedia()
    connectToSocketServer()
  }

  return (
    <div>
      {videoPreview === true ? (
        <>
          {/* VIDEO PREVIEW BEFORE ENTERING ROOM */}
          <div className='video-preview-container'>
            <video
              id='my-video'
              className='video-preview'
              ref={localVideoref}
              autoPlay
              muted
            ></video>
          </div>
          <Button variant='contained' color='primary' onClick={connect}>
            Connect
          </Button>
        </>
      ) : (
        <>
          {/* THE ACTUAL VIDEOS IN THE ROOM WITH OTHER CLIENTS */}
          <div className='container'>
            <Row id='main' className='flex-container'>
              <video
                id='my-video'
                ref={localVideoref}
                autoPlay
                muted
                className='my-video'
              ></video>
            </Row>
          </div>
        </>
      )}
    </div>
  )
}

export default Video
