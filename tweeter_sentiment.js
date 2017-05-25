'use strict';  //treat silly mistakes as run-time errors

//SENTIMENTS, EMOTIONS, and SAMPLE_TWEETS have already been "imported"

/* Your script goes here */
function tweet_split(tweet)
{
    /**
     * This function takes as input a string and return as output an array which contains the words in the string in lower case having length greater than 1.
     */
    //getting all the words in the string
    var tweet_words=tweet.split(/\W+/);
    //converting all words to lowercase and filtering out words smaller in length than 1 character
    var tweet_words_reduced=tweet_words.filter(function(x){return x.length>1;}).map(function(x){return x.toLowerCase();});
    return tweet_words_reduced;
}


function word_emotion(word_array,emotion)
{
    /**
     * This function takes as input a array of words and an emotion and returns as output a array of words which have that emotion.
     */
    var emotion_array=[];
    //for each word in the array of words, check the sentiments object for emotions corresponding to each word
    //If the given emotion is in the array of emotions for the word, add the word to the array of words to be returned
    if(word_array!=undefined)
    {
    for(var i=0;i<word_array.length;i++)
    {
        if(SENTIMENTS[word_array[i]]!=undefined)
        {
            if(SENTIMENTS[word_array[i]][emotion]!=undefined)
            {
                emotion_array.push(word_array[i]);
            }
        }
    }
    }
    return emotion_array;
}


function word_emotion_map(word_array)
{
    /**
     * This function takes as input an array of words and returns an object which maps each emotion to a list of words in the word array which contain that emotion.
     */
    var emotion_dict={};
    //iterate through the EMOTIONS array and for each emotion, use the word_emotion function defined to determine which words have the specified emotion. 
    for(var i=0;i<EMOTIONS.length;i++)
    {
        if(word_emotion(word_array,EMOTIONS[i]).length!=0)
        {
        emotion_dict[EMOTIONS[i]]=word_emotion(word_array,EMOTIONS[i]);
        }
    }
    return emotion_dict;
}


function most_common(word_array)
{
    /**
     *This function takes as input an array of words and returns an array sorted in the order of the most common words in the input array
     */
    //create an object whic counts the frequency of each word in input array
 var wordsMap={};
  word_array.forEach(function (key) {
    if (wordsMap[key]!=undefined) {
      wordsMap[key]++;
    } else {
      wordsMap[key] = 1;
    }
  });
  //select the keys of the wordsMap object and sort them in descending order using the values corresponding to the keys
  var sorted_words=Object.keys(wordsMap);
  sorted_words.sort(function(x,y){return wordsMap[y]-wordsMap[x];});
  return sorted_words;
}


function analyzeTweets(tweets_list)
{
    /**
     * This function takes as input an array of tweets and returns as output an array of objects with the following information for each emotion- 
     * The percentage of words across all tweets that have that emotion, The most common words across all tweets that have that emotion, and The most common hashtags across all tweets associated with that emotion
     */
    //add the array of words in the tweet and the object which maps each emotion to words having that emotion, to the tweets_list object
    tweets_list.forEach(function(x){x['words']=tweet_split(x['text']);});
    tweets_list.forEach(function(x){x['emo_words']=word_emotion_map(x['words']);});
    var tweetstats=[];
    //create a object in the tweet_stats array for each emotion which stores percent words, common example words, and common hashtags
    for(var i=0;i<EMOTIONS.length;i++)
    {
        //compute the percent of words which have a certain emotion 
        var emo_word_count=tweets_list.map(function(x){if(x['emo_words'][EMOTIONS[i]]!=undefined){return x['emo_words'][EMOTIONS[i]].length;}else{return 0;}});
        var word_count=tweets_list.map(function(x){return x['words'].length;});
        var percent_words= (emo_word_count.reduce(function(x,y){return x+y;}) / word_count.reduce(function(x,y){return x+y;}))*100; 
     
        //find the most common words which have the emotion   
        var example_words=tweets_list.map(function(x){return word_emotion(x['words'],EMOTIONS[i]) ; });
        var tweet_example_words=most_common(example_words.reduce(function(x,y){return x.concat(y);}));

        //find the most common hashtags across tweets associated with the emotion
        var abc=tweets_list.map(function(x){return x.entities.hashtags;});
        var hash=[]
        for(var a=0;a<abc.length;a++)
            {
                if(word_emotion(tweet_split(tweets_list[a]['text']),EMOTIONS[i]).length>0)
                {
                    for(var b=0;b<abc[a].length;b++)
                    {
                        hash.push(abc[a][b]['text']);
                    }
                }
            }
            hash=most_common(hash);
        
        //append the created object to the tweetstats list to be returned
        tweetstats.push({'EMOTION':EMOTIONS[i],'% of WORDS':percent_words,'EXAMPLE WORDS':tweet_example_words,'HASHTAGS':hash});
    }
return tweetstats;
}


function showEmotionData(tweetstats)
{
    /**
     * This function takes as input the array of objects corresponding to the tweets analyzed and prints it in a tabular format
     */
    //select the table body using its id and empty its contents
    var table_var=d3.select('#emotionsTable');
    table_var.html('');
    //iterate through the array of objects to print out each individual emotion row
    for(var i=0;i<tweetstats.length;i++)
    {
        //add a new row to the table and populate it with data corresponding to the current emotion
        var row_var=table_var.append('tr');
        row_var.html('<td>'+tweetstats[i]['EMOTION']+'</td><td>'+tweetstats[i]['% of WORDS'].toFixed(2)+'%</td><td>'+tweetstats[i]['EXAMPLE WORDS'].slice(0,3).map(function(x){return ' '+x;})+'</td><td>'+tweetstats[i]['HASHTAGS'].slice(0,3).map(function(x){return '#'+x+' ';})+'</td>')
    }
}

function loadTweets(username)
{
    /**
     * this function takes as input the twitter user name and calls the functions to analyze and display the results of the tweet analysis
     */
    //append the screen name and tweet count parameters to the uri
    var uri='https://faculty.washington.edu/joelross/proxy/twitter/timeline/'+'?screen_name='+username+'&count=300';   
    //send an AJAX request to the API, analyze and display the results of the analysis after getting the response JSON data 
    d3.json(uri,function(x){showEmotionData(analyzeTweets(x));});
    
}

//create an anonymous function formread which reads the username from the form input and does a sentiment analysis and displays the result for the specified user.
var formread=function()
{
//read the username from the text input field
 var twitter_username=d3.select('#searchBox').property('value');
 //analyze sample or live tweets depending on user input.
 if(twitter_username=='SAMPLE_TWEETS')
 {
    showEmotionData(analyzeTweets(SAMPLE_TWEETS));
 }
 else
 {
     loadTweets(twitter_username);
 }

}
showEmotionData(analyzeTweets(SAMPLE_TWEETS));
//event on button which captures user clicks and calls the formread callback function to read user name from form input
d3.select('#searchButton').on('click',formread);
console.log(JSON.stringify(analyzeTweets(SAMPLE_TWEETS)));
