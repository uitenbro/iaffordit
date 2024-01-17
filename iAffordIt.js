var activeTab = 'transactions'

function printMain() {

    select = activeTab
    // readStoredData();

    var main = document.createElement('div');
    main.id = 'main';

    var heading = document.createElement('h1');
    var accountName = document.createElement('a');  
    accountName.className = "acctname";
    accountName.appendChild(document.createTextNode(storedData.accounts[acctKey].name));
    accountName.href = "javascript:showAccountOptionsForm()";
    heading.appendChild(accountName)
    var dataSource = document.createElement('a');
    dataSource.className = "datasource";
    if (localStorage.getItem('googleData')) {
      dataSource.appendChild(document.createTextNode("google drive"));
    }
    else {
      dataSource.appendChild(document.createTextNode("local storage"));
    }

    dataSource.href = "javascript:displayGoogleDriveOptions()";
    heading.appendChild(dataSource);
    main.appendChild(heading);
    var ul = printForecastDetails();
    main.appendChild(ul);

    if (select == 'transactions') {

      var heading = document.createElement('h1');
      heading.appendChild(document.createTextNode("Transactions"));
      main.appendChild(heading);
      var ul = printTransactionList();
      main.appendChild(ul);

      // Update main with the new content
      document.getElementById('main').replaceWith(main);
      
    }

    else { // select == 'forecast'
      
      var heading = document.createElement('h1');
      heading.appendChild(document.createTextNode("Balance Forecast"));
      var excel = document.createElement('a')
      excel.className = "excel";
      excel.appendChild(document.createTextNode("excel"));
      excel.href = "javascript:;";
      heading.appendChild(excel);
      main.appendChild(heading);

      // var h1 = document.createElement('h1');
      // var forecast = printForecastTable(forecastedBalance);
      // h1.appendChild(forecast);
      // main.appendChild(h1);

      var graph = document.createElement('div');
      graph.id = "chartdiv";
      main.appendChild(graph);
      
      // Update main with the new content
      document.getElementById('main').replaceWith(main);

      // Update the forecast graph
      printVerticalStripChart(forecastedBalance);
    }

    
    // Make sure option panel is closed
    closeOptions();
}

function printTransactionList() {
    var ul = document.createElement('ul');
    var keys = sortedTransKeys();
    for (var i=0; i<keys.length; i++) {
        li = printTransaction(keys[i]);
        ul.appendChild(li);
    }
    return(ul);
}

function printForecastDetails() {
/*
<h1>Forecast Settings
<a style="float:right;margin-right:15px;text-decoration:none;color:rgb(76,86,108);" href="javascript:document.cookie = 'dir=;Path=/;Expires=Thu, 01 Jan 1970 00:00:01 GMT;';window.location.href='login.html'">nate.jenn</a>
</h1>

<ul>
<li><a class="smalldep" href="javascript:showhide('forecast_settings');showhide('main');">
5193.00
</a>
<a href="javascript:showhide('forecast_settings');showhide('main');"><b>Starting Balance</b></a>
<a href="javascript:showhide('forecast_settings');showhide('main');">Duration -
One Year
</a></li>
</ul>
*/
  var ul = document.createElement('ul');
  var li = document.createElement('li');
  var balance = document.createElement('a');
  if (forecastData.startBalance < 0) {
      balance.className = "smallbill";
  }
  else {
      balance.className = "smalldep";
  }
  balance.href= "javascript:showUpdateForecastForm()"
  balance.appendChild(document.createTextNode((forecastData.startBalance).toFixed(2)));
  li.appendChild(balance);
  var label = document.createElement('a');
  label.href= "javascript:showUpdateForecastForm()";
  label.style.fontWeight = "bold";
  label.appendChild(document.createTextNode("Starting Balance"));
  li.appendChild(label);
  var duration = document.createElement('a');
  duration.href= "javascript:showUpdateForecastForm()"
  duration.appendChild(document.createTextNode("Duration - " + printDuration()));
  li.appendChild(duration);
  ul.appendChild(li)

  return ul;
}

function printForecastTable(forecastedBalance) {

  //var forecastedBalance = forecastBalance();


  var forecast = document.createElement('ul');
  forecast.className = "graphContainer";
  var table = document.createElement('table');
  table.className = "graph";
  var tbody = document.createElement('tbody');

  // Header row
  var tr = document.createElement('tr');
  tr.className = "graphHeader";
  var td = document.createElement('td');
  td.appendChild(document.createTextNode("Date"));
  td.className = "graphDate";
  tr.appendChild(td);
  var td = document.createElement('td');
  td.appendChild(document.createTextNode("Balance"));
  td.className = "graphBalance";
  tr.appendChild(td);
  var td = document.createElement('td');
  td.appendChild(document.createTextNode("[] $" + forecastData.graphTick));
  td.colSpan = "2";
  tr.appendChild(td);
  tbody.appendChild(tr);

  for (var i=0; i<forecastedBalance.length; i++) {

    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.className = "graphDate";
    var date = new Date(forecastedBalance[i].date);
    var dateString = date.toISOString().split('T')[0];
    dateString = dateString.split('-');
    td.appendChild(document.createTextNode(dateString[1]+'-'+dateString[2]+'-'+dateString[0]));
    tr.appendChild(td);
    var td = document.createElement('td');
    td.className = "graphBalance";
    td.appendChild(document.createTextNode(forecastedBalance[i].balance.toFixed(2)));
    tr.appendChild(td);
    var graphString = "";
    for (var j=0; j<Math.abs(forecastedBalance[i].balance); j+=forecastData.graphTick) {
      graphString += "[]"
    }
    var negTd = document.createElement('td');
    var posTd = document.createElement('td');
    // TODO: make thresholds configurable
    if (forecastedBalance[i].balance >= 2000) {
      tr.className = "green";
      posTd.appendChild(document.createTextNode(graphString));
    }
    else if (forecastedBalance[i].balance >= 1000) {
      tr.className = "black";
      posTd.appendChild(document.createTextNode(graphString));
    }
    else if (forecastedBalance[i].balance >= 0) {
      tr.className = "darkorange";
      posTd.appendChild(document.createTextNode(graphString));
    }
    else if (forecastedBalance[i].balance >= -1000) {
      tr.className = "red";
      negTd.appendChild(document.createTextNode(graphString));
    }
    else {
      tr.className = "purple";
      negTd.appendChild(document.createTextNode(graphString));
    }
    tr.appendChild(negTd);
    tr.appendChild(posTd);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  forecast.appendChild(table);

  return forecast;
}

function printTransaction(key) {
/*
<li><a class="smallbill" href="javascript:var index=49;showOptions('optionpanel49');showOptions('main');">2000.00</a>
<a href="javascript:var index=49;showOptions('optionpanel49');showOptions('main');"><b>SPRING BREAK</b></a>
<a href="javascript:var index=49;showOptions('optionpanel49');showOptions('main');">03/01/18 - anl</a>
</li>
*/
    var li = document.createElement('li');
    var amount = document.createElement('a');
    amount.href = "javascript:showOptions(" + key + ");"
    if (transData[key].type == "bill") {
        amount.className = "smallbill";
    }
    else {
        amount.className = "smalldep";
    }
    var printAmount = (transData[key].amount).toFixed(2);
    amount.appendChild(document.createTextNode(printAmount));
    li.appendChild(amount);
    var name = document.createElement('a');
    name.href = "javascript:showOptions(" + key + ");"
    name.appendChild(document.createTextNode(transData[key].name));
    name.style.fontWeight = "bold";
    li.appendChild(name);
    var date = document.createElement('a');
    date.href = "javascript:showOptions(" + key + ");"
    var dateString = new Date(transData[key].date).toDateString();
    date.appendChild(document.createTextNode(dateString + ' - ' + transData[key].freq + ' '));
    li.appendChild(date);
    if (transData[key].tags != "") {
    	var re = /\s+/;
    	var tags = transData[key].tags.split(re);
	    for (var i=0; i<tags.length; i++) {
	        var tag = document.createElement('span');
	        tag.href = "javascript:showOptions(" + key + ");"
	        tag.className = "tag";
	        tag.appendChild(document.createTextNode(tags[i]));
	        date.appendChild(tag);
	    }
	}

    return li;
}

function printBalanceForecast() {

}

function showOptions(key) {
/*
		<div id="optionpanel0" class="optionpanel" style="display: none;">
		<img src="../images/cancel.png" onClick="showhide('main');showhide('optionpanel0')" />
		<ul><li id="current_trans"><small class="bill">30.00</small>
		<a>Mowers</a>
		<a style="text-align:left";>07/04/17 - wkl</a></li></ul>
		<p>
		<a href="update_trans.pl?action=pay&amp;index=0" class="green button">Pay</a>
		<a href="edit_trans.pl?action=one&amp;index=0" class="black button">Edit Current</a>
		<a href="edit_trans.pl?action=all&amp;index=0" class="black button">Edit Series</a>
		<a href="update_trans.pl?action=del&amp;index=0" class="red button">Delete</a>
		</p>
		</div>

*/
    var div = document.createElement('div');
    div.id = "options";
    div.className="optionpanel";
    div.style.display = 'block'

    // Cancel
    var cancel = document.createElement('a');
    var img = document.createElement('img');
    img.src = "images/cancel.png";
    cancel.appendChild(img);
    cancel.href = "javascript:closeOptions();";
    div.appendChild(cancel);

    // Transaction detail
    var ul = document.createElement('ul');
    var li = printTransaction(key);
    ul.appendChild(li);
    div.appendChild(ul)

    // Action Buttons
    buttonContainer = document.createElement('p');

    // Pay
    var pay = document.createElement('a');
    pay.className = "green button";
    pay.href = "javascript:updateTransaction(" + key + ", 'pay');closeOptions();";
    pay.appendChild(document.createTextNode("Pay"));
    buttonContainer.appendChild(pay);

    // Pay to Now
    var pay = document.createElement('a');
    pay.className = "green button";
    pay.href = "javascript:updateTransaction(" + key + ", 'pay2now');closeOptions();";
    pay.appendChild(document.createTextNode("Pay to Now"));
    buttonContainer.appendChild(pay);

    if (transData[key].freq != "one") {
      // Edit Current
      var one = document.createElement('a');
      one.className = "black button";
      one.href = "javascript:showEditTransactionForm(" + key + ", 'one');";
      one.appendChild(document.createTextNode("Edit Current"));
      buttonContainer.appendChild(one);


      // Edit Series
      var all = document.createElement('a');
      all.className = "black button";
      all.href = "javascript:showEditTransactionForm(" + key + ", 'all');";
      all.appendChild(document.createTextNode("Edit Series"));
      buttonContainer.appendChild(all);
    }
    else {
      // Edit the only one
      var one = document.createElement('a');
      one.className = "black button";
      one.href = "javascript:showEditTransactionForm(" + key + ", 'all');";
      one.appendChild(document.createTextNode("Edit"));
      buttonContainer.appendChild(one);
    }

    // Delete
    var del = document.createElement('a');
    del.className = "red button";
    del.href = "javascript:updateTransaction(" + key + ", 'delete');";
    del.appendChild(document.createTextNode("Delete"));
    buttonContainer.appendChild(del);

    // Add to the page and hide main panel
    div.appendChild(buttonContainer);
    document.getElementById('options').replaceWith(div);
    document.getElementById('main').style.display = 'none';
    window.scrollTo(0, 0);
}

function closeOptions() {
    document.getElementById('header').style.display = 'block';
    document.getElementById('main').style.display = 'block';
    document.getElementById('options').style.display = 'none';
}

function showAccountOptionsForm() {
 var div = document.createElement('div');
  div.id = "options";
  div.className="optionpanel";
  div.style.display = 'block';

  var img = document.createElement('img');
  img.src = "images/cancel.png";
  var cancel = document.createElement('a');
  cancel.appendChild(img);
  cancel.href = "javascript:closeOptions();";
  div.appendChild(cancel);

  // Account List
  var ul = document.createElement('ul');

  // Form
  var form = document.createElement('form');
  //form.method = "post";
  //form.action = "javascript:updateForecastSettings(forecastSettings)";
  form.name = "accountUpdateForm";

  // Accounts
  var li = document.createElement('li')
  li.appendChild(document.createTextNode("Accounts"));
  form.appendChild(li);
  var li = document.createElement('li');
  var accountList = document.createElement('select');
  accountList.name = "accountSelect";
  accountList.size = 4;
  for (key in storedData.accounts ) {
    var option = document.createElement('option');
    option.value = key;
    if (key == acctKey) {option.selected = "selected";}
    option.appendChild(document.createTextNode(storedData.accounts[key].name)); 
    accountList.appendChild(option);
  }
  li.appendChild(accountList);
  form.appendChild(li);
  ul.appendChild(form);
  div.appendChild(ul);

  // Action Buttons
  buttonContainer = document.createElement('p');

  // Select Account
  var forecast = document.createElement('a');
  forecast.className = "black button";
  forecast.href = "javascript:setActiveAccount(document.accountUpdateForm.accountSelect.value)";
  forecast.appendChild(document.createTextNode("Select"));
  buttonContainer.appendChild(forecast);

  // Rename Account
  var forecast = document.createElement('a');
  forecast.className = "black button";
  forecast.href = "javascript:renameAccount(document.accountUpdateForm.accountSelect.value)";
  forecast.appendChild(document.createTextNode("Rename"));
  buttonContainer.appendChild(forecast);

  // Delete
  var save = document.createElement('a');
  save.className = "black button";
  save.href = "javascript:deleteAccount(document.accountUpdateForm.accountSelect.value);";
  save.appendChild(document.createTextNode("Delete"));
  buttonContainer.appendChild(save);

    // New Account
  var save = document.createElement('a');
  save.className = "black button";
  save.href = "javascript:createNewAccount();";
  save.appendChild(document.createTextNode("New"));
  buttonContainer.appendChild(save);

  // Add to the page and hide main panel
  div.appendChild(buttonContainer);
  document.getElementById('options').replaceWith(div);
  document.getElementById('main').style.display = 'none';
  window.scrollTo(0, 0);


}

function showUpdateForecastForm() {
/*
<div id="forecast_settings" style="display: none;">
<img src="../images/cancel.png" onClick="showhide('main');showhide('forecast_settings');"/>
<ul>
<form name="forecast" method="post" action="money.pl">
<input type="hidden" name="save_only" value="no"/>
<input type="hidden" name="start_date" size="10" value="8/20/2017"/>
<li>Starting Balance</li>
<li><input type="number" name="start_balance" value="5193.00" onChange="checkFormat()"</li>
<li>Forecast Duration</li>
<li>
<select name="duration">
<option value="7">One Week</option>
<option value="14">Two Weeks</option>
<option value="30">One Month</option>
<option value="91">Three Months</option>
<option value="183">Six Months</option>
<option value="365" selected="selected" >One Year</option>
<option value="1095">Three Years</option>
<option value="1825">Five Years</option>
</select></li>

<li>Graph Tick Width</li>
<li>
<select name="tick">
<option value="10000" selected="selected" >$100</option>
<option value="20000">$200</option>
<option value="50000">$500</option>
<option value="75000">$750</option>
<option value="100000">$1000</option>
</select></li>

</form>
</ul>
<p><a href="#" class="black button" onclick="javascript:document.forecast.submit();">Forecast</a>
<a href="#" class="black button" onclick="javascript:document.forecast.save_only.value='yes';document.forecast.submit();">Save</a></p>
</div>
*/

  var div = document.createElement('div');
  div.id = "options";
  div.className="optionpanel";
  div.style.display = 'block';

  var img = document.createElement('img');
  img.src = "images/cancel.png";
  var cancel = document.createElement('a');
  cancel.appendChild(img);
  cancel.href = "javascript:closeOptions();";
  div.appendChild(cancel);

  // Forecast detail
  var ul = document.createElement('ul');

  // Form
  var form = document.createElement('form');
  //form.method = "post";
  //form.action = "javascript:updateForecastSettings(forecastSettings)";
  form.name = "forecastSettings";

  // Start Date
  var startDate = document.createElement('input');
  startDate.value = new Date();
  startDate.type = "hidden";
  startDate.name = "startDate";
  form.appendChild(startDate);

  // Save Only
  var saveOnly = document.createElement('input');
  saveOnly.value = "no";
  saveOnly.type = "hidden";
  saveOnly.name = "saveOnly";
  form.appendChild(saveOnly);

  // Starting Balance
  var li = document.createElement('li')
  li.appendChild(document.createTextNode("Starting Balance"));
  form.appendChild(li);
  var li = document.createElement('li');
  var startBalance = document.createElement('input');
  startBalance.type = "number";
  startBalance.name = "startBalance";
  startBalance.value = forecastData.startBalance.toFixed(2);
  //startBalance.onChange = checkFormat();
  li.appendChild(startBalance);
  form.appendChild(li);

  // Forecast Duration
  var li = document.createElement('li')
  li.appendChild(document.createTextNode("Forecast Duration"));
  form.appendChild(li);
  var li = document.createElement('li');
  var forecastDuration = document.createElement('select');
  forecastDuration.name = "forecastDuration";
  var option = document.createElement('option');
  option.value = 7;
  if (forecastData.forecastDuration == option.value) {option.selected = "selected";}
  option.appendChild(document.createTextNode("One Week"));
  forecastDuration.appendChild(option);
  var option = document.createElement('option');
  option.value = 14;
  if (forecastData.forecastDuration == option.value) {option.selected = "selected";}
  option.appendChild(document.createTextNode("Two Weeks"));
  forecastDuration.appendChild(option);
  var option = document.createElement('option');
  option.value = 30;
  if (forecastData.forecastDuration == option.value) {option.selected = "selected";}
  option.appendChild(document.createTextNode("One Month"));
  forecastDuration.appendChild(option);
  var option = document.createElement('option');
  option.value = 91;
  if (forecastData.forecastDuration == option.value) {option.selected = "selected";}
  option.appendChild(document.createTextNode("Three Months"));
  forecastDuration.appendChild(option);
  var option = document.createElement('option');
  option.value = 183;
  if (forecastData.forecastDuration == option.value) {option.selected = "selected";}
  option.appendChild(document.createTextNode("Six Months"));
  forecastDuration.appendChild(option);
  var option = document.createElement('option');
  option.value = 365;
  if (forecastData.forecastDuration == option.value) {option.selected = "selected";}
  option.appendChild(document.createTextNode("One Year"));
  forecastDuration.appendChild(option);
  var option = document.createElement('option');
  option.value = 1095;
  if (forecastData.forecastDuration == option.value) {option.selected = "selected";}
  option.appendChild(document.createTextNode("Three Years"));
  forecastDuration.appendChild(option);
  var option = document.createElement('option');
  option.value = 1825;
  if (forecastData.forecastDuration == option.value) {option.selected = "selected";}
  option.appendChild(document.createTextNode("Five Years"));
  forecastDuration.appendChild(option);
  //TODO: Add custom duration
  li.appendChild(forecastDuration);
  form.appendChild(li);

  var li = document.createElement('li');
  li.appendChild(document.createTextNode("Graph Tick Width"));
  form.appendChild(li);
  var li = document.createElement('li');
  var graphTick = document.createElement('select');
  graphTick.name = "graphTick";
  var option = document.createElement('option');
  option.value = 100;
  if (forecastData.graphTick == option.value) {option.selected = "selected";}
  option.appendChild(document.createTextNode("$100"));
  graphTick.appendChild(option)
  var option = document.createElement('option');
  option.value = 250;
  if (forecastData.graphTick == option.value) {option.selected = "selected";}
  option.appendChild(document.createTextNode("$250"));
  graphTick.appendChild(option);
  var option = document.createElement('option');
  option.value = 500;
  if (forecastData.graphTick == option.value) {option.selected = "selected";}
  option.appendChild(document.createTextNode("$500"));
  graphTick.appendChild(option);
  var option = document.createElement('option');
  option.value = 750;
  if (forecastData.graphTick == option.value) {option.selected = "selected";}
  option.appendChild(document.createTextNode("$750"));
  graphTick.appendChild(option);
  var option = document.createElement('option');
  option.value = 1000;
  if (forecastData.graphTick == option.value) {option.selected = "selected";}
  option.appendChild(document.createTextNode("$1000"));
  graphTick.appendChild(option);
  li.appendChild(graphTick);
  form.appendChild(li);
  ul.appendChild(form);
  div.appendChild(ul);

  // Action Buttons
  buttonContainer = document.createElement('p');

  // Forecast
  var forecast = document.createElement('a');
  forecast.className = "black button";
  forecast.href = "javascript:updateForecastSettings();forecastBalance();activeTab='forecast';printHeader();printMain();";
  forecast.appendChild(document.createTextNode("Forecast"));
  buttonContainer.appendChild(forecast);

  // Save
  var save = document.createElement('a');
  save.className = "black button";
  save.href = "javascript:updateForecastSettings();";
  save.appendChild(document.createTextNode("Save"));
  buttonContainer.appendChild(save);

  // Add to the page and hide main panel
  div.appendChild(buttonContainer);
  document.getElementById('options').replaceWith(div);
  document.getElementById('main').style.display = 'none';
  window.scrollTo(0, 0);

}

function showEditTransactionForm(key, action) {
/*
<h1>Edit Transaction</h1>
<ul>
<form name= "update_trans" method="post" action="update_trans.pl">
<input type="hidden" name="action" value="one"/>
<input type="hidden" name="index" value="0"/>
<li>Date</li>
<li><input type="date" name="date" size="7" value="2017-09-01"/></li>
<li>Name</li>
<li><input type="text" name="name" size="20" value="On Duty Security System" autocorrect="on" autocapitalize="on"/></li>
<li>Frequency</li>
<li>once</li><li>Type</li><li><select name="type">
<option selected="selected" value="bill">bill</option>
<option value="dep">deposit</option>
</select></li>
<li>Amount</li><li><input type="number" size="10" name="amount" value="81.00" /></li>
<li>Tags</li>
<li><input type="text" name="tags" size="20" value="check"/></li>
</form></ul>
*/

  if (transData[key] == undefined) {
    key = "'newKey'";
  }
  var div = document.createElement('div');
  div.id = "options";
  div.className="optionpanel";
  div.style.display = 'block';

  var img = document.createElement('img');
  img.src = "images/cancel.png";
  var cancel = document.createElement('a');
  cancel.appendChild(img);
  cancel.href = "javascript:closeOptions();";
  div.appendChild(cancel);

  // Transaction detail
  var ul = document.createElement('ul');

  // Form
  var form = document.createElement('form');
  //form.method = "post";
  //form.action = "javascript:updateForecastSettings(forecastSettings)";
  form.name = "editTransaction";

  // Action
  var actionInput = document.createElement('input');
  actionInput.value = action;
  actionInput.type = "hidden";
  actionInput.name = "action";
  form.appendChild(actionInput);

  //var h1 = document.createElement('h1');
  //h1.appendChild(document.createTextNode("Edit Transaction"));
  //form.appendChild(h1);

  // Date
  var li = document.createElement('li')
  li.appendChild(document.createTextNode("Date"));
  form.appendChild(li);
  var li = document.createElement('li');
  var date = document.createElement('input');
  date.type = "date";
  date.name = "date";
  if (storedData.accounts[acctKey].transData[key] != undefined) {
    date.value = storedData.accounts[acctKey].transData[key].date.split('T')[0];
    var timezone = storedData.accounts[acctKey].transData[key].date.split('T')[1]
  }
  else {
    var newDate = new Date();
    date.value = newDate.toISOString().split('T')[0];
    var timezone = newDate.toISOString().split('T')[1];
  }
  li.appendChild(date);
  form.appendChild(li);

  // Timezone
  var time = document.createElement('input');
  time.value = "T"+ timezone;
  time.type = "hidden";
  time.name = "timezone";
  form.appendChild(time);

  // Name
  var li = document.createElement('li')
  li.appendChild(document.createTextNode("Name"));
  form.appendChild(li);
  var li = document.createElement('li');
  var name = document.createElement('input');
  name.type = "text";
  name.name = "name";
  if (transData[key] != undefined) {
    name.value = transData[key].name;
  }
  li.appendChild(name);
  form.appendChild(li);

  // Frequency
  var li = document.createElement('li')
  li.appendChild(document.createTextNode("Frequency"));
  form.appendChild(li);
  var li = document.createElement('li');
  var freq = document.createElement('select');
  freq.name = "freq";

  if (action == "one") {
    var option = document.createElement('option');
    option.value = "one";
    option.selected = "selected";
    option.appendChild(document.createTextNode("once"));
    freq.appendChild(option);
  }
  else { // action = all, new
    var option = document.createElement('option');
    option.value = "one";
    if (transData[key] != undefined) {
      if (transData[key].freq == option.value) {option.selected = "selected";}
    }    option.appendChild(document.createTextNode("once"));
    freq.appendChild(option);
    var option = document.createElement('option');
    option.value = "wkl";
    if (transData[key] != undefined) {
      if (transData[key].freq == option.value) {option.selected = "selected";}
    }
    option.appendChild(document.createTextNode("weekly"));
    freq.appendChild(option);
    var option = document.createElement('option');
    option.value = "bwk";
    if (transData[key] != undefined) {
        if (transData[key].freq  == option.value) {option.selected = "selected";}
    }
    option.appendChild(document.createTextNode("bi-weekly"));
    freq.appendChild(option);
    var option = document.createElement('option');
    option.value = "mon";
    if (transData[key] != undefined) {
      if (transData[key].freq  == option.value) {option.selected = "selected";}
    }
    else {
      option.selected = "selected";
    }
    option.appendChild(document.createTextNode("monthly"));
    freq.appendChild(option);
    var option = document.createElement('option');
    option.value = "bmn";
    if (transData[key] != undefined) {
      if (transData[key].freq  == option.value) {option.selected = "selected";}
    }
    option.appendChild(document.createTextNode("bi-monthly"));
    freq.appendChild(option);
    var option = document.createElement('option');
    option.value = "qtr";
    if (transData[key] != undefined) {
      if (transData[key].freq == option.value) {option.selected = "selected";}
    }
    option.appendChild(document.createTextNode("quarterly"));
    freq.appendChild(option);
    var option = document.createElement('option');
    option.value = "san";
    if (transData[key] != undefined) {
      if (transData[key].freq == option.value) {option.selected = "selected";}
    }
    option.appendChild(document.createTextNode("semi-annually"));
    freq.appendChild(option);
    var option = document.createElement('option');
    option.value = "anl";
    if (transData[key] != undefined) {
      if (transData[key].freq == option.value) {option.selected = "selected";}
    }
    option.appendChild(document.createTextNode("annually"));
    freq.appendChild(option);
  }
  //TODO: Add custom freq
  li.appendChild(freq);
  form.appendChild(li);

  // Type
  var li = document.createElement('li');
  li.appendChild(document.createTextNode("Type"));
  form.appendChild(li);
  var li = document.createElement('li');
  var type = document.createElement('select');
  type.name = "type";
  var option = document.createElement('option');
  option.value = "bill";
  if (transData[key] != undefined) {
    if (transData[key].type == option.value) {option.selected = "selected";}
  }
  else {
    option.selected = "selected";
  }
  option.appendChild(document.createTextNode("bill"));
  type.appendChild(option)
  var option = document.createElement('option');
  option.value = "dep";
  if (transData[key] != undefined) {
    if (transData[key].type == option.value) {option.selected = "selected";}
  }
  option.appendChild(document.createTextNode("deposit"));
  type.appendChild(option);
  li.appendChild(type);
  form.appendChild(li);

  // Amount
  var li = document.createElement('li')
  li.appendChild(document.createTextNode("Amount"));
  form.appendChild(li);
  var li = document.createElement('li');
  var amount = document.createElement('input');
  amount.type = "number";
  amount.name = "amount";
  if (transData[key] != undefined) {
    amount.value = transData[key].amount.toFixed(2);
  }
  li.appendChild(amount);
  form.appendChild(li);

  // Tags
  var li = document.createElement('li')
  li.appendChild(document.createTextNode("Tags"));
  form.appendChild(li);
  var li = document.createElement('li');
  var tags = document.createElement('input');
  tags.type = "text";
  tags.name = "tags";
  if (transData[key] != undefined) {
    tags.value = transData[key].tags;
  }
  li.appendChild(tags);
  form.appendChild(li);

  ul.appendChild(form);
  div.appendChild(ul);

  // Action Buttons
  buttonContainer = document.createElement('p');

  // Save
  var save = document.createElement('a');
  save.className = "black button";
  save.href = "javascript:updateTransaction("+ key + ", '" + action + "');";
  save.appendChild(document.createTextNode("Save"));
  buttonContainer.appendChild(save);

  // Add to the page and hide main panel
  div.appendChild(buttonContainer);
  document.getElementById('options').replaceWith(div);
  document.getElementById('main').style.display = 'none';
  window.scrollTo(0, 0);

}

function printHeader() {
/*
	<h1>iAfford It</h1>
	<a href="edit_trans.pl?action=new&amp;index=9999" class="Action" id="leftActionButton">New</a>
	<!--<a href="javascript:showhide('forecast_settings');" -->
	<a href="javascript:document.forecast.submit();"
	class="Action">Forecast</a>
*/
    var select = activeTab
    var div = document.createElement('div');
    div.id = "header";
    var h1 = document.createElement('h1');
    h1.appendChild(document.createTextNode("iAfford It"));
    div.appendChild(h1);

    if (select == 'transactions') {
      var newTrans = document.createElement('a');
      newTrans.id = "leftActionButton";
      newTrans.href = "javascript:showEditTransactionForm('newKey', 'new');";
      newTrans.appendChild(document.createTextNode("New"));
      div.appendChild(newTrans);
    }
    else {
      var transList = document.createElement('a');
      transList.id = "leftActionButton";
      transList.href = "javascript:activeTab='transactions';printHeader();printMain();";
      transList.appendChild(document.createTextNode("Transactions"));
      div.appendChild(transList);
    }

    var forecast = document.createElement('a');
    forecast.id = "Action";
    forecast.href = "javascript:forecastBalance();activeTab='forecast';printHeader();printMain();";
    forecast.appendChild(document.createTextNode("Forecast"));
    div.appendChild(forecast);
    document.getElementById('header').replaceWith(div);
}


function printDuration() {
  switch (forecastData.forecastDuration) {
    case 7: {
      durationString = "One Week";
      break;
    }
    case 14: {
      durationString = "Two Week";
      break;
    }
    case 30: {
      durationString = "One Month";
      break;
    }
    case 91: {
      durationString = "Three Months";
      break;
    }
    case 183: {
      durationString = "Six Months";
      break;
    }
    case 365: {
      durationString = "One Year";
      break;
    }
    case 1095: {
      durationString = "Three Years";
      break;
    }
    case 1825: {
      durationString = "Five Years";
      break;
    }
    default: {
      durationString = forecastData.duration + " Days";
      break;
    }
  }

  return durationString;
}
