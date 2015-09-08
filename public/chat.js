$(document).ready(function() {
  if(authToken()){
    socketAuth();
  }
})

function socketAuth(){
  var channel = 'general'

  socket = io.connect("http://localhost:3000/", { query: 'token=' + authToken() });
  console.log("Listo, creado el socket de la linea 13", socket);

  socket.on('error', function(error){
    console.log("Error:", error)
  })

  socket.on('connect', function(){
    console.log("Listo, conectado");
    bindTxtMessageTo(socket);

    socket.on('general', function(info){
      addMessageText(info.message);
      console.log(info)
    })

  })
}

function authToken() {
  return $('.user-data').data('token');
}

function newMessage(socket) {
  var message = $("#txt-message").val()
  socket.emit('general', message)
  addMessageText(message)
  clearTextInput()
  return false
}

function addMessageText(message) {
  $("#chat-history").append("<li>"+message+"</li>")
}

function clearTextInput() {
  $("#txt-message").val("").focus()
}

function bindTxtMessageTo(socket) {
  $('#txt-message').keypress(function (e) {
    console.log(e.which);
    if (e.which == 13) {
      newMessage(socket)
      return false
    }
  });
}
