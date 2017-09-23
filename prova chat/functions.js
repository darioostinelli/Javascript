var userInfo = {};
var menu = true;

function login(){
   var user = $('#loginUser').val();
   var pass = $('#loginPassword').val();
   loginError('');
   //TODO add validation input
   if(!loginValidation(user, pass)) //data are not valid
        return;
    loginSubmit(user, pass);
}

function loginError(error){
    $('#loginError').text(error);
}

function newRoomError(error){
    $('#newRoomError').text(error);
}

function accessRoomError(error){
    $('#accessRoomError').text(error);
}
function signupError(error){
    $('#signupError').text(error);
}
function loginValidation(user, pass){
    if(user === '' || user === undefined){
        loginError('Insert a user name');
        return false;
    }
    if(pass === '' || pass === undefined){
        loginError('Insert a password');
        return false;
    }
    return true;
}

function loginSubmit(user, pass){
    var data = {action : 'login', user : user, password : pass};
    var JSONdata = JSON.stringify(data);
    $.get('chat_elab.php',
          {data : JSONdata},
          function(data){
            decodedData = JSON.parse(data);
            if(decodedData.code == 'failed'){
                loginError(decodedData.error);
                
            }
            else{
                window.location.replace("index.html");
            }
        })
        .fail(function(){
             loginError("Login error");
        });
}

function verifyAuth(){
    var data = {action : 'verify'};
    var JSONdata = JSON.stringify(data);
    $.get('chat_elab.php',
          {data : JSONdata},
          function(data){
            decodedData = JSON.parse(data);
            if(decodedData.code == 'failed'){
                 window.location.replace("login.html");
            }
            else{
               userInfo.user = decodedData.user;
               $('#userInfo a').text(userInfo.user);
               getAnagraphics();
            }
        })
        .fail(function(){
           // window.location.replace("login.html");
        });
        
}

function showHideMenu(){
    $('#menu').toggle();
    menu = !menu;
    if(menu){
        $('#toggleMenu').attr('src','img/icons/hide.svg');
        
    }
    else{
         $('#toggleMenu').attr('src','img/icons/show.svg');
    }
}

function performLogout(){
    var data = {action : 'logout'};
    var JSONdata = JSON.stringify(data);
    $.get('chat_elab.php',
          {data : JSONdata},
          function(data){
            decodedData = JSON.parse(data);
            if(decodedData.code == 'success'){
                 window.location.replace("login.html");
            }
            
        })
        .fail(function(data){
            alert("Error: " + data.status);
        });
}

function getAnagraphics(){
   var data = {action : 'anagraphics', user : userInfo.user};
    var JSONdata = JSON.stringify(data);
    $.get('chat_elab.php',
          {data : JSONdata},
          function(data){
            decodedData = JSON.parse(data);
            if(decodedData.code == 'success'){
                 userInfo.firstName = decodedData.first_name;
                 userInfo.lastName = decodedData.last_name;
                 userInfo.email = decodedData.email;
                 displayAnagraphics();
            }
            
        })
        .fail(function(data){
            alert("Error: " + data.status);
        });
}

function displayAnagraphics(){
   $('#inputUser').val(userInfo.user);
   $('#inputFirstName').val(userInfo.firstName);
   $('#inputLastName').val(userInfo.lastName);
   $('#inputEmail').val(userInfo.email);
}

function createNewRoom(){
   newRoomError('');
   if($('#inputNewRoom').val() === '' || $('#inputNewRoom').val() === undefined)
      newRoomError('Insert new room name');
   else
   {
      submitNewRoom($('#inputNewRoom').val());
   }
}

function submitNewRoom(roomName){
    var data = {action : 'createRoom', roomName : roomName, user : userInfo.user};
    var JSONdata = JSON.stringify(data);
    $.post('chat_elab.php',
          {data : JSONdata},
          function(data){
            decodedData = JSON.parse(data);
            if(decodedData.code == 'success'){
                 alert("Room created");
                 
            }
            else{
               newRoomError(decodedData.error);
            }
            
        })
        .fail(function(){
            newRoomError('Error: cannot create new room');
        });
}

function getRoomList(){
    var data = {action : 'getRoomList'};
    var JSONdata = JSON.stringify(data);
    getMyRoom();
    $.get('chat_elab.php',
          {data : JSONdata},
          function(data){
            decodedData = JSON.parse(data);
            if(decodedData.code == 'success'){
                 list = decodedData.list;
                 displayRoomList(decodedData.list); 
            }
            else{
               //TODO : handle no rooms
            }
            
        })
        .fail(function(){
           //TODO : handle fail
        });
}

function displayRoomList(list){
   list.forEach(function(el){
      $('#roomList').append("<tr onclick='roomListClick(this)';><td>" + el.room_name + "<td>" + el.user_name + "</td></tr>");
   });
}

function getMyRoom(){
   var data = {action : 'getMyRoom'};
    var JSONdata = JSON.stringify(data);
    $.get('chat_elab.php',
          {data : JSONdata},
          function(data){
            decodedData = JSON.parse(data);
            if(decodedData.code == 'success'){
               myRoom = decodedData.data;
               $('#myRoom').append("<tr onclick='deleteMyRoom();'><td>" + myRoom.room_name + "<td>" + myRoom.user_name + "</td></tr>");
               
            }
            else{
               //TODO handle no room
            }
            
        })
        .fail(function(){
           //TODO : handle fail
        });
}

function deleteMyRoom(){
   //TODO: cancellazione della stanza e di tutti i messaggi rlativi alla stanza
    var r = confirm("Delete the room?");
    if(!r)
      return;
   var data = {action : 'deleteMyRoom'};
    var JSONdata = JSON.stringify(data);
    $.get('chat_elab.php',
          {data : JSONdata},
          function(data){
            decodedData = JSON.parse(data);
            if(decodedData.code == 'success'){
               location.reload();
            }
            else{
               console.error(decodedData.error);
            }
            
        })
        .fail(function(data){
           console.error(data);
        });
}

function roomListClick(elem){
   var index = $('#roomList tr').index($(elem)) - 1;
   var room = list[index]; //room has room_name and room_id of the room selected from the list
   room.action = 'joinRoom';
   var JSONdata = JSON.stringify(room);
    $.post('chat_elab.php',
          {data : JSONdata},
          function(data){
            decodedData = JSON.parse(data);
            if(decodedData.code == 'success'){
                window.location.replace("chat.html");
                 
            }
            else{
               accessRoomError(decodedData.error);
            }
            
        })
        .fail(function(){
            accessRoomError('Error: cannot get into the room');
        });
}

function verifyChat(){
    var data = {action : 'verifyChat'};
    var JSONdata = JSON.stringify(data);
    $.get('chat_elab.php',
          {data : JSONdata},
          function(data){
            decodedData = JSON.parse(data);
            if(decodedData.code == 'failed'){
                if(decodedData.error == "noUser") //redirect to login
                    window.location.replace("login.html");
                else //error = noRoom
                    window.location.replace("rooms.html");
            }
            else{
               roomName = decodedData.room_name;
               userInfo.user = decodedData.user;
               interval = setInterval("getNewMessages()", 1000);
            }
        })
        .fail(function(){
           // window.location.replace("login.html");
        });
        
}

function getNewMessages(){
   data = {action : 'getMessages' , last : lastTs}
   JSONdata = JSON.stringify(data);
   $.get('chat_elab.php',
          {data : JSONdata},
          function(data){
            decodedData = JSON.parse(data);
            if(decodedData.code == "success")
               if(decodedData.messages.length > 0){
                  displayMessages(decodedData.messages);
                  lastTs = decodedData.messages[decodedData.messages.length - 1].ts;
               }
            }
        )
        .fail(function(){
           //TODO: handle errors
           console.log("fail");
        });
}

function sendMessage(){
   if($('#newMessage').val() === '' || $('#newMessage').val() === undefined)
      return;
   var d = new Date();
   var ts = d.getTime();
   data = {action : 'postMessage' , user : userInfo.user , message : $('#newMessage').val(), ts : ts};
   var JSONdata = JSON.stringify(data);
    $.post('chat_elab.php',
          {data : JSONdata},
          function(data){
            decodedData = JSON.parse(data);
            if(decodedData.code == 'failed'){
               //TODO: handle fail
            }
            else{
               $('#newMessage').val('');
            }
        })
        .fail(function(){
            accessRoomError('Error: cannot get into the room');
        });
}

function displayMessages(messages){
   messages.forEach(function(el){
      if(el.user_name == userInfo.user)
         $('#messages').append("<div class='myMessage'>" + el.message + "</div>");
      else
         $('#messages').append("<div class='message'>" + el.user_name + " : " + el.message + "</div>");
   });
}

function signup(){
   signupError('');
   if($('#signupUser').val() === '' || $('#signupUser').val() === undefined){
      signupError('Insert a user name');
      return;
   }
   if($('#signupPassword').val() === '' || $('#signupPassword').val() === undefined){
      signupError('Insert a password');
      return;
   }
   if($('#signupPassword').val().length < 6){
      signupError('Password must have at least 6 char');
      return;
   }
   
   data = {action : 'signup', user : $('#signupUser').val(), password : $('#signupPassword').val(), firstName : $('#signupFirstName').val(), lastName : $('#signupLastName').val()};
   JSONdata = JSON.stringify(data);
   $.post('chat_elab.php',
          {data : JSONdata},
          function(data){
            decodedData = JSON.parse(data);
            if(decodedData.code == 'success'){
               signupError('Success');
                 
            }
            else{
              signupError(decodedData.error);
            }
            
        })
        .fail(function(){
            accessRoomError('Error: cannot get into the room');
        });
        
}

