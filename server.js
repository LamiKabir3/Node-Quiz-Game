'use strict';
/*
Who is the Smarter Programmer
WEB405 Project 3
Author: Lami Kabir
Date: April 13, 2017
*/
dfgdfgdfgdf
let app = require('express')(); //you actually storing this express(). it's useless to store express with out calling it
let express = require('express'); //you don't need this line cause you have the one above
let http = require('http').createServer(app);//The only reason you need this line is because you are going to use socket.io. 
let io = require('socket.io')(http); //this is how you create socket.io. You need to connect to a server it's the whole purpose. Read above comment
let players = []; //all the players profile is store here. This is an array of objects.
let db; //we will store the database later on and we need this as a global variable
const MongoClient = require('mongodb').MongoClient; //create the MongoClient
const url = 'mongodb://localhost:27017/QuizHighScore'; //the url to connect to the Mongodb. (see code below)
const bodyParser = require('body-parser'); //If you use this you dont have to json.parse anymore when sending messages from client to server
//I didn't even use body-parser. I don't even know why I have this. Need to do some research and see why I included it.


//setting up and declaring what we will use
app.use(express.static('public'));

    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(bodyParser.json());

    app.set('view engine', 'ejs'); //if you are going to use ejs you have to declare this

    app.get("/instructions.html", function(req, res){ //this is a route
       res.sendFile(__dirname + '/views/instructions.html'); 
    });


    //I jUST REALIZED YOU JUST NEED TO START THE SERVER AND THEN TYPE LOCALHOST:3000 AND THE WEBSITE WILL OPEN
    //LOOK AT THE ROUTE BELOW TO UNDERSTAND AND REALIZE IT.
    app.get('/', function(req, res) { //this is another route and it is directing to the index.ejs page
      //collection means table in mongodb and mongodb using BSON very similar structure to JSON
         db.collection('scores').find().toArray((err, result) => { //finds the results and puts it in the result array just how it works
        if (err) {
          return console.log(err);
        }
        //You created a variable called players with the result array
        //this will be using in the index.ejs view. remember we are using ejs as a template engine.
        res.render('index.ejs', { players: result }); 

     // players = result; //this will get all the players from the database. This is needed later on to check if the user didn't enter a username that is already in use.
      });
    });
  


    MongoClient.connect(url, (err, database) => { //connecting to mongodb using that url. Need to check if we have to create that url or not. $
      if (err) {
        console.log(err);
        process.exit();
      }
      db = database; //the database we will be using. later one we will inserting/finding data. this variable is a global variable.
    });

    app.put('/scores', (req, res) => { //this route will be triggers when someone finished their quiz. this is triggered somewhere will find it an comment it later
   
          db.collection('scores').findOneAndUpdate({ name: req.body.name }, { //find the name of the player to update their rank
            $set: { //$set is what you use to post/update a document(aka data in mongodb)
              name: req.body.name, //name is the field name and body.name is the property name of the body message json file from client
              score: req.body.score,
              rank: req.body.rank
            }
          }, { //this is the second argument for the findOneAndUpdate() method
            sort: { _id: -1 }, //I remember this is like decending order
            upsert: true //if nothing matches the filter insert this update as a new data
          }, (err, result) => { //The last argument for the findOneAndUpdate() method
            if (err) { //You know what this means
              return res.send(err);
            }
            //result is all the data. it was passed by the parameter of the lambda expression look above 3 lines from here
            //we will use result to display it in the index.ejs. remember we are using the ejs template engine.
            res.send(result); 
          });

    }); //closed the router




//once you connect this event is triggered. this is where all the functionality of your website is at.
io.on('connection', function(socket){
    
    //console.log(players[1].name);
    //socket.emit("list of players", players);
    
    //READ THESE 3 LINES OF COMMENT!!!!
    //The way socket works is there are two key methods for socket. .on and .emit. This can be used on both
    //the client and server side. So, .on is triggered when the opposing file has an emit with the same name of the .on argument.
    //so example .on('creatingProfile', function) will be triggered when .emit('creatingProfile) on the opposing file. so client.js or vice versa.

    socket.on('creatingProfile', function(userName){ //this will be emitted as soon as some one connects this will emit on the client side.
        
        let player = {}; //creating the profile for the player. It's created as an object
        player.name = userName; //we got this through the parameter of this function and it was passed by the emit event on the client side
        player.id = players.length; //determines what the id would be for this player
        player.score = 0; //starts from 0 make sure you define it as a number or you will get undefined error
        
        //since we have to make a multiplayer game im going to use this so the player knows how many players he is better than.
        //this game is not a 1 on 1 game. its a game where you go against every one that is connected to the server.
        player.rank = 0;
       
        players.push(player); //push it into the playerS array. Its a global array I declared at the very top of the page.
        
        socket.emit("retrieve your profile", player); //it's triggering the retrieve your profile event on the client side.
        
    });
    
    //this event is triggered when you submit the form
    socket.on('marking', function(q1, q2, q3, q4, q5, playerId){ //the parameters has to be in the right order of the questions or you will mark them incorrectly
        
        let evaluationPackage = {}; 
        evaluationPackage.id = playerId; //used to let the server know whos score this is
        evaluationPackage.score = 0;
        
       if(q1 === "true"){
          evaluationPackage.score++;
          console.log('you got question 1 correct');
       } 
        if(q2 === "true"){
          evaluationPackage.score++;
          console.log('you got question 2 correct');
        }
        
        if(q3 === "yes"){
          evaluationPackage.score++;
          console.log('you got question 3 correct');
        }
        
        if(q4 === "true"){
          evaluationPackage.score++;
          console.log('you got question 4 correct');
        }
        
        if(q5 === "yes"){
          evaluationPackage.score++;
          console.log('you got question 5 correct');
        }
        
        recordingScore(evaluationPackage);
    }); 
    
    //my local functions
function recordingScore(evaluationPackage){
    
    console.log('recorded the score for the server complete.');
    
        /*its always empty every time the event is emitted that way before recording the player score
        you will know whos score you are recording. look at the below code to understand how we know which player
        score we are recording*/
        let player = {}; 
        
        //SUCH BAD EXPLAINING. 2018 ME READING THIS WTF lol but i still understand it though lol
        /*will show which player object we are working with from the players array
        evaluationPackage is the object that was passed from the client. it had a property called id.
        and that id was created depending on the length of the players array.
        look at the event on top of this one called creatingProfile. Now look at player.id = players.length
        after looking at that it should make more sense*/
        player = players[evaluationPackage.id]; 
        
        /*the score will permantly stay because its in a global array. Holding this object.
        if you didnt know any global variable never changes and both players have access to it.
        it's just how node.js is
        also each player has there very own server script if you didnt know*/
        player.score = evaluationPackage.score; 
        
      
        whoWon(); 
        
       
}

//I just realized how big this function is. There are even socket events inside this function.
function whoWon(){
        //The winners array will be empty every time this function runs. That way we don't have winners from the previous round.
        let winners = []; //if its a tie i will push the winners into this array and announce all of there name. This is an array of objects.
       
        //evaluating who is the best from every player that is connected to this server. This game is not a 1 on 1 game.
        //The server will announce who is the best from what ever the amount of players is connected to this server.
        //the first for loop is for the first digit and the second for loop is the second digit. It checks every combination. Look at it and you will understand it
        for(let digitOne = 0; digitOne < players.length; digitOne++){
            for(let digitTwo = 0; digitTwo < players.length; digitTwo++){
                if(players[digitOne].score >= players[digitTwo].score){
                    players[digitOne].rank++;
                    console.log("increased rank.");
                }
            }
        }
        
    
        socket.emit("record data to database", players);
    
    
        //THE BLOCK OF CODE BELOW IS USED TO CHECK WHO ARE THE WINNERS BY LOOPING AND PUSHING IT INTO THE WINNERS ARRAY. LOOK AT IT AND YOU WILL UNDERSTAND IT BETTER.
        
        //Checks whos rank number is equal to players.length. If they do it means they are better then every one that is conencted.
        //They are the winners and there name will be announce. I made a winners array just in case if there is a tie. Then
        //i will announce all of there names.
       for(let i = 0; i < players.length; i++){
           //the reason i have minus 1 is because .length does not include 0 as the first value of the array. 
           //so as programmers we will think there are 3 values in the array including 0. 
           //But for .length it will be 4 values.
           if(players[i].rank > players.length - 1){ 
                winners.push(players[i]);
                console.log(players[i].name);
            }
        }
    
        
        
        socket.emit('winnerIs', winners, players.length - 1); //I put players.length - 1 because I dont want them to be included when i announce how many players they are better than.
        
        //reset each players rank property to 0. That way we don't have unneccessary winners who didn't actually win against other players.
        //what i mean by that is we don't want there rank from the previous round still existing. 
        //If it does exist then they will be announced as a winner in the next round if you click submit again
        //because they got a head start with extra points from the previous round.
        for(let i = 0; i < players.length; i++){
            players[i].rank = 0;
        }
    
}
    
});



//http.listen is the same thing as app.listen (app is express btw)
http.listen(3000, function() {
  console.log('listening on *:3000');
});
