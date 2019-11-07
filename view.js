function tweetView() {
    return $(`
    <div id="root">
        <section id="header"> 
            <div>COMP 426 Twitter</div>
            <div>
                <button class="refresh_button button is-small is-rounded is-light is-info">Refresh</button>
                <button class="makeNewPost_button button is-small is-rounded is-light is-info">New Post</button>
            </div>
        </section>

        <section id="main_board">
            <div id="tweet_board">
            <div>
        </section>
    </div>
    `);
}

async function loadTweets() {
    
    const tweets = await axios({
        method: 'get',
        url: 'https://comp426fa19.cs.unc.edu/a09/tweets',
        withCredentials: true,
    });

    for(let i = 0; i < 50; i++) {
        // console.log(tweets.data[i].body);
        let tweet = tweets.data[i];
        $('#tweet_board').append(tweetWidget(tweet));
    }
}

export const tweetWidget = function(tweet){
    
    const tweet_widget = $(`
        <div class="tweet_widget" id="${tweet.id}">
        </div>
    `);

    tweet_widget.append(content_widget(tweet));
    return tweet_widget;
}

export const content_widget = function(tweet) {
    const create_time = new Date(tweet.updatedAt).toLocaleTimeString("en-US") +"   " +new Date(tweet.updatedAt).toLocaleDateString("en-US");
    const interact_widget = $(`
        <div tweetId="${tweet.id}">
            <div class="user_name">${tweet.author}</div>
            <br>
            <div>${tweet.body}</div>
            <br>
            <p class="create_time">${create_time}</p>
        </div>`
    );
    
    if(tweet.isMine) {
        interact_widget.append($(`<button class="delete_button button is-small is-rounded is-light is-info">Delete</button>`));
        interact_widget.append($(`<button class="edit_button button is-small is-rounded is-light is-info">Edit</button>`));
    } else {
        if(tweet.isLiked) {
            interact_widget.append($(`
                <button class="unlike_button button is-small is-rounded is-light is-danger" type="submit">${tweet.likeCount} Likes</button>   
            `));
        } else {
            interact_widget.append($(`
                <button class="like_button button is-small is-rounded is-light is-info" type="submit">${tweet.likeCount} Likes</button>
            `));
        }

        interact_widget.append($(`<button class="retweet_button button is-small is-rounded is-light is-info">${tweet.retweetCount} Retweets</button>`));
    }
    return interact_widget;
}

export const edit_widget = function(tweet) {
    return $(`
        <div class="edit_form">
            <div class="user_name">${tweet.author}</div>
            <br>
            <form>
                <textarea rows="3" cols="50" id="edit_input_body">${tweet.body}</textarea>
                <footer>
                    <button class="button is-small is-rounded is-light is-info" id="edit_submit" tweetId="${tweet.id}" type="submit">Save</button>
                    <button class="button is-small is-rounded is-light is-info" id="cancel">Cancel</button>
                </footer>
            </form>
        </div>
    `);
}

export const post_widget = function() {
    return $(`
        <div class="tweet_widget">
            <div class="post_form">
                <div class="user_name">New Post</div>
                <br>
                <form>
                    <textarea rows="3" cols="50" id="post_body" placeholder="What would you like to post?"></textarea>              
                    <footer>
                            <button class="button is-small is-rounded is-light is-info" id="post_submit" type="submit">Save</button>
                            <button class="button is-small is-rounded is-light is-info" id="cancel">Cancel</button>
                    </footer>
                </form>
            </div>
        </div>
    `);
}

export const retweet_widget = function(id) {

    return $(`
        <div class="reweet_form">
            <form>
                <div class="user_name">Retweet</div>
                <br>
                <textarea rows="3" cols="50" id="retweet_input_body" placeholder="What do you want to say about this tweet?"></textarea>              
                <footer>
                    <button class="button is-small is-rounded is-light is-info" id="retweet_submit" tweetId="${id}" type="submit">Save</button>
                    <button class="button is-small is-rounded is-light is-info" id="cancel">Cancel</button>
                </footer>
            </form>
        </div>
    `);
}

export const handleLikeButtonPress = async function(event) {
    event.preventDefault();
    const id = event.target.parentNode.getAttribute('tweetId');

    const result1 =  await axios({
        method: 'put',
        url: 'https://comp426fa19.cs.unc.edu/a09/tweets/'+id+'/like',
        withCredentials: true,
    });

    reloadTweets();
}

export const handleUnlikeButtonPress = async function(event) {
    event.preventDefault();
    const id = event.target.parentNode.getAttribute('tweetId');

    const result =  await axios({
        method: 'put',
        url: 'https://comp426fa19.cs.unc.edu/a09/tweets/'+id+'/unlike',
        withCredentials: true,
    });

    reloadTweets();
}

export const handleRetweetButtonPress = async function(event) {
    event.preventDefault();
    const id = event.target.parentNode.getAttribute('tweetId');
    const tweet_widget = $('#'+ id);
    tweet_widget.empty();

    tweet_widget.append(retweet_widget(id));
}

export const handleEditButtonPress = async function(event) {
    event.preventDefault();
    const id = event.target.parentNode.getAttribute('tweetId');
    const tweet_widget = $('#'+ id);
    tweet_widget.empty();

    const tweet = await axios({
        method: 'get',
        url: 'https://comp426fa19.cs.unc.edu/a09/tweets/'+id,
        withCredentials: true,
    });

    tweet_widget.append(edit_widget(tweet.data));
}

export const handleEditSubmitButtonPress = async function(event) {
    event.preventDefault();
    const id = event.target.getAttribute('tweetId');
    const update_body = $('#edit_input_body').val();

    const update = await axios({
        method: 'put',
        url: 'https://comp426fa19.cs.unc.edu/a09/tweets/'+id,
        withCredentials: true,
        data: {
            "body": ""+update_body,
        },
    });

    reloadTweets();
}

export const handleRetweetSubmitButtonPress = async function(event) {
    event.preventDefault();
    const id = event.target.getAttribute('tweetId');
    const update_body = $('#retweet_input_body').val();

    const update = await axios({
        method: 'post',
        url: 'https://comp426fa19.cs.unc.edu/a09/tweets',
        withCredentials: true,
        data: {
            "type": "retweet",
            "parent": ""+id,
            "body": ""+update_body,
        },
    });

    reloadTweets();
}

export const handleDeleteButtonPress = async function(event) {
    event.preventDefault();
    const id = event.target.parentNode.getAttribute('tweetId');

    const delete_post = await axios({
        method: 'delete',
        url: 'https://comp426fa19.cs.unc.edu/a09/tweets/'+id,
        withCredentials: true,
    });

    reloadTweets();
}

export const handleNewPostButtonPress = function(event) {
    event.preventDefault();
    const tweet_board = $('#tweet_board');
    tweet_board.empty();
    tweet_board.append(post_widget());
}

export const handlePostSubmitButtonPress = async function(event) {
    event.preventDefault();
    const body = $('#post_body').val();
    
    const result = await axios({
        method: 'post',
        url: 'https://comp426fa19.cs.unc.edu/a09/tweets',
        withCredentials: true,
        data: {
            body: ""+body,
        }
    });

    reloadTweets();
}

export const handleRefreshButtonPress = function(event) {
    event.preventDefault();
    reloadTweets();
}

function reloadTweets(){
    let tweet_board = $('#tweet_board');

    tweet_board.empty();
    loadTweets();
}

function initializePage(){
    let body = $('body');

    body.empty();
    body.append(tweetView());

    loadTweets();
    
    body.on('click', '.like_button', handleLikeButtonPress);
    body.on('click', '.unlike_button', handleUnlikeButtonPress);
    body.on('click', '.edit_button', handleEditButtonPress);
    body.on('click', '.retweet_button', handleRetweetButtonPress);
    body.on('click', '.delete_button', handleDeleteButtonPress);
    body.on('click', '.makeNewPost_button', handleNewPostButtonPress);
    body.on('click', '.refresh_button', handleRefreshButtonPress);
    body.on('click', '#edit_submit', handleEditSubmitButtonPress);
    body.on('click', '#retweet_submit', handleRetweetSubmitButtonPress);
    body.on('click', '#post_submit', handlePostSubmitButtonPress);
}

$(document).ready(initializePage());