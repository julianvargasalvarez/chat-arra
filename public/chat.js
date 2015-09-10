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

  socket.on('error', function(error){ console.log("Error:", error) })

  socket.on('connect', function(){
    console.log("Listo, conectado");
    bindTxtMessageTo(socket);

    connectToChannels(socket);
  })
}

function connectToChannels(socket) {
  var privateChannel = getParameterByName('private-channel');
  if(privateChannel) {
    socket.emit('new-private-channel', privateChannel);
    socket.on(privateChannel, function(data) { addMessageText(data.message); });
  } else {
    socket.emit('new-user', userEmail());
    socket.on('general',  function(data){ addMessageText(data.message); })
    socket.on('new-user', function(data){ addNewUser(data);             })
  }
}

function authToken() {
  return $('.user-data').data('token');
}

function userEmail() {
  return $('.user-data').data('user').email;
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

function addNewUser(user) {
  return $("#users").append("<li>"+user+"</li>");
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
