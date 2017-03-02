/*********
 *
 *
 *  Gimme Jokes, a simple Slack joking bot v0.20
 *  (actually a Reddit shameless plagiary).
 *
 *  Posts a random joke from Reddit's /r/jokes (sorted by "hot")
 *  See full description and instructions at
 *  https://github.com/anastasiuspernat/gimmejokes
 *
 *  (C) 2017 Anastasiy, anastasiy.com
 *  Distributed under MIT license
 *
 *
 *

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

var Bot = require('slackbots');
var reddit = require('redwrap');
const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');

// Configurable variables
var localBotSettings = {
    //Your token goes here
    token: null,
    //Your channel name goes here
    channel: null,
    //Your bot name goes here
    name: "gimme",
    command: "/gimme",
    version: "0.20"
};

// Global bot settings
// Those are taken from Heroku, environment or user
// To deploy this bot on a 3rd party server you need
var settings = {
    // Slack API bot token - you can replace it with your token
    token: process.env.SLACK_CLIENT_ID || localBotSettings.token,//Your bot token gies here
    // Slack channel name - bot will listen and post on this channel only,
    channel: process.env.SLACK_CLIENT_SECRET || localBotSettings.channel,//Your channel name goes here
    // Name of the bot, set it to something like process.env.SLACK_BOT_NAME to make it confugarable
    name: localBotSettings.name,
    // Global scope app information. Will be used if run on Heroku or just as a standalone app
    app: {
        // This one is get from Slack
        commandToken: process.env.SLACK_COMMAND_ID,
        // This one doesn't affect Heroku and can be skipped
        commandPort: process.env.SLACK_COMMAND_PORT
    },
    copyright: 'Gimme Jokes, a Slack joking bot v'+localBotSettings.version+" (C) 2017 Anastasiy, http://anastasiy.com"
};


var gimme;

// Instantiate a slackbot if we have a bot token
if (settings.token)
{
    console.log("Gimme Jokes is talking!");

    gimme = new Bot(settings);

    // Initialize and show welcome message
    gimme.on('start', function() {
        gimme.user = gimme.users.filter(function (user) {
            return user.name === settings.name;
        })[0];
        gimme.postMessageToChannel(
            settings.channel,
            'Hi there, I\'m a talky robot. Talk to me, I\'m so lonely...I can joke! Ask me to *joke*',
            {as_user: true});
    });

    // Channel messages parser
    gimme.on('message', function(message,test) {
        var nametag = "<@"+gimme.user.id+">";
        // Filter only those messages directly addressed to our bot
        // Also filter out messages produced by our bot
        if (message.type == "message" && message.user != gimme.user.id && message.text && message.text.indexOf(nametag) != -1)
        {
            var asktext = message.text;
            // If a message has a "joke" text in it
            if (asktext.toLowerCase().indexOf("joke")>=0)
            {
                // Then filter all "hot" posts from /r/jokes
                reddit.r('jokes').hot().exe(function(err, data, res){
                    // Get all recent hot posts
                    var posts = data.data.children;
                    // Pick a random one
                    var post = posts[Math.round(Math.random()*(posts.length-1))].data;
                    // Build a message
                    var jokeText = "*"+post.title+"* "+post.selftext;
                    // Post a joke!
                    gimme.postMessageToChannel(
                        settings.channel,
                        jokeText,
                        {as_user: true});
                });
            }
        }
    });

}



// --------------------------------------- Work in progress ---------------------------------------
var cheesyCommens =
    [
        "ha ha", "lol", "ho ho ho", "xoxo:)", ":)", ":D", "*laughing*", "smilesmilesmile", "ha ha ha hi hi hoho lol"
    ];

var app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', function (req, res)
{
    res.send(settings.copyright) });

/* SSL Let's Encrypt CERTIFICATION */
const letsEncryptReponse = process.env.CERTBOT_RESPONSE;

// Return the Let's Encrypt certbot response:
app.get('/.well-known/acme-challenge/:content', function(req, res) {
    res.send(letsEncryptReponse);
});

/* END OF SSL Let's Encrypt CERTIFICATION */

// Mind that we use POST for SSL/HTTPS
// And GET for normal access
app.post('/commands'+localBotSettings.command, function(req, res) {

    function sayToPublic(text)
    {
        res.status(200).json({"response_type":"in_channel","text":text});
    }

    var payload = req.body;

    var command = payload.text;

    if (command == "version")
    {
        sayToPublic(settings.copyright);
    }
    else
    if (command.indexOf("joke") >= 0)
    {
        // Then filter all "hot" posts from /r/jokes
        reddit.r('jokes').hot().exe(function(err, data, resInner){
            // Get all recent hot posts
            var posts = data.data.children;
            // Pick a random one
            var post = posts[Math.round(Math.random()*(posts.length-1))].data;
            // Build a message
            var jokeText = "*"+post.title+"* "+post.selftext+" _"+cheesyCommens[Math.round(Math.random()*(cheesyCommens.length-1))]+"_";

            sayToPublic(jokeText);
        });
    }

});

var port = process.env.PORT || settings.app.commandPort;

app.listen(port, function(err) {

    console.log(err);
    console.log("Gimme Jokes is listening at "+port+"!");

});


