//Parámetros a modificar
var url = 'https://gateway.watsonplatform.net/conversation/api'; //NO SE CAMBIA

var wcUser = 'watsonConversationUser'; //Usuario de Watson Conversation
var wcPassword = 'watsonConversationPassword'; //Password de Watson conversation
var versionDate = '2017-05-26'; // NO SE CAMBIA
var conversationWorkspace = 'conversationWorkspaceId'; //Este es el ID del workspace
var speechUser = "speechToTextUser"; //usuario del Speech to Text
var speechPassword = "speechToTextPassword"; //password del speech to text
var token = "placefbTokenHere";

var original_ffmpeg = require ('ffmpeg');
var ffmpeg = require('fluent-ffmpeg');
var express = require('express');
var request = require('request');
var fs  = require("fs");
var audioConverter = require("audio-converter");
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var app = express();
var contexid = "";

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var conversation_id = "";


var conversation = new watson.ConversationV1({
    url: url,
    username: wcUser,
    password: wcPassword,
    version_date: versionDate
  });

const params = {
    workspace_id: conversationWorkspace
  };

  var context; 

var workspace = process.env.WORKSPACE_ID || 'workspaceId';

var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var speech_to_text = new SpeechToTextV1 ({
    username: speechUser,
    password: speechPassword
  });

  var fileId = Date.now();
  var GlobalSenderId;

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === token) {
        res.send(req.query['hub.challenge']);
    }
    res.send('El token está equivocado');
});

app.get('/', function (req, res) {
   
    res.send('Test de codigo hecho por Cristian Florett Vera');
});

function testCambioFormato (track)
{
    var stream  = fs.createWriteStream(__dirname+'\\mensaje.wav');
    //console.log(__dirname+'\\mensaje.wav');
    //console.log("--Iniciando cambio de formato--");
    var track = track;
    ffmpeg(track)
    .toFormat('wav')
    .on('error', function (err) {
        console.log('An error occurred: ' + err.message);
    })
    .on('progress', function (progress) {
        // console.log(JSON.stringify(progress));
        console.log('Processing: ' + progress.targetSize + ' KB converted');
    })
    .on('end', function (file) {
        console.log('Processing finished !');
        console.log(file);
        console.log("--Primer file id--", fileId);
       nextPipe(file);
    })
    //.save('./mensaje'+fileId+'.wav');//path where you want to save your file
    //.output(stream);
    .pipe(stream);

    
    stream.on('finish', function() {
        console.log('all done!');
      });

      stream.on('error', function(err) {
        console.error(err);
      });

  

}

function nextPipe(file)
{
    console.log("--Yo leo el mensaje--");
    var params = {
        model: 'es-ES_NarrowbandModel',
        content_type: 'audio/wav',
        'interim_results': true,
        'max_alternatives': 3,
        'word_confidence': false,
        timestamps: false,
      };
    var recognizeStream = speech_to_text.createRecognizeStream(params);
    console.log("--Segundo file Id--", fileId);
      
    var rstream = fs.createReadStream(__dirname+'\\mensaje.wav');
    var writeStream = fs.createWriteStream(__dirname+'\\transcripcion.txt');
    rstream.pipe(recognizeStream);
    recognizeStream.pipe(writeStream);
    recognizeStream.setEncoding('utf8');
    recognizeStream.on('results', function(event) { onEvent('Results:', event); });
    recognizeStream.on('data', function(event) { onEvent('Data:', event); });
    recognizeStream.on('error', function(event) { onEvent('Error:', event); });
    recognizeStream.on('close', function(event) { onEvent('Close:', event); });
    recognizeStream.on('speaker_labels', function(event) { onEvent('Speaker_Labels:', event); });
    function onEvent(name, event) {
        //console.log("Nombre--", name);
        //console.log("Event--");
        //console.log("name--",name);
        if ((name=='Data:') && (event.length>2))
        {
            console.log(event); 
            //TESTcallWatson(GlobalSenderId, event);
            callConversationAPI(event);
        }
      };
    
    //stream.pipe(rstream);
}

app.post('/webhook', function (req, res) {
    var data = req.body;
  
       // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {
        var pageID = entry.id;
        var timeOfEvent = entry.time;  
        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          if (event.message) {
              console.log("--El evento--", event);
              var sender = event.sender.id;
              GlobalSenderId = sender;
              if (event.message.text)
              {
                  callConversationAPI(event.message.text);
              }
              else if (event.message.attachments)
              {
                var type = event.message.attachments[0].type;
                var sender = event.sender.id;
              if (type == "audio")
              {
                testCambioFormato(event.message.attachments[0].payload.url);
                // sendGenericMessage(sender);
              }
            }
            else
            {
                console.log("--No pasó nada--");
            }
             
            
          } else {
            //console.log("Webhook received unknown event: ", event);
          }
        });
        //console.log(data);
      });  
     
      
      res.sendStatus(200);
    }
);

var GlobalContext = {};

function callConversationAPI(message)
{
   
    conversation.message({
        workspace_id: conversationWorkspace,
        input: {'text': message},
        context: GlobalContext
      },  function(err, response) {
        if (err)
          console.log('error:', err);
        else
        {
        if (response.context)
        {
            console.log("--Encontré context--");
            console.log(response.context);
            GlobalContext = response.context;
        }
        //console.log(GlobalContext);
          var Mensaje = (JSON.stringify(response, null, 2));
          if (response.output.text)
          {
          var Mensaje = response.output.text;
          
          console.log("--Global senderId--", GlobalSenderId);
          var MensajeTotal = "";
          for (var j=0;j<Mensaje.length;j++)
          {
              if (Mensaje[j].length > 0)
              {
                  MensajeTotal = MensajeTotal + Mensaje[j];
                console.log(Mensaje[j]);
               
              }
          };
          var Data = {text : MensajeTotal};
          callSendAPI(GlobalSenderId, Data);
        }
        }
      });
}



//TO-DO
//REVISAR SI GUARDAR O BORRAR
function TESTcallWatson(payload, sender)
{
    conversation.message(payload, function (err, convResults) {
        console.log(convResults);
       contexid = convResults.context;
       
       if (err) {
           return responseToRequest.send("Erro.");
       }
       
       if(convResults.context != null)
          conversation_id = convResults.context.conversation_id;
       if(convResults != null && convResults.output != null){
           var i = 0;
           if (convResults.output.text)
           {
           while(i < convResults.output.text.length){
               sendMessage(sender, convResults.output.text[i++]);
           }
           }
           else if (convResults.output.attachments)
           {
               while(i < convResults.output.attachments){
               sendMessageAttached(sender, convResults.output.attachments[i++]);
           }
           }
       }
           
   });

}

function callWatson(payload, sender) {
	w_conversation.message(payload, function (err, convResults) {
		 console.log(convResults);
		contexid = convResults.context;
        if (err) { return responseToRequest.send("Erro."); }
		
		if(convResults.context != null)
    	   conversation_id = convResults.context.conversation_id;
        if(convResults != null && convResults.output != null){
			var i = 0;
			if (convResults.output.text)
			{
			while(i < convResults.output.text.length){
				sendMessage(sender, convResults.output.text[i++]);
			}
			}
			else if (convResults.output.attachments)
			{
				while(i < convResults.output.attachments){
				sendMessageAttached(sender, convResults.output.attachments[i++]);
			}
			}
		}
            
    });
}


function callSendAPI(sender, messageData) {
   
    request({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: token },
      method: 'POST',
      json: {
        recipient: { id: sender },
        message: messageData,
    }  
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var recipientId = body.recipient_id;
        var messageId = body.message_id;
  
        //console.log("Successfully sent generic message with id %s to recipient %s", 
        //  messageId, recipientId);
      } else {
        console.error("Unable to send message.");
        console.error(response);
        console.error(error);
      }
    });  
  }

function sendGenericMessage(sender)
{
    var messageData = {
        recipient: {
          id: sender
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: [{
                title: "rift",
                subtitle: "Next-generation virtual reality",
                item_url: "https://www.oculus.com/en-us/rift/",               
                image_url: "http://messengerdemo.parseapp.com/img/rift.png",
                buttons: [{
                  type: "web_url",
                  url: "https://www.oculus.com/en-us/rift/",
                  title: "Open Web URL"
                }, {
                  type: "postback",
                  title: "Call Postback",
                  payload: "Payload for first bubble",
                }],
              }, {
                title: "touch",
                subtitle: "Your Hands, Now in VR",
                item_url: "https://www.oculus.com/en-us/touch/",               
                image_url: "http://messengerdemo.parseapp.com/img/touch.png",
                buttons: [{
                  type: "web_url",
                  url: "https://www.oculus.com/en-us/touch/",
                  title: "Open Web URL"
                }, {
                  type: "postback",
                  title: "Call Postback",
                  payload: "Payload for second bubble",
                }]
              }]
            }
          }
        }
      };  
      
      callSendAPI(data);
}
var host = (process.env.VCAP_APP_HOST || 'localhost');
var port = (process.env.VCAP_APP_PORT || 3000);
app.listen(port, host);


