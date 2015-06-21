// loads the socket.io-client which exposes an 'io' global and the connection event
// defaults to trying to the host that served the page
var socket = io();

// binds a message to an element based on id 
var addMessage = function(id,username,message){
  return $('#'+id).append($('<p>').html("<b>"+username+" "+message+"</b>"));
}

$('#messagingWindow').hide()

$('#messageForm').submit(function(){
  socket.emit('chat_message', $('#inputMessage').val());
  $('#inputMessage').val(''); // clears input after submit
  return false; // no refresh after submit, i.e. prevents submit event
});

$('#usernameForm').submit(function(){
  socket.emit('username',$('#inputUsername').val()); 
  $('#inputUsername').val('') // clears input after submit
  $('#usernameForm').hide("fast"); //hide username form
  $('#messagingWindow').show("slow"); //show message form
  return false; // no refresh after submit, i.e. prevents submit event
});

$('#groupForm').submit(function(){
  socket.emit('join_group',$('#inputGroupName').val());
  $('#inputGroupName').val('');
  return false;
})

$('#createGroupForm').submit(function(){
  socket.emit('create_group',$('#createGroup').val());
  $('#createGroup').val('');
  return false;
})

// listening on chat message event
socket.on('chat_message',function(username,message){
  console.log("sent a chat message")
  var id="messages";
  addMessage(id,username,message);
});

socket.on('people_online',function(people_who_are_online){
  $('#online').html('') //clear html
  people_who_are_online.forEach(function(item){ // populate with people who are online
    $('#online').append($('<p>').text(item));
  })
});



socket.on('refresh_groups',function(groups){
  // console.log(groups);
  $('#groupAccordion').html('')
  // displayall existing groups
  // console.log(groups)
  var index = 0
  for (group in groups){   
  //group return name of group not object itself
  // add an accordeon element with the id of the group name
    var panelId="heading"+group
    var collapsePanelId="collapse"+group
    var refCollapsePanelId="#"+collapsePanelId
    console.log(panelId,collapsePanelId)

    // converts all items in group to html list
    var list_of_users = ''
    groups[group].forEach(function(user){
      list_of_users+='<li class="list-group-item">'+user+'</li>'
    })

    // js does not carry strings onto next line so need +
    $('#groupAccordion').append($('<div class="panel panel-default">'+
            '<div class="panel-heading" id='+panelId+'>'+
              '<h4 class="panel-title">'+
                '<a role="button" data-toggle="collapse" data-parent="#groupAccordion" href='+refCollapsePanelId+'>'+
                  group+'</a>'+
              '</h4>'+
            '</div>'+
            '<div id='+collapsePanelId+' class="panel-collapse collapse in">'+
              '<ul class="list-group">'+
                  list_of_users +
              '</div>'+
            '</div>'+
          '</div>'
          ))
    // $('#list_groups').append($('<p id='+group+'>').text(group));
    // groups[group].forEach(function(user){
      // add all the users 
      // $('#'+group).append($('<p>').text(user));
    }
  })

socket.on('user_disconnected',function(username){
  var message = "left the conversation"
  var id = "messages"
  addMessage(id,username,message);
})

socket.on('user_connected',function(username){
  var message="joined the conversation"
  var id = "messages"
  addMessage(id,username,message);
})

