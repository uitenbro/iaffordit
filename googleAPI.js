var googleData = null;

function displayGoogleDriveOptions() {
    
    // if googleData does not exist initialize it
    if (googleData == null) {
        googleData = {
          //appFolder : null,
          clientAccessToken: null,
          tokenExpiresAtTime: 0,
          syncFile : null,
          readTime : "never",
          writeTime : "never"
        }
    }

    googleOptions = document.createElement('div')
    googleOptions.id = "options";
    googleOptions.className = "optionpanel";
    googleOptions.style.display = "block"

    // Cancel
    var cancel = document.createElement('a');
    var img = document.createElement('img');
    img.src = "images/cancel.png";
    cancel.appendChild(img);
    cancel.href = "javascript:closeOptions();";

    var h2 = document.createElement('h2');
    h2.appendChild(cancel);
    h2.appendChild(document.createTextNode("Google Drive Options"));
    googleOptions.appendChild(h2);

    var ul = document.createElement('ul');

    var GoogleApiIndicator = document.createTextNode("\u20E0");
    var GoogleSignInIndicator = document.createTextNode("\u20E0");

    // If all three google services are loaded
    if (gapiInited && gisInited && GooglePickerInited) {
       GoogleApiIndicator = document.createTextNode("\u2713");
    }
    if (GoogleSignIn) {
       GoogleSignInIndicator = document.createTextNode("\u2713");
    }

    // Info
    var li = document.createElement('li')
    var a = document.createElement('a')
    a.className = "right";
    a.appendChild(GoogleApiIndicator);
    li.appendChild(a);
    var a = document.createElement('a')
    a.appendChild(document.createTextNode("Google APIs Loaded"));
    li.appendChild(a);
    ul.appendChild(li);

    var li = document.createElement('li')
    var a = document.createElement('a')
    a.className = "right";
    a.appendChild(GoogleSignInIndicator);
    li.appendChild(a);
    var a = document.createElement('a')
    a.appendChild(document.createTextNode("Signed In / Authorized"));
    li.appendChild(a);
    ul.appendChild(li);

    if (googleData.syncFile == null) {
      //var appFolderName = "none";
      var syncFileName = "none";
      var readTime = "never";
      var writeTime = "never"
    } else {
      //var Name = googleData.appFolder.name;
      var syncFileName = googleData.syncFile.name;
      var readTime = googleData.readTime;
      var writeTime = googleData.writeTime;
    }

    var li = document.createElement('li')
    var a = document.createElement('a')
    a.className = "right";
    if (googleData.syncFile != null) {
      a.target = "_blank";
      a.href = "https://drive.google.com/open?id="+googleData.syncFile.id;
    }
    a.appendChild(document.createTextNode(syncFileName));
    li.appendChild(a);
    var a = document.createElement('a')
    if (googleData.syncFile != null) {
      a.target = "_blank";
      a.href = "https://drive.google.com/open?id="+googleData.syncFile.id;
    }
    a.appendChild(document.createTextNode("Sync File"));
    li.appendChild(a);
    ul.appendChild(li);


    var li = document.createElement('li')
    var a = document.createElement('a')
    a.className = "right";
    a.appendChild(document.createTextNode(readTime));
    li.appendChild(a);
    var a = document.createElement('a')
    a.appendChild(document.createTextNode("Last Read"));
    li.appendChild(a);
    ul.appendChild(li);


    var li = document.createElement('li')
    var a = document.createElement('a')
    a.className = "right";
    a.appendChild(document.createTextNode(writeTime));
    li.appendChild(a);
    var a = document.createElement('a')
    a.appendChild(document.createTextNode("Last Write"));
    li.appendChild(a);
    ul.appendChild(li);

    googleOptions.appendChild(ul);

    // Action Buttons
    var buttonContainer = document.createElement('p');
  

    if (googleData.syncFile != null) {
      // Reset 
      var disable = document.createElement('a');
      disable.className = "black button";
      //disable.href = "javascript:disableGoogleDrive()";
      disable.href = "javascript:signOut();displayGoogleDriveOptions();";
      disable.appendChild(document.createTextNode("Stop Sync"));
      buttonContainer.appendChild(disable);
    } else {
      // Setup Sync
      var sync = document.createElement('a');
      sync.className = "black button";
      //sync.href = "javascript:syncGoogleDrive()";
      sync.href = "javascript:createSyncFile();";
      sync.appendChild(document.createTextNode("Setup New Sync"));
      buttonContainer.appendChild(sync);
    }

    // Picker
    var picker = document.createElement('a');
    picker.className = "black button";
    //picker.href = "javascript:pickerGoogleDrive()";
    picker.href = "javascript:createPicker();closeOptions()";
    picker.appendChild(document.createTextNode("Import Sync File"));
    buttonContainer.appendChild(picker);

    googleOptions.appendChild(buttonContainer);

    // Add to the page and hide main panel
    document.getElementById('options').replaceWith(googleOptions);
    document.getElementById('header').style.display = 'none';
    document.getElementById('main').style.display = 'none';
    window.scrollTo(0, 0);
}

function writeToGoogleDrive(file, method, data, callback) {

  //if (GoogleUser.hasGrantedScopes(SCOPES)) {

  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const contentType = 'application/json';

    var metadata = {
        //'name': name,
        'name': file.name,
        'mimeType': contentType,
      };

    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata, null, 1) +
        delimiter +
        'Content-Type: ' + 'application/json' + '\r\n\r\n' +
        JSON.stringify(data, null, 1) +
        close_delim;

    var pathAdd = (method === 'PATCH') ? '/' + file.id : ''
    // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiclientrequest
    var request = gapi.client.request({
      'path': '/upload/drive/v3/files' + pathAdd, // blank for initial write otherwise append google file id
      'method': method,  // POST for initial write, PATCH for updates
      'params': {'uploadType' : 'multipart'},
      'headers': { 'Content-Type': 'multipart/related; boundary="' + boundary + '",' },
      'body' : multipartRequestBody
    });
    sendRequest(request, callback); 
  // }
  // else {
  //   // setSigninStatus();
  //   alert("Please sign in to Google Drive")
  // }
}

function handleCreateSyncFile(response) {
  //console.log(response);
  if (response.error === undefined) {
    googleData.syncFile = response;
    setLastWriteTime();
    updateStoredData('googleData', googleData);
    console.log("Google Drive Data initialized with Local Storage");
    displayGoogleDriveOptions();
  }
  else {
    alert("Error creating Sync File\n" + JSON.stringify(response, null, 2) + "\nHTTP\n" +JSON.stringify(reason, null, 2));
    console.log(response, reason);
  }
  googleSyncInProgress(false);;
}

function handleUpdateSyncFile(response, reason) {
  //console.log(response);
  if (response.error === undefined) {
    console.log("Google Drive Data updated with Local Storage")
    setLastWriteTime();
    updateStoredData('googleData', googleData);
  }
  else {
    alert("Error updating Sync File\n" + JSON.stringify(response, null, 2) + "\nHTTP\n" +JSON.stringify(reason, null, 2));
    console.log(response, reason);
  }
  googleSyncInProgress(false);
}

function handleReadSyncFile(response) {
  if (response.error === undefined) {
    //console.log(response);
    // Check if response is a valid JSON object with appropriate data
    if (validateJsonData(response)) {
      Object.assign(syncData, response);
      updateStoredData(localStorageName, syncData);
      console.log("Local Storage updated with Google Drive Data");
      setLastReadTime();
      updateStoredData('googleData', googleData);
    }
    else {
      alert("Error reading Sync File Data, repair Sync File\n" + JSON.stringify(response, null, 2));
    }
  }
  else {
    alert("Error reading/accessing Sync File\n" + JSON.stringify(response, null, 2));
    console.log(response);
  }
  googleSyncInProgress(false);;
  printAll();
}

function createPicker() {
  // https://developers.google.com/picker/docs/reference
  if (checkToken(createPicker)) {
      var view = new google.picker.View(google.picker.ViewId.DOCS);
      //view.setMode('LIST');
      var picker = new google.picker.PickerBuilder()
          .enableFeature(google.picker.Feature.NAV_HIDDEN)
          //.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
          .setAppId(googleAppId)
          .setOAuthToken(gapi.client.getToken().access_token)
          .addView(view)
          .addView(new google.picker.DocsUploadView())
          .setDeveloperKey(googleDeveloperKey)
          .setCallback(pickerCallback)
          .setSize(1051,650)
          .build();
     picker.setVisible(true);
     googleSyncInProgress(false);
  }
}

function pickerCallback(data) {
  if (data.action == google.picker.Action.PICKED) {
    var fileId = data.docs[0].id;
    console.log('The user selected: ' + fileId);
    syncToExistingFile(fileId);
  }
}

function readMetaDataFromGoogleDrive(file, callback) {

  //if (GoogleUser.hasGrantedScopes(SCOPES)) {

    // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiclientrequest
    var request = gapi.client.request({
      'path': '/drive/v3/files/' + file.id,
      'method': 'GET',
      'params': {'fields' : ' name, kind, id, mimeType, parents'}
      //'headers': { 'Content-Type': 'multipart/form-data; boundary="' + boundary + '",' },
      //'body' : multipartRequestBody
    });

    sendRequest(request, callback); 
  // }
  // else {
  //   // setSigninStatus();
  //   alert("Please sign in to Google Drive");
  //   googleSyncInProgress(false);
  // }
}

function readFromGoogleDrive(file, callback) {

  //if (GoogleUser.hasGrantedScopes(SCOPES)) {

    // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiclientrequest
    var request = gapi.client.request({
      'path': '/drive/v3/files/' + file.id,
      'method': 'GET',
      'params': {'alt' : 'media'},
      //'headers': { 'Content-Type': 'multipart/form-data; boundary="' + boundary + '",' },
      //'body' : multipartRequestBody
    });

    sendRequest(request, callback); 
  // }
  // else {
  //   // setSigninStatus();
  //   alert("Please sign in to Google Drive");
  //   googleSyncInProgress(false);
  // }
}

function syncToExistingFile(fileId) {
  // if (GoogleUser.hasGrantedScopes(SCOPES)) {  
    if (googleData == null) { //} || checkGoogleFileExists(googleData.syncFile.id)) == false) { 
        googleData = {
          //appFolder : null,
          syncFile : null,
          readTime : "never",
          writeTime : "never"
        }
    }
    googleData.syncFile = {id : fileId };
    getSyncFileMetadata()
    readSyncFile();
  // } else {
  //   // setSigninStatus();
  //   alert("Please sign in to Google Drive");
  //   googleSyncInProgress(false);
  // }
}

function createSyncFile() {
    googleSyncInProgress(true);
    writeToGoogleDrive({'id': '', 'name': syncFileName}, 'POST', syncData, handleCreateSyncFile);
    alert ("All data will be stored in a file called " + syncFileName + " on at the Google Drive root.  You can move/remane this file as needed and sync will still work.");
}

function readSyncFile() {
  if (googleData.syncFile != null) {
      googleSyncInProgress(true);
      readFromGoogleDrive(googleData.syncFile, handleReadSyncFile);
  } else {
      console.log("Google synchronization is not setup");
  }
}

function getSyncFileMetadata() {
  readMetaDataFromGoogleDrive(googleData.syncFile, handleReadSyncFileMetadata);
}
function handleReadSyncFileMetadata(response) {
  //console.log(response);
  if (response.error == undefined) {
    googleData.syncFile = response;
    updateStoredData('googleData', googleData)
  }
  else {
    alert ("Error Importing Sync File Metadata\n" + JSON.stringify(response, null, 2));
    console.log(response);
    googleSyncInProgress(false);
  }
}

function updateSyncFile() {
  if (googleData.syncFile != null) {
    googleSyncInProgress(true);;
    writeToGoogleDrive(googleData.syncFile, 'PATCH', syncData, handleUpdateSyncFile);
  } else {
      console.log("Google synchronization is not setup.");
  }
}

function resetLocalGoogleData() {
    googleData = null;
    clearStoredData('googleData');
    alert("You can now delete the synch file on your Google Drive.  Setup New Sync to turn on synchronization again.")
    displayGoogleDriveOptions();
}

function googleSyncInProgress(inProgress) {
  var loading = document.getElementById("loading");

  if (inProgress) {
    loading.style.display = "block";
  } else {
    loading.style.display = "none";
  }
}

function setLastReadTime() {
  var now = new Date();
  googleData.readTimestamp = now.getTime();
  googleData.readTime = now.toISOString().replace("T", " ").replace("Z", "");
  //googleData.readTime = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+now.getHours()+':'+now.getMinutes()+':'+now.getSeconds()+':'+now.getMilliseconds();
  console.log("Read Sync File: " + " " + googleData.readTime );
}
function setLastWriteTime() {
  var now = new Date();
  googleData.writeTimestamp = now.getTime();
  googleData.writeTime = now.toISOString().replace("T", " ").replace("Z", "");
  //googleData.writeTime = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+now.getHours()+':'+now.getMinutes()+':'+now.getSeconds()+':'+now.getMilliseconds();
  console.log("Wrote Sync File: " + " " + googleData.writeTime );
}

function sendRequest(request, callback) {
  // CheckToken will return true if a valid google authorization token is available.  
  // It will return false and begin the authorization process if a new token is needed.  
  // The callback will return to this funciton.
  if (checkToken(function (){sendRequest(request, callback)})) {   
    // AuthToken is good so execute the request
    request.execute(callback);
  }
}


//**************** Google ID Services authorization and Client API initialization flow ****************//
//************** https://developers.google.com/identity/protocols/OAuth2UserAgent *************//
//  https://developers.google.com/identity/openid-connect/openid-connect

// Globals for Google Authorization
let tokenClient;
let gapiInited = false;;
let gisInited = false;;
let GooglePickerInited = false;
var GoogleSignIn = false;
let tokenExpiresAtTime;

// Scopes requried for this application
var SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive';

function gapiInit() {
  gapi.client.init({
    // NOTE: OAuth2 'scope' and 'client_id' parameters have moved to initTokenClient().
  })
  .then(function() {  
    console.log("Google Client API Loaded");
    gapiInited = true;
  });
}
function onPickerApiLoad() {
  console.log("Google Picker Loaded");
  GooglePickerInited = true;
}

function gapiLoad() {
    gapi.load('client', gapiInit)
    gapi.load('picker', onPickerApiLoad);
}

function gisInit() {
 tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: googleTokenClientId,
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive',
            callback: '',  // defined at request time in getTokenAndContinue()
            error_callback: handleAccessError
        });
  console.log("Google ID Services Loaded");
  gisInited = true;
}

function checkToken(callback) {
  // Conditionally ask users to select the Google Account they'd like to use,
  // and explicitly obtain their consent to use Drive.
  // NOTE: To request an access token a user gesture is necessary.

  // if an exiting token is not defined
  if ((gapi.client.getToken() === null)) {
    // if an existing token is unavailable or expired
    if (googleData.clientAccessToken === null || (new Date().getTime() > googleData.tokenExpiresAtTime)) {
      // get a new token
      getTokenAndContinue('', callback)
      return false;
    } 
    else {
      // an existing token is available in localstorage and it hasn't expired so use it
      gapi.client.setToken({access_token: googleData.clientAccessToken})
      GoogleSignIn = true;
      return true;
    }
  } 
  // Token is available so check for token expiration
  else if (new Date().getTime() > googleData.tokenExpiresAtTime) {
    // Get an updated token - Skip display of account chooser and consent dialog for an existing session.
    getTokenAndContinue('none', callback)
    return false;
  } 
  else {
    // token is good
    return true;
  }
}

function getTokenAndContinue(prompt = '', continuationCode) {
    // Create the callback function for this request
    tokenClient.callback = (response) => {
      // TODO: not sure this is reachable due to error_callback being defined as handleAccessError
      if (response.error !== undefined) {
        googleSyncInProgress(false);
        alert('Authorization error.\n' + json.STRINGIFY(response));
        GoogleSignIn = false;
        throw(response);
      }
      // TODO: Handle partial authorizations - https://developers.google.com/identity/oauth2/web/guides/use-token-model#granular_permissions

      // Update data stores
      // GIS has automatically updated gapi.client with the newly issued access token.
      googleData.clientAccessToken = gapi.client.getToken().access_token;
      console.log('gapi.client access token: ' + JSON.stringify(gapi.client.getToken()));
      googleData.tokenExpiresAtTime = new Date().getTime() + gapi.client.getToken().expires_in * 1000;
      console.log('gapi.client access token expires: ', googleData.tokenExpiresAtTime);
      GoogleSignIn = true;
      updateStoredData("googleData", googleData)
      
      // Now the AuthToken is good so execute the request
      continuationCode();
    }

    // Prompt the user to select a Google Account and asked for consent to share their data when establishing a new session.
    // Will reauthorize without user action if previous authorization has occurred.
    // continuation code should contain the callback to execute upon successfully receiving the token.
    tokenClient.requestAccessToken({prompt: prompt}); 
}

function handleAccessError(err) {
  if (err.type == 'popup_failed_to_open') {
    alert('The Google popup window has failed to open.  Please allow popups.');
  } else if (err.type == 'popup_closed') {
    alert('No Google account was authorized.  Please try again.')
  }
  googleSyncInProgress(false);
}

function signOut() {
    resetLocalGoogleData();
    GoogleSignIn = false;
    alert('Optionally you can remove Google access for this app in the following window.')
    window.open('https://myaccount.google.com/permissions', '_blank');
}

// Not used
function signIn() {
  // CheckToken will return true if a valid google authorization token is available.  
  // It will return false and begin the authorization process if a new token is needed.  
  // The callback will return to this funciton.
  if (checkToken(signIn)) {   
    // AuthToken is good so execute the request
    displayGoogleDriveOptions();
  }
}







