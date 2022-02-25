# Video Meeting

<img width="500" alt="Screen Shot 2022-02-23 at 4 27 40 PM" src="https://user-images.githubusercontent.com/38474161/155429209-26e7f5ff-4d29-4545-ac60-589f40d44f1e.png">

Code is based off this [excellent repo](https://github.com/0x5eba/Video-Meeting) by [Sebastien Biollo](https://github.com/x5eb)

Google Meet / Zoom clone in a few lines of code.

Developed with ReactJS, Node.js, SocketIO.

Main logic is in src/Video.js (frontend) and server.js (server)

# Problem to Solve

1. [How to NOT add a new participant if I join with ?ghost param in the url so that I can record the meeting.](https://stackoverflow.com/questions/71243659/how-to-only-accept-video-streams-from-other-participants-in-webrtc-video-chat-wi)

### Local setup

1. `npm install`
2. `npm start`
3. `nodemon server`
