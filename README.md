# Gimme Jokes

<a href="https://slack.com/oauth/authorize?&client_id=112240882771.147772491696&scope=commands"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>

A Slack joking bot (actually a reddit shameless plagiary)

Filters out NSFW and 18+ jokes!

![](https://github.com/anastasiuspernat/gimmejokes/raw/master/gimmejokes_example3.jpg?raw=true)

Posts a random joke from reddit's /r/cleanjokes (sorted by "hot"). Works from anywhere, requires Internet connection.

**Usage**

* If you installed it using Slack button the syntax is **/gimme jokes**

**Deplyoing on a local server**

You will need:

* A Slack account
* Node.js installed
* npm installed (gets installed by default with Node.js)

Installation:

* Use **npm** to install **slackbots**, **redwrap**, **dotenv**, **express**, **body-parser**, **request**, **node-persist** (**npm install [package-name]**)
* Create a slack bot at https://yourorganization.slack.com/services/new/bot
Call it **gimme**, write down bot's token, invite your bot to the channel
* Open **gimmejoekes.js** and fill out **token** and **channel** in **localBotSettings**

Local usage:

* Run it! (**node gimmejokes.js**)
* Type in **@gimme jokes** in your slack channel
* Enjoy! Ping me back with suggestions!

&copy; 2017-2018 Anastasiy, http://anastasiy.com

Distributed under MIT license.
