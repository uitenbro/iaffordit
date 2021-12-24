var transData = {};
var forecastData = {};
var storedData = {};
var acctKey = 0
var state = 'none';
var forecastedBalance = [];

function readStoredData() {
    storedData = JSON.parse(localStorage.getItem("storedData"));
    setActiveAccount()
    acctName = storedData.accounts[acctKey].name;
    transData = storedData.accounts[acctKey].transData;
    forecastData = storedData.accounts[acctKey].forecastData;
    //console.log (transData, forecastData);

    if (localStorage.getItem('googleData')) {
        //console.log('found stored googleData');
        googleData = JSON.parse(localStorage.getItem("googleData"));
        readSyncFile(); // need to wait for updates localStorage and local data
    }
}

function setActiveAccount() {
  // if key exists in storedData set it 
  acctKey = storedData.activeAccount;
  // TODO: else use the first account
}

function updateStoredData(item, value, pushToGoogle = true) {
  localStorage.setItem(item, JSON.stringify(value));
  if (item != 'googleData' && googleData != null && pushToGoogle) {
      updateSyncFile();
  }
  else {
      printHeader();
      printMain();
      closeOptions();
  }
}

function initializeStoredData () {

  if (localStorage.getItem('storedData')) {
    //console.log('found local storedData');
  }
  else {
    //console.log('create default data');
    storedData.accounts = {}
    acctKey = createNewAccount("New Account")
    var day = 1000*60*60*24;
    var date1 = new Date();
    var date2 = new Date();
    var date3 = new Date();
    var date4 = new Date();
    var date5 = new Date();
    var key1 = createNewTransaction('Weekly Bill', date1, 'wkl', 'bill', 250, 'zero');
    var key2 = createNewTransaction('Monthly Bill', date2, 'mon', 'bill', 400, 'one');
    var key3 = createNewTransaction('Monthly Deposit', date3, 'mon', 'dep', 1500, 'two');
    var key4 = createNewTransaction('Quarterly Bill', date4, 'qtr', 'bill', 100, 'three');
    var key5 = createNewTransaction('Monthly Expense', date5, 'mon', 'bill', 250, 'five');
    storedData.accounts[acctKey].transData = transData
    forecastData = {
        "startBalance" : 1500, 
        "forecastDuration" : 365,
        "graphTick" : 100,
    };
    storedData.accounts[acctKey].forecastData = forecastData
    updateStoredData('storedData',storedData);
  }
}

function clearStoredData(dataItem) {
  if (localStorage.removeItem(dataItem)) {
    //console.log('found stored workoutData');
  }
}

function init () {
    initializeStoredData();
    readStoredData();
    printHeader();
    printMain();
    //sortedTransKeys();
}

function updateTransaction(key, action) {

    if (action == "pay") {
        
        // If this is a one time transaction delete it from the data store
        if (transData[key].freq == "one") {
          delete transData[key];
        }
        else {
          // Increment this key with a future transactions date
          incrementTransaction(key);
        }
    }
    else if (action == "delete") {  
      // Delete it from the data store
      delete transData[key];
    }
    else {
      var name = document.editTransaction.name.value;
      var date = new Date(document.editTransaction.date.value + document.editTransaction.timezone.value);
      var freq = document.editTransaction.freq.value;
      var type = document.editTransaction.type.value;
      var amount = parseFloat(document.editTransaction.amount.value);
      var tags = document.editTransaction.tags.value;


      if (action == "all") {
          // Update all the data associated with this key with the given information
          updateExistingTransaction(key, action, name, date, freq, type, amount, tags);
      }
      else if (action == "one") {
          // Increment this key to a future transactions and write this data as a new transaction key
          incrementTransaction(key);
          createNewTransaction(name, date, "one", type, amount, tags);
      }
      else if (action == "new") {
          // Write this data as a new transaction key
          createNewTransaction(name, date, freq, type, amount, tags);
      }
    }
    storedData.accounts[acctKey].transData = transData
    updateStoredData('storedData', storedData);
}

function createNewTransaction (name, date, freq, type, amount, tags) {
    var key = generateKey();
    //console.log("createNew");
    //console.log(transData[key]);
    transData[key] = {};
    updateExistingTransaction (key, "all", name, date, freq, type, amount, tags)
    return key;
}

function createNewAccount (name) {
    var key = generateKey();
    //console.log("createNew");
    //console.log(transData[key]);
    storedData.activeAccount = key
    storedData.accounts[key] = {"name":name}
    return key;
}

function updateExistingTransaction (key, action, name, date, freq, type, amount, tags) {
    //console.log("updateExisting");
    //console.log(transData[key]);
    transData[key].name = name;
    transData[key].date = date;
    transData[key].freq = freq;
    transData[key].amount = amount;
    transData[key].type = type;
    transData[key].tags = tags;
    //console.log(transData[key]);
    //console.log(transData);
}

function incrementTransaction (key) {
    //console.log("incrementTrans");
    //console.log(transData[key]);
    transData[key].date = calcNextDate(transData[key].date, transData[key].freq).toISOString();
}

function calcNextDate (inDate, freq) {
    var date = new Date(inDate);
    var day = 1000*60*60*24;
    // All monthly bills scheduled after the 28th will be paid on 28th in the future
    // TODO: add preferred date and actual date to retain month end dates
    if ((date.getDate > 28) && ((freq == "mon" ||  freq == "bmn" || freq == "qtr" || freq == "anl"))) {
      date.setDate(28);
    }
    //console.log(freq);
    switch (freq) {
        case "wkl": {
          date.setTime(date.getTime() + 7*day);
          break;
        }
        case "bwk": {
          date.setTime(date.getTime() + 14*day);
          break;
        }
        case "one": {
          date.setYear(9999);
          break;
        }
        case "mon": {
          date = stepMon(date,1);
          break;
        }
        case "bmn": {
          date = stepMon(date,2);
          break;
        }
        case "qtr": {
          date = stepMon(date,3);
          break;
        }
        case "san": {
          date = stepMon(date,6);
          break;
        }
        case "anl": {
          date.setFullYear(date.getFullYear()+1);
          break;
        }
    }
    return date;
}

function stepMon (date, steps) {
  for (j = 0; j < steps; j+=1) {
    if (date.getMonth() < 11) {
      date.setMonth(date.getMonth()+1);
    }
    else {
      date.setMonth(0);
      date.setFullYear(date.getFullYear()+1);
    }
  }
  return date;
}

function generateKey() {
  // Use time in milliseconds for key
  var key = Date.now();
  // keep trying until a unique key is generated
  while (key in transData) {
    key = Date.now();
  }
  return key;
}

function sortedTransKeys() {
    var keys = [];
    for (var key in transData) {
      if (transData.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    keys.sort(compareTransDates);
    //console.log(keys);
    return keys;
}

function compareTransDates(key1, key2) {
    var date1 = transData[key1].date;
    var date2 = transData[key2].date;;
    if (date1 < date2) {
        return -1;
        }
    if (date1 > date2) {
        return 1;
        }
    return 0;
}

function updateForecastSettings(form) {
  forecastData.graphTick = parseInt(document.forecastSettings.graphTick.value);
  forecastData.startBalance  = parseFloat(document.forecastSettings.startBalance.value);
  forecastData.forecastDuration = parseInt(document.forecastSettings.forecastDuration.value);
  storedData.accounts[acctKey].forecastData = forecastData;
  updateStoredData('storedData', storedData);
}

function forecastBalance() {
  // clear balance array
  forecastedBalance = []
  readStoredData()
  // Start with today at midnight
  var payDate = new Date();
  payDate.setHours(24,0,0,0);
  var newBalance = forecastData.startBalance;
  //var day = 1000*60*60*24;
  var payUntilDate = new Date;
  // Set the pay until date by adding the duration to the start date
  payUntilDate.setDate(payUntilDate.getDate()+forecastData.forecastDuration);
  while (payDate < payUntilDate) {
    var previousBalance = newBalance;
    //console.log(payDate);
    newBalance = payToDate(payDate, previousBalance);
    if (newBalance != previousBalance) {
      // Use the previous day for the log
      var logDate = new Date(payDate);
      logDate.setDate(logDate.getDate()-1);
      forecastedBalance.push({date:logDate.toISOString(), balance:newBalance});
      //console.log("Add date");console.log(payDate);
    }
    // Increment one day
    payDate.setDate(payDate.getDate() + 1);
  }
  // restore initial conditions
  readStoredData();

  //console.log(forecastedBalance);
  return forecastedBalance;
}

function payToDate(payToDate, currentBalance) {
  var payDate = new Date(payToDate);
  // For each transaction
  var keys = sortedTransKeys();
  for (var i=0; i<keys.length; i++) {
    // Pay transaction until its past the pay to date
    var transDate = new Date(transData[keys[i]].date);
    while (transDate <= payDate) {
      currentBalance = payTransaction(keys[i], currentBalance);
      transDate = new Date(transData[keys[i]].date)
    }
  }
  return currentBalance;
}

function payTransaction(key, currentBalance) {
  if (transData[key].type == "bill") {currentBalance -= transData[key].amount;}
  else {currentBalance += transData[key].amount;} // deposit
  incrementTransaction(key); // increment date
  return currentBalance;
}
