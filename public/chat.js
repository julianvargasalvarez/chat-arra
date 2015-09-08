var giphyUrl = 'http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=';

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
  if(message.match(/^\/giphy/)) {
    var keywords = message.replace(/^\/giphy/g, '').trim();
    $.get(giphyUrl+keywords, function(result) {
      appendHistory("<img src='" + result.data.fixed_width_small_url + "'/>");
    })
  } else {
    appendHistory(message);
  }
}

function clearTextInput() {
  $("#txt-message").val("").focus()
}

function bindTxtMessageTo(socket) {
  $('#txt-message').keypress(function (e) {
    if (e.which == 13) {
      newMessage(socket)
      return false
    }
  });
}

function appendHistory(message) {
  return $("#chat-history").append("<li>"+message+"</li>");
}
