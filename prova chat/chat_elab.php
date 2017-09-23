<?php
    session_start();
	if ($_SERVER['REQUEST_METHOD'] == 'POST'){
        if(!isset($_POST['data'])){
            header('Location : login.html');
            die('data not found in POST request');
        }
		$obj = json_decode($_POST['data']);
			if($obj->action == 'createRoom')
				createRoom($obj->roomName, $obj->user);
			if($obj->action == 'joinRoom')
				joinRoom($obj->room_id);
			if($obj->action == 'postMessage')
				postMessage($obj);	//obj = {action : 'postMessage' , user : userInfo.user , message : $('#newMessage').val(), ts : ts};
			if($obj->action == 'signup')
				signup($obj);	//obj = {action, user, password, firstName, lastName};
    }
    else if($_SERVER['REQUEST_METHOD'] == 'GET'){
        if(!isset($_GET['data'])){
            header('Location : login.html');
            die('data not found in GET request');
        }
        $obj = json_decode($_GET['data']);
			if($obj->action == 'login')
				login($obj);
            else if($obj->action == 'verify')
				verify();
            else if($obj->action == 'logout')
				logout();
			else if($obj->action == 'anagraphics')
				getAnagraphics($obj->user);
			else if($obj->action == 'getRoomList')
				getRoomList();
			else if($obj->action == 'getMyRoom')
				getMyRoom();
			 else if($obj->action == 'verifyChat')
				verifyChat();
			else if($obj->action == 'getMessages')
				getMessages($obj->last);
			else if($obj->action == 'deleteMyRoom')
				deleteMyRoom();
        
    }
    else{
        header('Location : login.html');
        die('invalid request method');
    }
?>
<?php
    function login($data){
        $user = $data->user;
        $pass = $data->password;
        $conn = mysqli_connect("localhost","root","","my_ostinellidario");
        $sql = "SELECT * FROM chat_users WHERE user_name='".$user."'";
       
       if($conn->connect_error)
            die('Not able to connect to DB');
        $result = $conn->query($sql);
        if($result->num_rows <= 0) //no user found
            die('{"code":"failed","error":"user not found"}');
        $obj = $result->fetch_object();
        if($obj->password != $pass)
             die('{"code":"failed","error":"wrong password"}');
        else{
            $_SESSION['user'] = $user;
             echo '{"code":"success"}';
        }
		mysqli_close($conn);
    }
    
	function verify(){
        if(isset($_SESSION['user']))
			echo '{"code":"success","user":"'.$_SESSION['user'].'"}';
		else
			echo '{"code":"failed"}';
			
    }
	function logout(){
        session_unset();
        session_destroy();
        if(!isset($_SESSION['user']))
            echo '{"code":"success"}';
        else
            echo '{"code":"failed"}';
    }
	function getAnagraphics($user){
		$conn = mysqli_connect("localhost","root","","my_ostinellidario");
		$sql = "SELECT * FROM chat_users WHERE user_name='".$user."'";
		 if($conn->connect_error)
            die('{"code":"failed","error":"Not able to connect to DB"}');
        $result = $conn->query($sql);
        if($result->num_rows <= 0) 
            die('{"code":"failed","error":"user not found"}');
        $obj = $result->fetch_object();
       unset($obj->password);
	   $obj->code = "success";
	   echo json_encode($obj);
	   mysqli_close($conn);
	}
	function createRoom($roomName, $user){
		$conn = mysqli_connect("localhost","root","","my_ostinellidario");
		$sql = "INSERT INTO `chat_rooms` (`room_name`, `user_name`) VALUES ('$roomName', '$user')";
		if($conn->connect_error)
            die('{"code":"failed","error":"Not able to connect to DB"}');
	
		if ($conn->query($sql) === TRUE) {
			echo '{"code":"success"}';
		}
		else {
			if(strpos($conn->error, "Duplicate entry") >= 0){
				 echo '{"code":"failed","error":"You have already created a room"}';
			}
			else{
				 echo '{"code":"failed","error":"'.$conn->error.'"}';
			}
		}
		mysqli_close($conn);
	}
	
	function getRoomList()
	{
		$list = array();
		
		$conn = mysqli_connect("localhost","root","","my_ostinellidario");
		$sql = "SELECT * FROM `chat_rooms`";
		if($conn->connect_error)
            die('{"code":"failed","error":"Not able to connect to DB"}');
		$result = $conn->query($sql);
        if($result->num_rows <= 0) 
            die('{"code":"failed","error":"no room found"}');
        while($obj = $result->fetch_object()){
			array_push($list, $obj);
		}
		$res->code = "success";
		$res->list = $list;
		echo json_encode($res);
		mysqli_close($conn);
	}
	function getMyRoom(){
		$conn = mysqli_connect("localhost","root","","my_ostinellidario");
		$sql = "SELECT * FROM `chat_rooms` WHERE user_name='".$_SESSION['user']."'";
		if($conn->connect_error)
            die('{"code":"failed","error":"Not able to connect to DB"}');
		$result = $conn->query($sql);
        if($result->num_rows <= 0) 
            die('{"code":"failed","error":"no room found"}');
        $obj = $result->fetch_object();
		$res->code = "success";
		$res->data = $obj;
		echo json_encode($res);
		mysqli_close($conn);
	}
	function joinRoom($id){
		$_SESSION['joinedRoomId'] = $id;
		echo '{"code":"success"}';
	}
	function verifyChat(){
		if(!isset($_SESSION['user']))
			die ('{"code":"failed","error":"noUser"}');
		if(!isset($_SESSION['joinedRoomId']))
			die ('{"code":"failed","error":"noRoom"}');
			
		$conn = mysqli_connect("localhost","root","","my_ostinellidario");
		$sql = "SELECT * FROM `chat_rooms` WHERE room_id='".$_SESSION['joinedRoomId']."'";
		if($conn->connect_error)
            die('{"code":"failed","error":"Not able to connect to DB"}');
		$result = $conn->query($sql);
        if($result->num_rows <= 0) 
            die('{"code":"failed","error":"no room found"}');
		$obj = $result->fetch_object();
		$obj->code = "success";
		$obj->user = $_SESSION['user'];
		echo json_encode($obj);
	}
	function getMessages($last){
		if($last == -1){ //select all messages in the room
			$sql = "SELECT * FROM `chat_messages` WHERE room_id='".$_SESSION['joinedRoomId']."'";
		}
		else{ //slect messages with ts > last
			//TODO: comlete
			$sql = "SELECT * FROM `chat_messages` WHERE room_id='".$_SESSION['joinedRoomId']."' AND ts>".$last;
		}
		$messages = array();
		$conn = mysqli_connect("localhost","root","","my_ostinellidario");
		if($conn->connect_error)
            die('{"code":"failed","error":"Not able to connect to DB"}');
		
		$result = $conn->query($sql);
      
       while ($obj = mysqli_fetch_object($result))
		{
		  array_push($messages, $obj);
		}
		$res->code = "success";
		$res->messages = $messages;
		echo json_encode($res);
		mysqli_close($conn);
	}
	function postMessage($obj){
		//$obj = {action : 'postMessage' , user : userInfo.user , message : $('#newMessage').val(), ts : ts};
		$sql = "INSERT INTO `chat_messages` ( `user_name`, `room_id`, `ts`, `message`) VALUES ('".$obj->user."', '".$_SESSION['joinedRoomId']."', '".$obj->ts."', '".$obj->message."')";
		$conn = mysqli_connect("localhost","root","","my_ostinellidario");
		if($conn->connect_error)
            die('{"code":"failed","error":"Not able to connect to DB"}');
		if ($conn->query($sql) === TRUE) {
			echo '{"code":"success"}';
		}
		else{
			die('{"code":"failed","error":"Not able to connect to DB"}');
		}
		mysqli_close($conn);
	}
	
	function signup($obj){	//obj = {action, user, password, firstName, lastName}
		$conn = mysqli_connect("localhost","root","","my_ostinellidario");
		$sql = "INSERT INTO `chat_users`(`user_name`, `password`, `email`, `first_name`, `last_name`) VALUES ('".$obj->user."','".$obj->password."','email@placeholder.com','".$obj->firstName."','".$obj->lastName."')";
		if($conn->connect_error)
            die('{"code":"failed","error":"Not able to connect to DB"}');
	
		if ($conn->query($sql) === TRUE) {
			echo '{"code":"success"}';
		}
		else {
			if(strpos($conn->error, "Duplicate entry") >= 0){
				 echo '{"code":"failed","error":"user already exist"}';
			}
			else{
				 echo '{"code":"failed","error":"'.$conn->error.'"}';
			}
		}
		mysqli_close($conn);
	}
	
	function deleteMyRoom(){
		$conn = mysqli_connect("localhost","root","","my_ostinellidario");
		$myRoomId = getMyRoomId();
		$sqlMessages = "DELETE FROM chat_messages where room_id=".$myRoomId;
		$sqlRoom = "DELETE FROM chat_rooms where room_id=".$myRoomId;
		if($conn->connect_error)
            die('{"code":"failed","error":"Not able to connect to DB"}');
		if($conn->query($sqlRoom) === TRUE && $conn->query($sqlMessages) === TRUE){
			echo '{"code":"success"}';
		}
		else{
			echo '{"code":"failed","error":"Cannot delete room or messages"}';
		}
		mysqli_close($conn);
	}
	function getMyRoomId(){
		$conn = mysqli_connect("localhost","root","","my_ostinellidario");
		$sql = "SELECT * FROM `chat_rooms` WHERE user_name='".$_SESSION['user']."'";
		if($conn->connect_error)
            die('{"code":"failed","error":"Not able to connect to DB"}');
		$result = $conn->query($sql);
        if($result->num_rows <= 0) 
            die('{"code":"failed","error":"no room found"}');
		$obj = $result->fetch_object();
		mysqli_close($conn);
		return $obj->room_id;
	}
?>




