const io = require('socket.io-client');
const socket = io('http://localhost:3001', {
  query:
    'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJKb2huIERvZSIsImlkIjoiMTIzIiwiaWF0IjoxNTE2MjM5MDIyfQ.73c3a59AELo6xRMdISqLrqWAhLwPJGbCDzzVQl3UH2Q',
});

socket.on('connect_error', err => {
  console.log('connection error: ', err.message);
});

socket.on('save_success', function (message) {
  console.log('save_success received from server: ', message);
});

socket.on('save_error', function (message) {
  console.log('Save error: ', message);
});

if (process.env.EMIT_EVENT === 'true') {
  socket.emit('save', { text: 'hello' }, response => {
    console.log(response); // "got it"
  });
}
