/*********
 *
 *
 *  Gimme Jokes, a slack joking bot
 *  (actually a reddit shameless plagiary).
 *
 *  Posts a random joke from reddit's /r/jokes (sorted by "hot")
 *  Installation:
 *  1) Use npm to install slackbots and redwrap
 *  2) Create a slackbot bot at https://yourorganization.slack.com/services/new/bot
 *     Call it "gimme", write down bot's token, invite your bot to the channel
 *  3) Fill out token and channel name in settings below
 *  4) Run it! ("node gimmejokes.js")
 *  5) Type in "@gimme jokes" in your slack channel
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

// bot settings
var settings = {
    token: process.env.SLACK_TOKEN,//"YOUR-TOKEN-GOES-HERE",
    // Slack API bot token - you can replace it with your token,
    // set it to something like process.env.SLACK_TOKEN to make it confugarable
    channel: process.env.SLACK_CHANNEL_NAME,//"YOUR CHANNEL NAME",
    // Slack channel name - bot will listen and post on this channel only,
    // set it to something like process.env.SLACK_CHANNEL_NAME to make it confugarable
    name: process.env.SLACK_BOT_NAME
    // Name of the bot, set it to something like process.env.SLACK_BOT_NAME to make it confugarable
};


// Instantiate a slackbot
var gimme = new Bot(settings);



// Initialize and show welcome message
gimme.on('start', function() {
    gimme.user = gimme.users.filter(function (user) {
        console.log("## USER ???",user.name," != ",settings.name);
        return user.name === settings.name;
    })[0];
    gimme.postMessageToChannel(
        settings.channel,
        'Hi there, I\'m a talky robot. Talk to me, I\'m so lonely...I can joke! Ask me to *joke*',
        {as_user: true});
});

// Channel messages parser
gimme.on('message', function(message,test) {
    console.log("#### MESSAGE",message.user,message);
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



