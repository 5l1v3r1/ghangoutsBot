var Client = require('hangupsjs');
var config = require('./config.js');
var request = require('request');
var Q = require('q');


var creds = function(){
	return {auth: function(){return config.api_token}};
}

var client = new Client();

//client.loglevel('debug');

client.on('chat_message', function(ev){
	var chatID = ev.conversation_id.id;
	var message = '';//[0].text;
	var messageSegments = ev.chat_message.message_content.segment

	for(var i=0; i<messageSegments.length; i++){
		message += messageSegments[i].text
	}
	var words = message.split(" ");

	if((message.toLowerCase().indexOf("is this") > -1) && message != "NO THIS IS PATRICK"){
		client.sendchatmessage(chatID, [[0, 'NO THIS IS PATRICK']]).done()
	}
	if(words[0].toLowerCase() === "!define"){
		request('http://api.urbandictionary.com/v0/define?term=' + words[1], function(err, res, body){
			if(err){return null};
			var def = JSON.parse(body).list[0].definition;
			client.sendchatmessage(chatID, [[0, 'Here\'s the urbandictionary for ' + words[1] + ': ' + def]]).done();
		});
	}
	return console.log(message);
});

console.log(creds)
client.connect(creds).then(function() {
	console.log("online");
	var events = client.syncrecentconversations();
	events.then(function(events){
		console.log(events.conversation_state[0]);
	});
}).done();

var reconnect = function() {
    client.connect(creds).then(function() {
        // we are now connected. a `connected`
        // event was emitted.
    });
};

// whenever it fails, we try again
client.on('connect_failed', function() {
    Q.Promise(function(rs) {
        // backoff for 3 seconds
        setTimeout(rs,3000);
    }).then(reconnect);
});
