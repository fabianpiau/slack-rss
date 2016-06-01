var express = require('express');
var router = express.Router();
var rss = require('rss');
var Slack = require('slack-node');

router.get('/:channel_name', function(req, res, next) {
 	apiToken = process.env.SLACK_API_KEY;
  	slack = new Slack(apiToken);

  	slack.api('channels.list', function(err, response) {
  		for(var c=0; c< response.channels.length; c++) {
  			var channel = response.channels[c];

  			if(channel.name == req.params.channel_name) {
  				var feed = new rss({
  					title:"#" + channel.name,
  					description:"The messages that have been posted to the #"+channel.name +" on Slack",
  					ttl: '30',
  				});

  				slack.api('channels.history', {'channel':channel.id,'count':1}, function(err, response){
			  		for(var i = 0; i < response.messages.length; i++) {
			  			if(response.messages[i].subtype != "bot_message") {
							var user = response.messages[i].user;
							var description = response.messages[i].text;
							var time = new Date(response.messages[i].ts * 1000);
							
							slack.api('users.info', {'user':user}, function(err, response){
								var user_name = response.user.profile.real_name;
								var user_email = response.user.profile.email;
								
								feed.item({
									title: user_name + ' - ' + user_email,
									description: description,
									date: time
								});	
								res.send(feed.xml({indent: true}));
							});							
			  			}
  					}
				});
  			}
  		}
  	});
});

module.exports = router;