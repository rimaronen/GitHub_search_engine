// handle github search java script code
// using local namespace

(function () {

    // variable that keeps the information about the user search if was successful
    let validUserNameJason = "";
    // executes the search with the login url. input from the input box will be added to the url for committing a search
    let loginUrl = "";

    // create the headers for the request for the server for saving a user
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    // check a status of the response was accepted from github api or from the server
    function status(response) {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.statusText))
        }
    }

    // return response as a json object
    function json(response) {
        return response.json()
    }

    // fetch url and return promise
    function fetchUrl(url, params = {method: 'GET'}) {
        return fetch(url, params)
            .then(status)
            .then(json)
    }

    // the function that triggers an Ajax call
    async function searchUser() {
        // check if the input is valid and chain to url
        if(validateUserName()) {
            fetchUrl('/githubSearch/checkSession', {method: 'POST'})
                .then(function (response) {
                    const obj = JSON.parse(JSON.stringify(response));
                    if (obj.reload) { // if the session was ended
                        setModalMessage(obj.title, obj.message, obj.reload);
                    } else {
                        fetchUrl(loginUrl)
                            .then(function (response) {
                                validUserNameJason = JSON.parse(JSON.stringify(response));
                                // extract the followers and the repositories from the response
                                extractResponse();

                            }).catch(error => {  // if user is not found
                            console.log('Request failed', error);
                            setModalMessage('Oops', 'Looks like the user is not found');
                            hideElement(document.getElementById('userInfo'));
                        });
                    }
                });
        }
    }

    // request succeeded, generate the html
    function extractResponse() {
        // parse user login name, add it to the html
        setLoginName(validUserNameJason.login);
        // create html for repositories, pass repos url api and number of repositories
        setRepositories(validUserNameJason.repos_url, validUserNameJason.public_repos);
        // create html for followers repositories, pass followers url api and number of followers
        setFollowers(validUserNameJason.followers_url, validUserNameJason.followers);
        // show the user info html the was generated from the response
        let userSection = document.getElementById("userInfo");
        showElement(userSection);
    }

    // set login name if was valid
    function setLoginName (name) {
        document.getElementById("loginName").innerHTML = `<strong>${name}</strong>`;
    }

    // save user function. send request to the server. will be optional only if the username is correct
    async function saveUser() {
        // searched the user first, send the login name and his url
        await handleSaveList("/githubSearch/save", "save",
            validUserNameJason.login, validUserNameJason.html_url);
        // init json object for the next user to be search
    }

    // delete user function. send request to the server
    async function deleteUser () {
        // delete user if exists in the saved list. input will be sent to the request
        await handleSaveList("/githubSearch/delete", "delete",
            document.getElementById("inputBox").value.trim());
    }

    // handle requests and response for the saved list
    async function handleSaveList(url, action, name, htmlUrl) {
        const data = {name: name, url: htmlUrl};
        // ajax parameters for sending the request to the server
        let ajaxParams = {
            method: action === 'save' ? 'PUT' : 'DELETE',
            headers: myHeaders, // the headers was defined in the beginning of the namespace
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify(data) // sending user login and user url as JSON to the route
        };

        // fetch our response to the server - pass only login name and the url link for the html
        fetchUrl(url, ajaxParams)
            .then(function(response) { // get the saved list from the server's response
                const obj = JSON.parse(JSON.stringify(response));
                setModalMessage(obj.title, obj.message, obj.reload);
                loadSavedList();
            }).catch(function(error) {
            console.log('Request failed', error);
        });
    }

    // create html repositories by generating new response
    function setRepositories(reposApi, numOfRepos) {
        let html = "";
        if (numOfRepos === 0) { // if no repositories, no need to fetch request for them
            document.getElementById("reposList").innerHTML = `<p> No repositories</p>`;
            return;
        }

        // fetch repositories request
        fetchUrl(reposApi)
            .then(function(response) {
                const api = JSON.parse(JSON.stringify(response));
                for (i = 0; i < api.length; ++i)
                    // set html url in the link, and the user's repositories name as the name
                    html += `<li><a href='${api[i].html_url}' target="blank">${api[i].full_name}</a></li>`;
                document.getElementById("reposList").innerHTML = html;

            }).catch(function(error) {
            console.log('Request failed', error);
        });
    }

    // create html followers repositories bt generating new response
    function setFollowers(followsApi, numOfFollows) {
        let html = "";
        if (numOfFollows === 0) { // if no followers, no need to fetch request for them
            document.getElementById("followersList").innerHTML = `<p> No Followers</p>`;
            return;
        }
        // fetch the followers request
        fetchUrl(followsApi)
            .then(function(response) {
                const api = JSON.parse(JSON.stringify(response));
                for (i = 0; i < api.length; ++i)
                    // set follower html url in the link, and the follower name as the name
                    html += `<li><a href='${api[i].html_url}' target="blank">${api[i].login}</a></li>`;
                document.getElementById("followersList").innerHTML = html;

            }).catch(function(error) {
            console.log('Request failed', error);
        });
    }

    // load the saved list to the screen when reloading html page (and session is not ended)
    function loadSavedList() {
        fetchUrl('/githubSearch/list')
            .then(function(response) { // if has response, then build the list
                buildSavedList(JSON.parse(JSON.stringify(response)));
            }).catch(function(error) {
            console.log('Request failed', error);
        });
    }

    // build html saved list on our html page
    function buildSavedList(saved) {
        let htmlSavedList = "";
        for (i in saved)
            htmlSavedList += `<li><a href='${saved[i].urlLink}' target="blank">${saved[i].username}</a></li>`;
        document.getElementById("savedList").innerHTML = htmlSavedList;

    }

    // validate user name input. if valid, then chain in to the url
    function validateUserName () {
        let valid = true;
        let userName =  document.getElementById("inputBox").value.trim().toLocaleLowerCase();
        if (userName === '') {// if the input is empty
            setModalMessage('NO INPUT', 'Please enter user name');
            let userSection = document.getElementById("userInfo");
            hideElement(userSection);
            valid = false;
        }
        else { // initialize login url and htmlUrl for new search
            initializeParams();
            valid = true;
        }
        loginUrl += userName;
        validUserNameJason = "";
        return valid;
    }

    // initialize parameters for new search
    function initializeParams() {
        loginUrl = "https://api.github.com/users/";
        document.getElementById("followersList").innerText = "";
        document.getElementById("reposList").innerText = "";
    }

    // set modal body as the given message and display the modal
    function setModalMessage(title,message, reload = false) {
        let loadButton = document.getElementById('toLoginButton');
        if(reload)
            showElement(loadButton);
        else
            hideElement(loadButton);
        document.getElementById("modalTitle").innerText = title;
        document.getElementById("modalBody").innerText = message;
        $('#myModal').modal('show');
    }

    // hide element from the screen
    function hideElement(e) {
        e.style.display = "none";
    }

    // display element on the screen
    function showElement(e) {
        e.style.display = "block";
    }

// add DOM listeners
    document.addEventListener("DOMContentLoaded", (event) => {

        loadSavedList();
        document.getElementById("userInfo").style.display = "none";

        document.getElementById("searchUser").addEventListener("click", searchUser);
        document.getElementById("saveUser").addEventListener("click", saveUser);
        document.getElementById("deleteUser").addEventListener("click", deleteUser);
        document.getElementById("toLoginButton").addEventListener("click", function() {
            location.reload();
        });

    }, false);

})();
