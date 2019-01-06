"use strict";
/*
Who is the Smarter Programmer
WEB405 Project 3
Author: Lami Kabir
Date: April 13, 2017
*/
    let socket = io(); //just want to make sure what does this do again?
    
    //used to store the player id once the retrieve your profile event is emitted
    //this is a global variable so other events can have access to it. That way you can pass the id to the 
    //server from another event if neccessary. That way the server knows which player he is dealing with
    let id; 
    let name = prompt("Please enter a username.");
    
    //this is used to get all the players
    /* socket.on("list of players", function(players){//data holds the players objects from the database
        
        
        //this will happen first when you enter the page
         name = prompt("Enter your username.");
        
        //It will check if the username they entered is not taken
        do{
            let nameChecked = true; //this is used to check if the username is taken or not. This boolean will be used in a function.
            for(let i = 0; i <= players.length;){
                if(name === players[i].name){
                    
                    name = prompt("That username was taken. please enter another username.");
                    nameChecked = false;
                }
            }
        }while(nameChecked == false);

        
       
    }); */

    socket.emit('creatingProfile', name); //then it will create the profile on the server
    

    //once the profile is created from the server it will emit this event and pass the profile data including the player id
    socket.on('retrieve your profile', function(profile){ 
        //the player id will be used when passing the score to the server for marking. 
        //This way the server knows whos score is whos
        id = profile.id; 
        
    });


$('button').on('click', function () { //the only button on the index.ejs page is the submit button. So, you passed all the inputs for it to be marked by the server.
        
        var $input1 = $('#input1');
        var $input2 = $('#input2');
        var $input3 = $('#input3');
        var $input4 = $('#input4');
        var $input5 = $('#input5');

        //emits the socket.on(marking) event on the server side.
        socket.emit('marking', $input1.val(), $input2.val(), $input3.val(), $input4.val(), $input5.val(), id);
        
    });
    
//this whole socket is used to update the records in the database
socket.on("record data to database", function(players){
    //alert("sending data to the database worked.");
    
    for(let i=0; i < players.length;){
        //found a documentation to help you https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
       fetch('scores', { //scores it the name of the collection (table that is what you call it in mongodb. usually its a url)
            method: 'put', //post or put method. Btw put is update
            headers: { 'Content-Type': 'application/json' }, //it always has to be set as that content-type just how it works must declare it too
            body: JSON.stringify({ //you can pass a string or an object using json.stringify. the curly braces is an object with properties
                name: players[i].name,
                score: players[i].score,
                rank: players[i].rank
            })
       })
        .then(res => { // .then is what you call a promise. .then() returns a promise
          if (res.ok) return res.json(); //you use promises mostly when you use the fetch function and .json is a predefine method for the res object that was created as a parameter
          // the .ok property is also a predefine property. it means if everything went ok with no errors.
        });
         
        i++;
    }
    
});
   
    //this event is emitted from the server
    socket.on('winnerIs', function(winners, numOfPlayers){
        alert("The winners are....");
        for(let i = 0; i < winners.length; i++){
            alert(winners[i].name);
        }
        alert("they are better than " + numOfPlayers + " players.");
        
    });
