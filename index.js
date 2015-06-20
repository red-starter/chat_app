// loads the socket.io-client which exposes an 'io' global and the connection event
// defaults to trying to the host that served the page
var socket = io();

// binds a message to an element based on id 
var addMessage = function(id,username,message){
  return $('#'+id).append($('<p>').html("<b>"+username+" "+message+"</b>"));
}

$('#messaging_window').hide()

$('#form1').submit(function(){
  socket.emit('chat message', $('#inputMessage').val());
    $('#inputMessage').val(''); // clears input after submit
    return false; // no refresh after submit, i.e. prevents submit event
  });

$('#form2').submit(function(){
    // socket.emit('username', $('#name').val());
    socket.emit('username',$('#inputUsername').val()); 
      $('#inputUsername').val('') // clears input after submit
      $('#form2').hide("fast"); //hide username form
      $('#messaging_window').show("slow"); //show messgae form
      return false; // no refresh after submit, i.e. prevents submit event
    });
  // listening on chat message event
  socket.on('chat message',function(username,message){
    var id="messages";
    addMessage(id,username,message);
  });

  socket.on('people online',function(people_who_are_online){
    $('#online').html('') //clear html
    for (item in people_who_are_online){ // populate with people who are online
      $('#online').append($('<p>').text(item));
    }
  });

  socket.on('user disconnected',function(username){
    var message = "left the conversation"
    var id = "messages"
    addMessage(id,username,message);
  })
  socket.on('user connected',function(username){
    var message="joined  the conversation"
    var id = "messages"
    addMessage(id,username,message);
  })