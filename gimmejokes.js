/*********
 *
 *
 *  Gimme Jokes, a simple Slack joking bot v0.22
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
var fs = require('fs');

// Configurable variables
// By default the bot listens to "@gimme joke" messages
// If you deploy it on an SSL HTTPS service it would listen to the "/gimme joke" command instead
// Here you configure the default mode
// To configure SSL mode you should leave token and channel to null and instead set the
// following environment variables:
// SLACK_CLIENT_ID
// SLACK_CLIENT_SECRET
var localBotSettings = {
    // Your Slack token goes here
    token: null,
    //Your channel name goes here
    channel: null,
    //Your bot name goes here - only used in the local mode
    name: "gimme",
    //Your bot command goes here - only used when bot is deployed, to avoid additional oAuth reqeusts
    command: "/gimme",
    version: "0.22"
};

// Global bot settings
// Those are taken from Heroku, environment or user
// To deploy this bot on a 3rd party server you need to set the following environment variables:
var settings = {
    // Slack API bot token - you can replace it with your token
    token: process.env.SLACK_CLIENT_ID || localBotSettings.token,//Your bot token goes here
    secret: process.env.SLACK_CLIENT_SECRET,
    // Slack channel name - bot will listen and post on this channel only,
    channel: process.env.SLACK_CHANNEL_NAME || localBotSettings.channel,//Your channel name goes here
    // Name of the bot, set it to something like process.env.SLACK_BOT_NAME to make it confugarable
    name: localBotSettings.name,
    // Global scope app information. Will be used if run on Heroku or just as a standalone app
    app: {
        // This one doesn't affect Heroku and can be skipped
        commandPort: process.env.SLACK_COMMAND_PORT,
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



// Command mode! To use this mode you need to deploy this boy on an SSL-enabled hosting
var app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', function (req, res)
{
    res.send("Gimme Jokes PRIVACY POLICY:<br>\
    <br>\
    Gimme Jokes doesn't collect or store any personal data, or data or commands you sent, it doesn't store cookies. Gimme Jokes uses secure HTTPS protocol to recieve the commands you sent to it and only to retrieve Reddit posts. You can obtain and examine full source of the software at:<br>\
    https://github.com/anastasiuspernat/gimmejokes\
    ");

});

// oAuth
app.get('/slack', function(req, res){

    console.log("######## AUTH 1");
    var data = {form: {
        client_id: settings.token,
        client_secret: settings.secret,
        code: req.query.code
    }};
    request.post('https://slack.com/api/oauth.access', data, function (error, response, body) {
        console.log("######## AUTH 2");
        if (!error && response.statusCode == 200) {
            // You are done.
            // If you want to get team info, you need to get the token here
            var token = JSON.parse(body).access_token; // Auth token
            console.log("######## AUTH OK");
        }
    });
});

/* Optional: SSL Let's Encrypt CERTIFICATION */
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

    // /gimme version
    if (command == "version")
    {
        sayToPublic(settings.copyright);
    }
    else
    // /gimme joke
    if (command.indexOf("joke") >= 0)
    {
        // Then filter all "hot" posts from /r/jokes
        reddit.r('jokes').hot().exe(function(err, data, resInner){
            // Get all recent hot posts
            var posts = data.data.children;
            // Pick a random one
            var post = posts[Math.round(Math.random()*(posts.length-1))].data;
            // Build a message
            var jokeText = "*"+post.title+"* "+post.selftext;

            sayToPublic(jokeText);
        });
    } else
    // /gimme money
    if (command == "money")
    {
        sayToPublic("Yes! Gimme money");
    }
    // /gimme something
    else
    {
        sayToPublic("Please talk to me! Say something like */gimme jokes* or */gimme version* or */gimme money*!");
    }

});

var port = process.env.PORT || settings.app.commandPort;

app.listen(port, function(err) {

    console.log("Gimme Jokes is listening at "+port+"!");

});


