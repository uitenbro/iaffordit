var transData = {};
var forecastData = {};
var storedData = {};
var acctKey = 0
var state = 'none';
var forecastedBalance = [];

var syncData = storedData; // syncData is a reference to the local data variable to be stored and synched
var localStorageName = 'storedData' // name of the syncData in localstorage
var syncFileName = "iaffordIt.json"; // name of json file for google drive
var googleAppId = "workoutapp-1547573908589";
var googleDeveloperKey = "AIzaSyBhUaOQu8zs6mhXELmgIpKEl6Ji-5bw2Uw";
var googleTokenClientId = '225263823157-r3mnuks0si79i07727ph5khd65ptlu20.apps.googleusercontent.com'

function validateJsonData(response) {
    // Ensure the App Data matches what the application is expecting
    return response.accounts
}

function restoreWorkingDataFromLocalStorage() {
    Object.assign(storedData, JSON.parse(localStorage.getItem("storedData")));
    setActiveAccount()
    acctName = storedData.accounts[acctKey].name;
    transData = storedData.accounts[acctKey].transData;
    forecastData = storedData.accounts[acctKey].forecastData
}

function readStoredData() {
    Object.assign(storedData, JSON.parse(localStorage.getItem("storedData")));
    setActiveAccount()
    acctName = storedData.accounts[acctKey].name;
    transData = storedData.accounts[acctKey].transData;
    forecastData = storedData.accounts[acctKey].forecastData;
    //console.log (transData, forecastData);

    if (localStorage.getItem('googleData')) {
        //console.log('found stored googleData');
        googleData = JSON.parse(localStorage.getItem("googleData"));
        while((gapiInited == false) || (gisInited == false) || (GooglePickerInited == false)) {
            setTimeout(readStoredData(), 100)
        }
        readSyncFile(); // need to wait for updates localStorage and local data
    }
}

function setActiveAccount(key = null) {
  // if key exists in storedData set it 
  if (key == null) {
    acctKey = storedData.activeAccount;
  }
  else {
    storedData.activeAccount = key
    acctKey = key;
    updateStoredData("storedData", storedData)
    restoreWorkingDataFromLocalStorage();
    activeTab ='transactions';
    printHeader();
    printMain();
    closeOptions();
  }
  // TODO: else use the first account
}

function updateStoredData(item, value, pushToGoogle = true) {
  localStorage.setItem(item, JSON.stringify(value));
  if (item != 'googleData' && googleData != null && pushToGoogle) {
      updateSyncFile();
  }
}

function initializeStoredData () {

  if (localStorage.getItem('storedData')) {
    //console.log('found local storedData');
  }
  else {
    //console.log('create default data');
    storedData.accounts = {}
    var key = generateKey();
    storedData.activeAccount = key
    storedData.accounts[key] = {"name":"New Account"}
    acctKey = key;
    
    var day = 1000*60*60*24;
    var date1 = new Date();
    var date2 = new Date();
    var date3 = new Date();
    var date4 = new Date();
    var date5 = new Date();
    var key1 = createNewTransaction('Weekly Bill', date1, 'wkl', 'bill', 250, 'zero', 1, false);
    var key2 = createNewTransaction('Monthly Bill', date2, 'mon', 'bill', 400, 'one', 1, false);
    var key3 = createNewTransaction('Monthly Deposit', date3, 'mon', 'dep', 1500, 'two', 1, false);
    var key4 = createNewTransaction('Quarterly Bill', date4, 'qtr', 'bill', 100, 'three', 1, false);
    var key5 = createNewTransaction('Monthly Expense', date5, 'mon', 'bill', 250, 'five', 1, false);
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

function printAll() {
    setActiveAccount(storedData.activeAccount);
    // setActiveAccount already calls printHeader and printAll
    // printHeader();
    // printMain();
}

function init() {
    initializeStoredData();
    readStoredData();
    printHeader();
    printMain();
    //sortedTransKeys();
}

function updateTransaction(key, action, pushToGoogle = true) {

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
    else if (action == "pay2now") {
        
        var now = new Date()
        now.setHours(0, 0, 0, 0)
        var transDate = new Date(transData[key].date)
        while (transDate < now) {

          //console.log("now - " + now.toDateString() + "transData.date - " + transDate.toDateString())

          // If this is a one time transaction delete it from the data store
          if (transData[key].freq == "one") {
            delete transData[key];
            break;
          }
          else {
            // Increment this key with a future transactions date
            incrementTransaction(key);
            transDate = new Date(transData[key].date)
          }
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
      var priority = 1;
      if (document.editTransaction.priority) {
        priority = parseInt(document.editTransaction.priority.value);
      }
      var ignoreBudget = false;
      if (document.editTransaction.ignoreBudget) {
        ignoreBudget = document.editTransaction.ignoreBudget.checked;
      }
      // If freq is one, ignore budget by default if not specified
      if (!document.editTransaction.ignoreBudget && freq == "one") {
        ignoreBudget = true;
      }

      if (action == "all") {
          // Update all the data associated with this key with the given information
          updateExistingTransaction(key, action, name, date, freq, type, amount, tags, priority, ignoreBudget);
      }
      else if (action == "one") {
          // Increment this key to a future transactions and write this data as a new transaction key
          incrementTransaction(key);
          // For one-off, use priority but likely ignore budget
          createNewTransaction(name, date, "one", type, amount, tags, priority, true);
      }
      else if (action == "new") {
          // Write this data as a new transaction key
          createNewTransaction(name, date, freq, type, amount, tags, priority, ignoreBudget);
      }
    }
    storedData.accounts[acctKey].transData = transData
    updateStoredData('storedData', storedData, pushToGoogle);
}

function payAllToNow() {
    // Get keys for the currently active account
    var keys = sortedTransKeys();
    for (var i=0; i<keys.length; i++) {
        updateTransaction(keys[i], 'pay2now', false);
    }
    updateStoredData('storedData', storedData, true);
}

function createNewTransaction (name, date, freq, type, amount, tags, priority, ignoreBudget) {
    var key = generateKey();
    //console.log("createNew");
    //console.log(transData[key]);
    transData[key] = {};
    updateExistingTransaction (key, "all", name, date, freq, type, amount, tags, priority, ignoreBudget)
    return key;
}

function renameAccount(key) {
  name = prompt("Enter a new name for this account", storedData.accounts[key].name);
  storedData.accounts[key].name = name
  setActiveAccount(key)
}

function createNewAccount (name) {
    if (name == undefined) {
      name = prompt("Enter a name for this account", "New Account")
    }
    var key = generateKey();
    storedData.activeAccount = key
    acctKey = key;
    storedData.accounts[acctKey] = {"name":name}

    transData = {}
    var date1 = new Date()
    var key = createNewTransaction('Monthly Expense', date1, 'mon', 'bill', 250, '', 1, false);
    storedData.accounts[acctKey].transData = transData
    forecastData = {
        "startBalance" : 1500, 
        "forecastDuration" : 365,
        "graphTick" : 100,
    };
    storedData.accounts[acctKey].forecastData = forecastData
    updateStoredData('storedData', storedData)
    return acctKey;
}

function deleteAccount(key) {
  delete storedData.accounts[key];
  activeAccount = Object.keys(storedData.accounts)[0];
  setActiveAccount(activeAccount);
}

function updateExistingTransaction (key, action, name, date, freq, type, amount, tags, priority, ignoreBudget) {
    //console.log("updateExisting");
    //console.log(transData[key]);
    transData[key].name = name;
    transData[key].date = date.toISOString();
    transData[key].freq = freq;
    transData[key].amount = amount;
    transData[key].type = type;
    transData[key].tags = tags;

    if (priority === undefined) priority = 1;
    if (ignoreBudget === undefined) {
        // default ignore for 'one' time transactions
        ignoreBudget = (freq === 'one');
    }
    transData[key].priority = parseInt(priority);
    transData[key].ignoreBudget = ignoreBudget;

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
    for (var key in storedData.accounts[acctKey].transData) {
      if (storedData.accounts[acctKey].transData.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    keys.sort(compareTransDates);
    //console.log(keys);
    return keys;
}

function compareTransDates(key1, key2) {
    var date1 = storedData.accounts[acctKey].transData[key1].date;
    var date2 = storedData.accounts[acctKey].transData[key2].date;;
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
  // Start with today at midnight
  var payDate = new Date();
  payDate.setHours(23,59,59,0);
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
      logDate.setDate(logDate.getDate());
      forecastedBalance.push({date:logDate.toISOString(), balance:newBalance});
      //console.log("Add date");console.log(payDate);
    }
    // Increment one day
    payDate.setDate(payDate.getDate() + 1);
  }
  // restore initial conditions
  restoreWorkingDataFromLocalStorage();

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

function calculateWeeklyBudget(amount, freq, type) {
    var multiplier = 1;
    if (type == "bill") {
        multiplier = -1;
    }

    var freqFactor = 0;
    switch (freq) {
        case "wkl": freqFactor = 1; break;
        case "bwk": freqFactor = 0.5; break; // E6/2
        case "mon": freqFactor = 12/52; break; // E6*(12/52)
        case "bmn": freqFactor = 6/52; break; // E6*(6/52)
        case "qtr": freqFactor = 4/52; break; // E6*(4/52)
        case "san": freqFactor = 2/52; break; // E6*(2/52)
        case "anl": freqFactor = 1/52; break; // E6/52
        case "one": freqFactor = 0; break;
        default: freqFactor = 0;
    }

    return multiplier * amount * freqFactor;
}

function getAllTransactions() {
    var allTrans = [];
    for (var acctKey in storedData.accounts) {
        var account = storedData.accounts[acctKey];
        var acctName = account.name;

        for (var transKey in account.transData) {
            var trans = account.transData[transKey];
            // Clone and add metadata
            var transEntry = Object.assign({}, trans);
            transEntry.key = transKey;
            transEntry.acctKey = acctKey;
            transEntry.acctName = acctName;

            // Default Priority if missing
            if (!transEntry.priority) {
                transEntry.priority = 1;
            } else {
                transEntry.priority = parseInt(transEntry.priority);
            }

            // Default Ignore if missing
            if (transEntry.ignoreBudget === undefined) {
                 if (transEntry.freq == "one") {
                     transEntry.ignoreBudget = true;
                 } else {
                     transEntry.ignoreBudget = false;
                 }
            }

            transEntry.weeklyBudget = calculateWeeklyBudget(transEntry.amount, transEntry.freq, transEntry.type);

            allTrans.push(transEntry);
        }
    }

    // Sort
    allTrans.sort(function(a, b) {
        // 1. Deposits first
        if (a.type == 'dep' && b.type == 'bill') return -1;
        if (a.type == 'bill' && b.type == 'dep') return 1;

        // 2. Priority (1 is high, 20 is low) - Ascending order
        if (a.priority != b.priority) {
            return a.priority - b.priority;
        }

        // 3. Weekly Budget (Secondary)
        // Let's sort descending (Largest magnitude first)
        return Math.abs(b.weeklyBudget) - Math.abs(a.weeklyBudget);
    });

    return allTrans;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}
