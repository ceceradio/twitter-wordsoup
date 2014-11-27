var twitter = require('ntwitter');
var util = require('util');

var twit = new twitter(config.twitter);

var Dictionary = new Array();

Dictionary.push('ton');
Dictionary.push('tonno');
Dictionary.push('no');

var lastProcessed = 0;
function doMentions(doTweet) {
	twit.verifyCredentials(function(data) {
        var params = new Array()
		if (lastProcessed!=0) {
			params["since_id"] = lastProcessed;
		}
		twit.getMentions(params, function(err, data) {
			if (data==null) {
				if (doTweet===true) { doNewTweet(); }
				return;
			}
			for(var i = 0; i < data.length;i++) {
				if (i==0) {
					lastProcessed = data[0].id;
				}
				var text = data[i].text;
				//Replace urls
				if (data[i].entities.urls.length>0) {
					for (var x = 0; x < data[i].entities.urls.length; x++) {
						text = text.replace(data[i].entities.urls[x].url, "");
					}
				}
				var text = text.toLowerCase();
				text = text.replace(config.myName, "");
				
				text = text.replace(/[^\w\s]/g,""); //Replace punctuation type stuff with nothing
				var wordArray = text.split(/[\s]+/); // split by any whitespace
				for (var j = 0; j < wordArray.length; j++) {
					var word = wordArray[j].trim();
					if (word.length>0 && Dictionary.indexOf(word)==-1) {
						Dictionary.push(wordArray[j].trim());
					}
				}
			}
			if (doTweet===true) { doNewTweet(); }
		});
    });
	
}	
	
function doNewTweet() {
	//Get mentions and see if we have any new words!
	
	//Create our tweet
	var str = '';
	while(str.length < 138) {
		var i = Math.floor((Math.random()*Dictionary.length));
		var cap = false;
		if (Dictionary[i].length + 2 + str.length > 138) {
			break;
		}
		if (str!='') {
			var addPeriod = Math.floor((Math.random()*100)+1);
			if (addPeriod>80) {
				str = str + '. ';
				cap= true;
			}
			else {
				str = str + ' ';
			}
		}
		else { 
			cap = true;
		}
		if (cap) {
			str = str + ucwords(Dictionary[i]);
		}		
		else {
			str = str + Dictionary[i];
		}
	}
	str = str + '.';
	console.log(str.length + " " + str);
	twit.verifyCredentials(function(data) {
        console.log(util.inspect(data));
    })
    .updateStatus(str,
        function(data) {
            console.log(util.inspect(data));
        }
    );
}



function ucwords (str) {
  // http://kevin.vanzonneveld.net
  // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // +   improved by: Waldo Malqui Silva
  // +   bugfixed by: Onno Marsman
  // +   improved by: Robin
  // +      input by: James (http://www.james-bell.co.uk/)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // *     example 1: ucwords('kevin van  zonneveld');
  // *     returns 1: 'Kevin Van  Zonneveld'
  // *     example 2: ucwords('HELLO WORLD');
  // *     returns 2: 'HELLO WORLD'
  return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
    return $1.toUpperCase();
  });
}

setInterval(doMentions,4 * 60 * 1000);
setInterval(doNewTweet,2 * 60 * 1000);
doMentions(true);