var googleData = null;

function displayGoogleDriveOptions() {
    //console.log(workoutData)
    //var dayData = workoutData.days[dayNum%(workoutData.days.length)];
    //console.log(dayData)

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
    //weightUpdate.appendChild(cancel);

    var h2 = document.createElement('h2');
    h2.appendChild(cancel);
    h2.appendChild(document.createTextNode("Google Drive Options"));
    googleOptions.appendChild(h2);

    var ul = document.createElement('ul');

    var GoogleApiIndicator = document.createTextNode("\u20E0");
    var GoogleSignInIndicator = document.createTextNode("\u20E0");

    if (GoogleApi && GooglePicker) {
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
    a.appendChild(document.createTextNode("Google API Loaded"));
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

    if (googleData == null) {
      var appFolderName = "none";
      var syncFileName = "none";
      var readTime = "never";
      var writeTime = "never"
    } else {
      var appFolderName = googleData.appFolder.name;
      var syncFileName = googleData.syncFile.name;
      var readTime = googleData.readTime;
      var writeTime = googleData.writeTime;
    }

    var li = document.createElement('li')
    var a = document.createElement('a')
    if (googleData != null) {
      a.href = "https://drive.google.com/open?id="+googleData.appFolder.id;
      a.target = "_blank";
    }
    a.className = "right";
    a.appendChild(document.createTextNode(appFolderName));
    li.appendChild(a);
    var a = document.createElement('a')
    if (googleData != null) {
      a.target = "_blank";
      a.href = "https://drive.google.com/open?id="+googleData.appFolder.id;
    }
    a.appendChild(document.createTextNode("App Folder"));
    li.appendChild(a);
    ul.appendChild(li);


    var li = document.createElement('li')
    var a = document.createElement('a')
    a.className = "right";
    if (googleData != null) {
      a.target = "_blank";
      a.href = "https://drive.google.com/open?id="+googleData.syncFile.id;
    }
    a.appendChild(document.createTextNode(syncFileName));
    li.appendChild(a);
    var a = document.createElement('a')
    if (googleData != null) {
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
  
    if (!GoogleSignIn) {
    // Sign In
    var enable = document.createElement('a');
    enable.className = "black button";
    //enable.href = "javascript:enableGoogleDrive()";
    enable.href = "javascript:signIn();displayGoogleDriveOptions();";
    enable.appendChild(document.createTextNode("Sign In / Authorize"));
    buttonContainer.appendChild(enable);
    }  else {
      // Sign Out
      var disable = document.createElement('a');
      disable.className = "black button";
      //disable.href = "javascript:disableGoogleDrive()";
      disable.href = "javascript:signOut();displayGoogleDriveOptions();";
      disable.appendChild(document.createTextNode("Sign Out"));
      buttonContainer.appendChild(disable);

      if (googleData != null) {
        // Reset 
        var disable = document.createElement('a');
        disable.className = "black button";
        //disable.href = "javascript:disableGoogleDrive()";
        disable.href = "javascript:resetLocalGoogleData();displayGoogleDriveOptions();";
        disable.appendChild(document.createTextNode("Reset Sync"));
        buttonContainer.appendChild(disable);
      } else {
        // Setup Sync
        var sync = document.createElement('a');
        sync.className = "black button";
        //sync.href = "javascript:syncGoogleDrive()";
        sync.href = "javascript:initGoogleSyncFile();closeOptions();";
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
    }

/*
    // Write
    var write = document.createElement('a');
    write.className = "black button";
    write.href = "javascript:writeToGoogleDrive('workoutData.json', 'application/json', workoutData, googleData.appFolder, handleCreateSyncFile)";
    write.appendChild(document.createTextNode("Export"));
    buttonContainer.appendChild(write);

    // Update
    var write = document.createElement('a');
    write.className = "black button";
    write.href = "javascript:updateToGoogleDrive(googleData.syncFile, workoutData, handleUpdateSyncFile)";
    write.appendChild(document.createTextNode("Update"));
    buttonContainer.appendChild(write);

    // Read
    var read = document.createElement('a');
    read.className = "black button";
    read.href = "javascript:readSyncFile();";
    //read.href = "javascript:listFiles()";
    read.appendChild(document.createTextNode("Import"));
    buttonContainer.appendChild(read);
*/
    


    googleOptions.appendChild(buttonContainer);

    // Add to the page and hide main panel
    document.getElementById('options').replaceWith(googleOptions);
    document.getElementById('header').style.display = 'none';
    document.getElementById('main').style.display = 'none';
    window.scrollTo(0, 0);
}

function writeToGoogleDrive(name, mimeType, data, parentFolder, callback) {

  if (GoogleUser.hasGrantedScopes(SCOPES)) {
    if (parentFolder == null) {
      parentFolderId = 'root';
    }
    else {
      parentFolderId = parentFolder.id;
    }

  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const contentType = 'application/json';

  var metadata = {
      'name': name,
      'mimeType': mimeType,
      parents: [parentFolderId]
    };

    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + 'application/json' + '\r\n\r\n' +
        JSON.stringify(data) +
        close_delim;

    // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiclientrequest
    var request = gapi.client.request({
      'path': '/upload/drive/v3/files',
      'method': 'POST',
      'params': {'uploadType' : 'multipart'},
      'headers': { 'Content-Type': 'multipart/related; boundary="' + boundary + '",' },
      'body' : multipartRequestBody
    });
    request.execute(callback);
  }
  else {
    setSigninStatus();
    alert("Please sign in to Google Drive")
  }
}


function updateToGoogleDrive(file, data, callback) {

  if (GoogleUser.hasGrantedScopes(SCOPES)) {

  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const contentType = 'application/json';

    var metadata = {
        //'name': name,
        'mimeType': contentType,
        //parents: [parentFolderId]
      };

    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata, null, 1) +
        delimiter +
        'Content-Type: ' + 'application/json' + '\r\n\r\n' +
        JSON.stringify(data, null, 1) +
        close_delim;

    // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiclientrequest
    var request = gapi.client.request({
      'path': '/upload/drive/v3/files/' + file.id,
      'method': 'PATCH',
      'params': {'uploadType' : 'multipart'},
      'headers': { 'Content-Type': 'multipart/related; boundary="' + boundary + '",' },
      'body' : multipartRequestBody
    });
    request.execute(callback);
  }
  else {
    setSigninStatus();
    alert("Please sign in to Google Drive")
  }
}

function handleCreateSyncFile(response) {
  //console.log(response);
  googleData.syncFile = response;
  setLastWriteTime();
  getSyncFileMetadata();
  updateStoredData('googleData', googleData);
  console.log("Google Drive Data initialized with Local Storage");
  googleSyncInProgress(false);
  printHeader();
  printMain();
}

function handleUpdateSyncFile(response) {
  //console.log(response);
  if (response.error == undefined) {
    setLastWriteTime();
    console.log("Google Drive Data updated with Local Storage")
    updateStoredData('googleData', googleData);
  }
  else {
    alert("Error updating Sync File");
    console.log(response);
  }
  googleSyncInProgress(false);
  if (activeTab != 'forecast') {
    printHeader();
    printMain();
  }
}

function handleReadSyncFile(response) {
  if (response.error == undefined) {
    //console.log(response);
    storedData = response;
    updateStoredData('storedData', storedData, false);
    setLastReadTime();
    console.log("Local Storage updated with Google Drive Data");
    getSyncFileMetadata();
    //updateStoredData('googleData', googleData);
  }
  else {
    alert("Error reading Sync File");
    console.log(response);
  }
  googleSyncInProgress(false);
}

function handleImportSyncFile(response) {
  if (typeof response.error == undefined) {
    storedData = response;
    updateStoredData('storedData', storedData);
    //console.log(response);
    setLastReadTime();
    console.log("Local Storage updated with Google Drive Data");
    updateStoredData('googleData', googleData);
  }
  else {
    alert("Error importing sync file.")
  }
  googleSyncInProgress(false);
  printHeader();
  printMain();
}

function createPicker() {
  // https://developers.google.com/picker/docs/reference
  if (GooglePicker && GoogleUser.hasGrantedScopes(SCOPES) && GoogleAuthToken != "") {

      console.log("Auth Token: " + GoogleAuthToken)
      var view = new google.picker.View(google.picker.ViewId.DOCS);
      //view.setMimeTypes("image/png,image/jpeg,image/jpg");
      //view.setMode('LIST');
      var picker = new google.picker.PickerBuilder()
          .enableFeature(google.picker.Feature.NAV_HIDDEN)
          //.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
          .setAppId("workoutapp-1547573908589")
          .setOAuthToken(GoogleAuthToken)
          .addView(view)
          .addView(new google.picker.DocsUploadView())
          .setDeveloperKey("AIzaSyBhUaOQu8zs6mhXELmgIpKEl6Ji-5bw2Uw")
          .setCallback(pickerCallback)
          .setSize(1051,650)
          .build();
       picker.setVisible(true);
  }
  else {
    alert("Please sign in to Google Drive")
  }
  googleSyncInProgress(false);
}

function pickerCallback(data) {
  if (data.action == google.picker.Action.PICKED) {
    var fileId = data.docs[0].id;
    console.log('The user selected: ' + fileId);
    syncToExistingFile(fileId);
  }
}

function readMetaDataFromGoogleDrive(file, callback) {

  if (GoogleUser.hasGrantedScopes(SCOPES)) {

    // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiclientrequest
    var request = gapi.client.request({
      'path': '/drive/v3/files/' + file.id,
      'method': 'GET',
      'params': {'fields' : ' name, kind, id, mimeType, parents'}
      //'headers': { 'Content-Type': 'multipart/form-data; boundary="' + boundary + '",' },
      //'body' : multipartRequestBody
    });

    request.execute(callback);
    //request.execute(function(response) {
      // console.log(response); 
      // if (response.mimeType == "application/vnd.google-apps.folder") {
      //   appFolderId = response.id;
      // }
      // else if (response.mimeType == "application/json") {
      //   syncFileId = response.id;  
      // }
    //});
  }
  else {
    setSigninStatus();
    alert("Please sign in to Google Drive");
    googleSyncInProgress(false);
  }
}

function readFromGoogleDrive(file, callback) {

  if (GoogleUser.hasGrantedScopes(SCOPES)) {

    // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiclientrequest
    var request = gapi.client.request({
      'path': '/drive/v3/files/' + file.id,
      'method': 'GET',
      'params': {'alt' : 'media'},
      //'headers': { 'Content-Type': 'multipart/form-data; boundary="' + boundary + '",' },
      //'body' : multipartRequestBody
    });

    request.execute(callback);
    //request.execute(function(response) {
      // console.log(response); 
      // if (response.mimeType == "application/vnd.google-apps.folder") {
      //   appFolderId = response.id;
      // }
      // else if (response.mimeType == "application/json") {
      //   syncFileId = response.id;  
      // }
    //});
  }
  else {
    setSigninStatus();
    alert("Please sign in to Google Drive");
    googleSyncInProgress(false);
  }
}

function initGoogleSyncFile() {
  if (GoogleUser.hasGrantedScopes(SCOPES)) {  
    if (googleData == null) { //} || checkGoogleFileExists(googleData.syncFile.id)) == false) { 
        googleData = {
          appFolder : null,
          syncFile : null,
          readTime : "never",
          writeTime : "never"
        }
        syncFileName = prompt("Enter the filename to use for the sync file (.json will be appended.)\n\n" +
            "The sync file will be created at the Google Drive root.  All application data will be stored in that file. You can move this file to another location on your drive and sync will still work.",
            "webAppData")
        createSyncFile(syncFileName+".json");
        //alert ("Couldn't find existing sync file. A new sync file is being created"); 
    } else {
      alert("Synchronization is already setup.  Reset Sync to start over.");
      googleSyncInProgress(false);
    }
  } else {
    setSigninStatus();
    alert("Please sign in to Google Drive")
    googleSyncInProgress(false);
  }
}

function syncToExistingFile(fileId) {
  if (GoogleUser.hasGrantedScopes(SCOPES)) {  
    if (googleData == null) { //} || checkGoogleFileExists(googleData.syncFile.id)) == false) { 
        googleData = {
          appFolder : null,
          syncFile : null,
          readTime : "never",
          writeTime : "never"
        }
    }
    googleData.syncFile = {id : fileId };
    getSyncFileMetadata()
    readSyncFile();
  } else {
    setSigninStatus();
    alert("Please sign in to Google Drive");
    googleSyncInProgress(false);
  }
}

// function createAppFolder(folderName, parentFolder) {
//   writeToGoogleDrive(folderName, 'application/vnd.google-apps.folder', '', parentFolder, handleCreateAppFolder);
// }

function createSyncFile(fileName) {
    googleSyncInProgress(true);
    //alert ("The sync file will be created at the Google Drive root.  All application data will be stored in that file. You can move this file to another location on your drive and sync will still work.");
    writeToGoogleDrive(fileName, 'application/json', storedData, googleData.appFolder, handleCreateSyncFile);
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
    var appFolder = {id : googleData.syncFile.parents[0]}
    readMetaDataFromGoogleDrive(appFolder, handleReadAppFolderMetadata)
  }
  else {
    alert ("Error Importing Sync File Metadata");
    console.log(response);
    googleSyncInProgress(false);
  }
}

function handleReadAppFolderMetadata(response) {
  if (response.error == undefined) {
    googleData.appFolder = response;
    updateStoredData('googleData', googleData);
  }
  else {
    alert ("Error Importing App Folder Metadata");
    console.log(response);
  }
  googleSyncInProgress(false);
  printHeader();
  printMain();
}

function updateSyncFile() {
  if (googleData.syncFile != null) {
    googleSyncInProgress(true);;
    updateToGoogleDrive(googleData.syncFile, storedData, handleUpdateSyncFile);
  } else {
      console.log("Google synchronization is not setup.");
  }
}

function resetLocalGoogleData() {
    googleData = null;
    clearStoredData('googleData');
    alert("You can now delete the sync file on Google Drive.  Setup Sync to turn on Synchronization or Import to re-estblish connection with sync file.")
}

function googleSyncInProgress(inProgress) {
  var loading = document.getElementById("loading");

  if (inProgress) {
    loading.style.display = "block";
  } else {
    loading.style.display = "none";
  }
}

/*
now = new Date();
const offsetMs = now.getTimezoneOffset() * 60 * 1000;
const dateLocal = new Date(now.getTime() - offsetMs);
str = dateLocal.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
*/

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
//**************** Google authorization and Client API initialization and flow ****************//
//************** https://developers.google.com/identity/protocols/OAuth2UserAgent *************//

// Global for Google Authorization
var GoogleAuth;
var GoogleUser;
var GoogleAuthToken = "";
var GoogleApi = false;
var GooglePicker = false;
var GoogleSignIn = false;
var initialized = false;

// Scopes requried for this application
var SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive';

function handleClientLoad() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    gapi.load('client:auth2', initClient);
    gapi.load('picker', {'callback': onPickerApiLoad});
  }

function initClient() {
  // Retrieve the discovery document for version 3 of Google Drive API.
  // In practice, your app can retrieve one or more discovery documents.
  var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

  // Initialize the gapi.client object, which app uses to make API requests.
  // Get API key and client ID from API Console.
  // 'scope' field specifies space-delimited list of access scopes.
  gapi.client.init({
      'apiKey': 'AIzaSyBhUaOQu8zs6mhXELmgIpKEl6Ji-5bw2Uw',
      'discoveryDocs': [discoveryUrl],
      'clientId': '225263823157-r3mnuks0si79i07727ph5khd65ptlu20.apps.googleusercontent.com',
      'scope': SCOPES
  }).then(function (authResult) {
    GoogleAuth = gapi.auth2.getAuthInstance();
    console.log("Google Client API loaded")
    GoogleApi = true;

    // Listen for sign-in state changes.
    GoogleAuth.isSignedIn.listen(setSigninStatus);

    // Handle initial sign-in state. (Determine if user is already signed in.)
    GoogleUser = GoogleAuth.currentUser.get();
    setSigninStatus(true);

    // Call Application initialization
    init();

  });
}

function onPickerApiLoad() {
  console.log("Google Picker Loaded");
  GooglePicker = true;
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
      msg = gapi.auth2.getAuthInstance().isSignedIn.get();
      console.log("Sign In Status: " + msg);
    });
}
function signIn() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then(function () {
      console.log('User signed in.');
      msg = gapi.auth2.getAuthInstance().isSignedIn.get();
      console.log("Sign In Status: " + msg);
    });
}

// Not currently used
function revokeAccess() {
  GoogleAuth.disconnect();
}

function setSigninStatus() {
  var GoogleUser = GoogleAuth.currentUser.get();
  var isAuthorized = GoogleUser.hasGrantedScopes(SCOPES);
  if (isAuthorized) {
    console.log( "You are currently signed in and have granted scopes: " + SCOPES);
    GoogleSignIn = true;

    // Set access token for OAuth end point calls
    GoogleUser.reloadAuthResponse().then (function(authResponse) {
      GoogleAuthToken = authResponse.access_token;
      console.log("Auth Token: " + GoogleAuthToken);  
      //Just a quick note that the auth_token in the above example is not necessary if you are using gapi.client.init and specifying your token etc.
    });
  } else { 
    console.log("You have not authorized this app or you are signed out");
    GoogleSignIn = false;
    googleSyncInProgress(false);
  }
  if (initialized == true) {
    displayGoogleDriveOptions();
  }
  initialized = true;
}





