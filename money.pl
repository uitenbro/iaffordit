#!/usr/bin/perl -w
use cPanelUserConfig;
use Switch;

#$TRANS_FILE = "/usr/home/web/n/nathanu/cgi-bin/money/transactions.dat";
#$TRANS_FILE = "/Users/uitenbro/Sites/cgi-bin/money/transactions.dat";

# Determine Transaction File
#$TRANS_FILE = "$ENV{'SCRIPT_FILENAME'}";
$DIR = &get_cookie("dir");
$DIR =~ /Users\/(.*?)$/;
$USER = "$1";
if ($DIR ne "") {
	$TRANS_FILE= "$DIR/transactions.dat";
	$BALANCE_FILE = "$DIR/balance.dat";
	$PASSWD_FILE = "$DIR/passwd.dat";
	$EXCEL_FILE = "$DIR/excel.xls";
	$EXCEL_URL = "http://$ENV{'HTTP_HOST'}$ENV{'SCRIPT_NAME'}";
	$EXCEL_URL =~ s/$ENV{'SCRIPT_NAME'}/\/Users\/$USER\/excel\.xls/;

	if (!((-e $TRANS_FILE) && (-e $BALANCE_FILE) && (-e $PASSWD_FILE))) {
		print "Location: login.html?retry=nofiles\n\n";
	}
}
else {
	print "Location: login.html?retry=nocookie\n\n";
}

#$MONEY_URL = "http://$ENV{'HTTP_HOST'}/cgi-bin/money/money.pl";
$MONEY_URL = "http://$ENV{'HTTP_HOST'}$ENV{'SCRIPT_NAME'}";

#print "<br/><b><br/>$TRANS_FILE<br/>$MONEY_URL<br/>";
# Read in text from command line
if ($ENV{'REQUEST_METHOD'} eq "GET") {
  $in = $ENV{'QUERY_STRING'};
  #print "Get $in<br/>";
}
elsif ($ENV{'REQUEST_METHOD'} eq "POST") {
  read(STDIN,$in,$ENV{'CONTENT_LENGTH'});
  #print "Post $in<br/>";
}
# Split all items
@in = split(/&/,$in);
foreach $i (0 .. $#in) {
  # Convert plus's to spaces
  $in[$i] =~ s/\+/ /g;

  # Convert %XX from hex numbers to alphanumeric
  $in[$i] =~ s/%(..)/pack("c",hex($1))/ge;

  # Split into key and value.
  $loc = index($in[$i],"=");
  $key = substr($in[$i],0,$loc);
  $val = substr($in[$i],$loc+1);
  $in{$key} .= '\0' if (defined($in{$key})); # \0 is the multiple separator
  $in{$key} .= $val;
}

$start_date = $in{'start_date'};

# convert dollars and cents to cents for all future calculations
if ($in{'start_balance'} =~ /(\d+)\.(\d+)/) {
  $start_balance = $1*100 + $2;
}
elsif ($in{'start_balance'} =~ /(\d+)/)  {
  $start_balance = $1*100;
}

$duration = $in{'duration'};
$tick = $in{'tick'};

$pstart_balance = $start_balance;
if ($pstart_balance eq "") {
	#read from file
	open(BALFILE,"<$BALANCE_FILE");
	$stored_balance=<BALFILE>;
	close(BALFILE);
	$stored_balance =~ /<balance>([\d\.]+)<\/balance><duration>(\d+)<\/duration><tick>(\d+)<\/tick>/;
	$pstart_balance = $1;
	$duration = $2;
	$tick = $3;
}
else {
	$pstart_balance =~ s/(..)\z/\.$1/;
	# add a leading zero if no dollars only cents
	$pstart_balance =~ s/^\./0\./;
	#write to file
	open(BALFILE,">$BALANCE_FILE");
	print BALFILE "<balance>$pstart_balance</balance><duration>$duration</duration><tick>$tick<\/tick>";
	close (BALFILE);
}


# Read the file
open(RDFL,"<$TRANS_FILE");
@content=<RDFL>;
close(RDFL);

$content = join( "", @content);
@transactions = $content =~ /<transaction>(.*?)<\/transaction>/sg;
@sorted = sort compareDates @transactions;


# delete the transaction file (regenerate with validated data)
open(WRFL,">$TRANS_FILE");

$count = 0;
# Parse the data into local variables
foreach $trans (@sorted) {
  # write lines that match the format back to the file
  print WRFL "<transaction>$trans</transaction>\n\n";
  
  # if the line matches the input format
  if ($trans =~ /<date>(\d+)\/(\d+)\/(\d+)<\/date>\s*<name>(.*?)<\/name>\s*<freq>(\w+)<\/freq>\s*<type>(\w+)<\/type>\s*<amount>(\d+)\.(\d+)<\/amount>\s*<tags>(.*?)<\/tags>/) {

    #print "$trans";
    $tmon[$count] = $1;
    $tday[$count] = $2;
    $tyear[$count] = $3;
    if ($tyear[$count] < 100) {
         $tyear[$count] = 2000 + $tyear[$count];
    }
    $name[$count] = $4;
    $freq[$count] = $5;
    $type[$count] = $6;
    $amount[$count] = $7 * 100 + $8;
    $tags[$count] = $9;
    $count++;
  }
}
print WRFL "\n";
close(WRFL);

# Get current date

($sec,$min,$hour,$cday,$cmon,$cyear,$wday,$yday,$isdst) = localtime(time);
$cyear+=1900;
$cmon+=1;

&printTopofPage;
#&printGoogleMobileAd;
#&printAdMobAd;

if ($start_balance != "" and $in{'save_only'} eq "no") {
  print "\n\n<div id=\"main\">\n";
  &print_forecast_settings;
  &forecastBalance;
  #&print_revenue;
  print "</div>\n";

}
else {
  print "\n\n<div id=\"main\">\n";
    &print_forecast_settings;
	&printTrans;
	#&print_revenue;
	print "</div>\n";
	&printTransOpt;
}

# Get current date
($sec,$min,$hour,$cday,$cmon,$cyear,$wday,$yday,$isdst) = localtime(time);
$cyear+=1900;
$cmon+=1;

&printForecastForm;


print "</body></html>\n";

sub printTrans {

print <<TRANSHEADER;

<h1>Transactions</h1>
<ul>	

TRANSHEADER

  # print the list of transactions

  #print "Count = $count<br/>";

  for ($i=0; $i<$count; $i++) {

    $pmon = sprintf("%02d", $tmon[$i]);

    $pday = sprintf("%02d", $tday[$i]);

    $pyear = sprintf("%02d", $tyear[$i] % 100);

    $pamount = $amount[$i];

    $pamount =~ s/(..)\z/\.$1/;
    $pamount =~ s/^\./0\./;
	
	print "\n<li>";
	print "<a class=\"small$type[$i]\" href=\"javascript:var index=$i;showhide('optionpanel$i');showhide('main');\">";
	print "$pamount</a>\n";
	print "<a href=\"javascript:var index=$i;showhide('optionpanel$i');showhide('main');\">";
	print "<b>$name[$i]</b></a>\n";
	print "<a href=\"javascript:var index=$i;showhide('optionpanel$i');showhide('main');\">";
	print "$pmon\/$pday\/$pyear - $freq[$i]";

    foreach $tag (split(/\s+/, $tags[$i])) {
        print "\n\t<span class=\"tag\">$tag</span>"; 
    }
	print "</a>\n</li>\n\n";
    
  }
  print "</ul>\n\n\n";

  return;
}
sub printTransOpt {

  # print the list of transactions

  #print "Count = $count<br/>";

  for ($i=0; $i<$count; $i++) {
	
    $pmon = sprintf("%02d", $tmon[$i]);

    $pday = sprintf("%02d", $tday[$i]);

    $pyear = sprintf("%02d", $tyear[$i] % 100);

    $pamount = $amount[$i];

    $pamount =~ s/(..)\z/\.$1/;
    $pamount =~ s/^\./0\./;
	
  	print <<OPTIONPANEL1;		
		<div id="optionpanel$i" class="optionpanel" style="display: none;">
		<img src="images/cancel.png" onClick="showhide('main');showhide('optionpanel$i')" />
		<ul><li id="current_trans"><small class="$type[$i]">$pamount</small>
		<a>$name[$i]</a>
		<a style="text-align:left";>$pmon\/$pday\/$pyear - $freq[$i]</a></li></ul>
		<p>
		<a href="update_trans.pl?action=pay&amp;index=$i" class="green button">Pay</a>
OPTIONPANEL1
	
	if ("$freq[$i]" eq "one") {
		print <<OPTIONPANEL2a;
		<a href="edit_trans.pl?action=all&amp;index=$i" class="black button">Edit</a>
		<a href="update_trans.pl?action=del&amp;index=$i" class="red button">Delete</a>
		</p> 
		</div>
OPTIONPANEL2a

	}
	else {
		print <<OPTIONPANEL2b;
		<a href="edit_trans.pl?action=one&amp;index=$i" class="black button">Edit Current</a>
		<a href="edit_trans.pl?action=all&amp;index=$i" class="black button">Edit Series</a>
		<a href="update_trans.pl?action=del&amp;index=$i" class="red button">Delete</a>
		</p> 
		</div>
OPTIONPANEL2b
	}
    
  }
  
  return;

}


sub printForecastForm {
print <<FORECASTFORM1;
<div id="forecast_settings" style="display: none;">
<img src="images/cancel.png" onClick="showhide('main');showhide('forecast_settings');"/>
<ul>
<form name="forecast" method="post" action="money.pl">
<input type="hidden" name="save_only" value="no"/>
<input type="hidden" name="start_date" size="10" value="$cmon/$cday/$cyear"/>
<li>Starting Balance</li>
<li><input type="number" name="start_balance" value="$pstart_balance" onChange="checkFormat()"</li>	
<li>Forecast Duration</li>
<li>
FORECASTFORM1

print "<select name=\"duration\">\n<option value=\"7\"";

if ($duration == 7) {print " selected=\"selected\" ";}

print ">One Week</option>\n<option value=\"14\"";

if ($duration == 14) {print " selected=\"selected\" ";}

print ">Two Weeks</option>\n<option value=\"30\"";

if ($duration == 30) {print " selected=\"selected\" ";}

print ">One Month</option>\n<option value=\"91\"";

if ($duration == 91) {print " selected=\"selected\" ";}

print ">Three Months</option>\n<option value=\"183\"";

if ($duration == 183) {print " selected=\"selected\" ";}

print ">Six Months</option>\n<option value=\"365\"";

if (($duration == 365) || ($duration == "")) {print " selected=\"selected\" ";}

print ">One Year</option>\n<option value=\"730\"";

if ($duration == 730) {print " selected=\"selected\" ";}

print ">Two Years</option>\n<option value=\"1095\"";

if ($duration == 1095) {print " selected=\"selected\" ";}

print ">Three Years</option>\n<option value=\"1825\"";

if ($duration == 1825) {print " selected=\"selected\" ";}

print ">Five Years</option>\n</select></li>\n\n"; #</td><td BGCOLOR=#CCCCCC>";

# tick width selector
print "<li>Graph Tick Width</li>\n<li>\n";
print "<select name=\"tick\">\n<option value=\"10000\"";

if ($tick == 10000) {print " selected=\"selected\" ";}
print ">\$100</option>\n<option value=\"20000\"";

if (($tick == 20000)|| ($duration == "")) {print " selected=\"selected\" ";}

print ">\$200</option>\n<option value=\"50000\"";

if ($tick == 50000) {print " selected=\"selected\" ";}

print ">\$500</option>\n<option value=\"75000\"";

if ($tick == 75000) {print " selected=\"selected\" ";}

print ">\$750</option>\n<option value=\"100000\"";

if ($tick == 100000) {print " selected=\"selected\" ";}

print ">\$1000</option>\n</select></li>\n\n";

      
print <<FORECASTFORM2;
</form>
</ul>
<p><a href="#" class="black button" onclick="javascript:document.forecast.submit();">Forecast</a>
<a href="#" class="black button" onclick="javascript:document.forecast.save_only.value='yes';document.forecast.submit();">Save</a></p>
</div>
FORECASTFORM2
}


sub compareDates {

  $a =~ /(\d+)\/(\d+)\/(\d+)/;

  $mon1 = $1;

  $day1 = $2;

  $year1 = $3;

  $b =~ /(\d+)\/(\d+)\/(\d+)/;

  $mon2 = $1;

  $day2 = $2;

  $year2 = $3;

  #print "day $a $b\n";

  if ($year1 == $year2){

    if ($mon1 == $mon2){

      #print "day $a $b\n";

      return ( $day1 <=> $day2 );

    }

    else {

      #print "mon $a  $b\n";

      return ( $mon1 <=> $mon2 );

    }

  }

  else {

    #print "year $a $b\n";

    return ( $year1 <=> $year2 );

  }

}



sub payTrans {

  if ($type[$id] eq "dep") {

    $balance += $amount[$id];

  }

  else {

    $balance -= $amount[$id];

  }

  &calcNextDate;

  return;

}



sub calcNextDate {

  if ($freq[$id] eq "wkl") {

    ($tday[$id],$tmon[$id],$tyear[$id]) = &stepDays($tday[$id],$tmon[$id],$tyear[$id],7);

  }

  elsif ($freq[$id] eq "bwk") {

    ($tday[$id],$tmon[$id],$tyear[$id]) = &stepDays($tday[$id],$tmon[$id],$tyear[$id],14);

  }
  elsif ($freq[$id] eq "twk") {

    ($tday[$id],$tmon[$id],$tyear[$id]) = &stepDays($tday[$id],$tmon[$id],$tyear[$id],21);

  }

  elsif ($freq[$id] eq "one") {

    $tyear[$id] = 9999;

  }

  else {

     # All monthly bills scheduled after the 28 will be paid on 28th

    if ($tday[$id] > 28) {

      $tday[$id] = 28;

    }

    if ($freq[$id] eq "mon") {

    ($tday[$id],$tmon[$id],$tyear[$id]) = &stepMon($tday[$id],$tmon[$id],$tyear[$id],1);

    }

    elsif ($freq[$id] eq "bmn") {

      ($tday[$id],$tmon[$id],$tyear[$id]) = &stepMon($tday[$id],$tmon[$id],$tyear[$id],2);

    }

    elsif ($freq[$id] eq "qtr") {

      ($tday[$id],$tmon[$id],$tyear[$id]) = &stepMon($tday[$id],$tmon[$id],$tyear[$id],3);

    }

    elsif ($freq[$id] eq "san") {

      ($tday[$id],$tmon[$id],$tyear[$id]) = &stepMon($tday[$id],$tmon[$id],$tyear[$id],6);

    }

    elsif ($freq[$id] eq "anl") {

      $tyear[$id]++;

    }

  }

}



sub stepDays {

  $d = $_[0];

  $m = $_[1];

  $y = $_[2];

  $days = $_[3];

  #print "Stepping $days<br/>";

  for ($i = 0; $i < $days; $i++) {

    #print "$i ";

    # Handle February 28th on Non Leap Years

    if (($d == 28) && ($m == 2) && (($y % 4) != 0)) {

      $d = 1;

      ($d,$m,$y) = &stepMon($d,$m,$y,1);

    }

    # Handle February 29th

    elsif (($d == 29) && ($m == 2)) {

      $d = 1;

      ($d,$m,$y) = &stepMon($d,$m,$y,1);

    }

    #Handle short months

    elsif (($d == 30) && (($m == 4) || ($m == 6) || ($m == 9) || ($m == 11))) {

      $d = 1;

      ($d,$m,$y) = &stepMon($d,$m,$y,1);

    }

    #Handle long months

    elsif ($d == 31) {

      $d = 1;

      ($d,$m,$y) = &stepMon($d,$m,$y,1);

    }

    else {

      $d++;

    }

  }

  return ($d,$m,$y);

}



sub stepMon {

  $dd = $_[0];

  $mm = $_[1];

  $yy = $_[2];

  $months = $_[3];

  for ($j = 0; $j < $months; $j++) {

    #print "j=$j";

    if ($mm < 12) {

      $mm++;

    }

    else {

      $mm = 1;

      $yy++;

    }

  }

  return ($dd,$mm,$yy);

}



sub payToDate {

  $pday = $_[0];

  $pmon = $_[1];

  $pyear = $_[2];

  $pay_til_date = "$pmon/$pday/$pyear";



  for ($id=0; $id<$count; $id++) {

    $limit=0;

    #print "id = $id";

    $trans_date = "$tmon[$id]/$tday[$id]/$tyear[$id]";

    #print "trans_date = $trans_date<br/>";

    #print "pay_til_date = $pay_til_date<br/>";

    $a = $trans_date;

    $b = $pay_til_date;

    $continue=&compareDates($trans_date,$pay_til_date);

    #print "<tr><td colspan=3>trans_date = $a";

    #print "<br/>pay_til_date = $pay_til_date</td></tr>";

    while (($continue <= 0) && ($limit < 100)){

      &payTrans;

      #&printTrans;

      $a = "$tmon[$id]/$tday[$id]/$tyear[$id]";

      #print "<tr><td colspan=3>trans_date = $a";

      #print "<br/>pay_til_date = $pay_til_date</td></tr>";

      $continue=&compareDates($trans_date,$pay_til_date);

      #print "continue = $continue<br/>";

      $limit++;

    }

  }

}



sub forecastBalance {

  $start_date =~ /(\d+)\/(\d+)\/(\d+)/;

  $cmon = $1;

  $cday = $2;

  $cyear = $3;

  $balance = $start_balance;

  $maxgraph = 0;
  print "<h1>Balance Forecast<a style=\"float:right;margin-right:15px;text-decoration:none;color:rgb(76,86,108);\" href=\"$EXCEL_URL\">excel</a>\n<\h1>\n";
  # jqplot container div
  print "<div id=\"chartdiv\"></div>\n";

  print "<ul style=\"overflow:hidden;display:none;\">\n"; # hide old plot
  print "<table style=\"font-size:0.6em;background-color:white;border:0px solid black;\" width=\"100%\">\n";
  print "<tr style=\"text-align:right;\"><td><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td></td>";

  $print_tick = $tick/100;
  print "<td><b>Balance</td><td colspan=\"2\" style=\"text-align:center\">[]<b> = \$$print_tick</b></td></tr>\n";

  # Create an excel file for output
  open(EXCEL,">$EXCEL_FILE");
  print EXCEL "Date\tBalance\n"; 
  close(EXCEL);

  # jqplot balance array
  $balanceArray = "var forecastBalance = \[\n";
 
  # Loop for the duration

  for ($l=0; $l<$duration; $l++) {

    $previous_balance = $balance;

    #print "<tr><td>$cmon\/$cday\/$cyear</td><td>$start_balance</td><td>$previous_balance</td></tr>";

    &payToDate ($cday, $cmon, $cyear);



    if ($previous_balance != $balance) {

      $diff = $balance - $previous_balance;

      $pbalance = $balance;

      $pbalance =~ s/(..)\z/\.$1/;

      $pdiff = $diff;

      $pdiff =~ s/(..)\z/\.$1/;

      if ($pbalance >= 2000) {$color="color:green;";}
      elsif ($pbalance >= 1000) {$color="color:black;";} 
      elsif ($pbalance >= 0) {$color="color:darkorange;"; }
      elsif ($pbalance >= -1000) {$color="color:red;"} 
      else {$color="color:purple;";}

      print "<tr><td style=\"text-align:right;$color\">$cmon\/$cday\/$cyear</td>";

      print "<td style=\"text-align:right;$color\"></td><td style=\"text-align:right;$color\">$pbalance</td>";
 	  #print "<td style=\"text-align:right;$color\">$pdiff</td><td style=\"text-align:right;$color\">$pbalance</td>";

	  open(EXCEL,">>$EXCEL_FILE");
	  $flt_balance = $balance/100;
	  print EXCEL "$cmon\/$cday\/$cyear\t$flt_balance\n";
	  close(EXCEL);
    
      $graph = (abs($balance) / $tick);
      $mag = "";
      for ($n=0; $n<$graph; $n++) {$mag .= "[]"};

      #print "<td>&nbsp&nbsp&nbsp&nbsp</td><td BGCOLOR=$color colspan=$graph><b><FONT COLOR=$color></td></tr>\n";
      if ($pbalance >= 0) {
        print "<td style=\"text-align:right;$color\"></td>\n";
        print "<td style=\"text-align:left;$color\">$mag</td></tr>\n";
      }
      else {
        print "<td style=\"text-align:right;$color\">$mag</td>\n";
        print "<td style=\"text-align:left;$color\"></td></tr>\n";
      }
      #for ($n=0; $n<$graph; $n++) {print "<td BGCOLOR=$color><b><FONT COLOR=$color>&nbsp</td>"};
      #for ($n=0; $n<$graph; $n++) {print "|"};
      #print "$mag";
      #print "</td></tr>\n";

      if ($maxgraph < $graph) {$maxgraph = $graph;}

      # Capture data for jqplot 
      $flt_balance = $balance/100;
      $balanceArray .= "\{date:\"$cmon\/$cday\/$cyear\", balance:$flt_balance\},\n";

    
    }


    ($cday, $cmon, $cyear) = &stepDays($cday, $cmon, $cyear, 1);

  }
  # finish jqplot array
  $balanceArray =~ s/\,$/\n\]/;
  print "<!--\n$balanceArray\n-->";

  print "<tr style=\"text-align:right;\"><td><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td></td>";
  print "<td><b>Balance</td><td colspan=\"2\" style=\"text-align:center\">[]<b> = \$$print_tick</b></td></tr>\n";

  #for ($n=0; $n<$maxgraph; $n++) {print "<td></td>";}
  print "<td></td>";

  print "</tr>\n";
  print "</table></ul>\n";

  # print jqplot strip chart
  print "<script>$balanceArray\nprintVerticalStripChart(forecastBalance);</script>\n"; 

}

sub print_forecast_settings {
print <<FORECASTSETTINGS1;

<h1>Forecast Settings
<a style="float:right;margin-right:15px;text-decoration:none;color:rgb(76,86,108);" href="javascript:document.cookie = 'dir=;Path=/;Expires=Thu, 01 Jan 1970 00:00:01 GMT;';window.location.href='login.html'">$USER</a>
</h1>

<ul>	
<li><a class="smalldep" href="javascript:showhide('forecast_settings');showhide('main');">
FORECASTSETTINGS1

print "$pstart_balance\n";
 
print <<FORECASTSETTINGS2;
</a>
<a href="javascript:showhide('forecast_settings');showhide('main');"><b>Starting Balance</b></a>
<a href="javascript:showhide('forecast_settings');showhide('main');">Duration -    
FORECASTSETTINGS2

switch ($duration) {
	case "7" {print "One Week\n";}
	case "14" {print "Two Weeks\n";}
	case "30" {print "One Month\n";}
	case "91" {print "Three Months\n";}
	case "183" {print "Six Months\n";}
	case "365" {print "One Year\n";}
	case "730" {print "Two Years\n";}
	case "1095" {print "Three Years\n";}
	case "1825" {print "Five Years\n";}
	else {print "$duration days\n";}
}
print <<FORECASTSETTINGS3;
</a></li>
</ul>		
		
FORECASTSETTINGS3

}

sub print_revenue {
  &printAdMobAd;
  &printGoogleMobileAd;

print <<REVENUE;

<ul>
<li><a>Feature Requests</a></li>
<li>
<a style="text-align:center;">
<form action="https://www.paypal.com/cgi-bin/webscr" method="post"><input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="hosted_button_id" value="CWYEZNDUMSGV2"><input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"><img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1"></form>
</a></li>
</ul>
<ul>
<li style="text-align:center;"><script type="text/javascript"><!--
google_ad_client = "pub-7910178764477337";
/* 234x60, created 9/4/11 */
google_ad_slot = "4331149991";
google_ad_width = 234;
google_ad_height = 60;
//-->
</script>
<script type="text/javascript"
src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
</script></li>
	
</ul>
</form>

REVENUE
}

sub printTopofPage {

print "Content-type: text/html; charset=ISO-8859-1\n\n";

print <<TOPHTML;
<html>
<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1.0, maximum-scale=1.0" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<link rel="apple-touch-startup-image" href="./canvas.png" />
<link rel="apple-touch-icon" href="./apple-touch-icon.png" />
<!-- jqplot includes -->
<!--[if lt IE 9]><script language="javascript" type="text/javascript" src="excanvas.js"></script><![endif]-->
<script language="javascript" type="text/javascript" src="iAffordIt/jqplot/jquery.min.js"></script>
<script language="javascript" type="text/javascript" src="iAffordIt/jqplot/jquery.jqplot.min.js"></script>
<script language="javascript" type="text/javascript" src="iAffordIt/jqplot/plugins/jqplot.barRenderer.js"></script>
<script language="javascript" type="text/javascript" src="iAffordIt/jqplot/plugins/jqplot.categoryAxisRenderer.js"></script>
<script language="javascript" type="text/javascript" src="iAffordIt/jqplot/plugins/jqplot.canvasTextRenderer.js"></script>
<script language="javascript" type="text/javascript" src="iAffordIt/jqplot/plugins/jqplot.canvasAxisLabelRenderer.js"></script>
<script language="javascript" type="text/javascript" src="iAffordIt/jqplot/plugins/jqplot.canvasAxisTickRenderer.js"></script>
<script language="javascript" type="text/javascript" src="iAffordIt/jqplot/plugins/jqplot.pointLabels.js"></script>
<script language="javascript" type="text/javascript" src="iAffordIt/jqplot/plugins/jqplot.highlighter.js"></script>
<link rel="stylesheet" type="text/css" href="iAffordIt/jqplot/jquery.jqplot.css" />
<script language="javascript" type="text/javascript" src="iAffordIt/graph.js"></script>

<head>
<title>iAfford It - Balance Forecaster</title>
<link rel="stylesheet" href="iAffordIt/stylesheet/iphone.css" />
	<script language="javascript"> 
	<!--
	var state = 'none';

	function showhide(layer_ref) {

		if (state == 'block') { 
		state = 'none'; 
		} 
		else { 
		state = 'block'; 
		} 
		if (document.getElementById &&!document.all) { 
		hza = document.getElementById(layer_ref); 
		hza.style.display = state; 
		
		
		//window.scrollTo(0, document.body.scrollHeight);
		window.scrollTo(0, 0);
		
		} 
	} 
	//--> 
	</script>
	<style>
	    span.tag {
	        font-size:11px;
	        color:#3366ff;
	        background-color:#cde6ff;
	        padding:4px;
	        margin:1px;    
	    }
	</style>    
</head>
<body onload = "setTimeout(function(){window.scrollTo(0, 1);}, 100);">


TOPHTML

print <<HEADERDIV1;
<div id="header">
	<h1>iAfford It</h1>
HEADERDIV1

if ($start_balance eq "") {
print <<HEADERDIV2;
	<a href="edit_trans.pl?action=new&amp;index=9999" class="Action" id="leftActionButton">New</a>
HEADERDIV2
}	
else {
print <<HEADERDIV2;
	<a href="money.pl" class="Action" id="leftActionButton">Transactions</a>
HEADERDIV2
}
print <<HEADERDIV3;
	<!--<a href="javascript:showhide('forecast_settings');" --> 
	<a href="javascript:document.forecast.submit();"
	class="Action">Forecast</a>
	<!--<a href="info.html" class="Action" id="helpButton">Help</a> -->
</div>
HEADERDIV3
}

sub printGoogleMobileAd {

print <<AD;
<div style="position:absolute;left:0px;right:0;width:100%;text-align:center;">
<script type="text/javascript"><!--
  // XHTML should not attempt to parse these strings, declare them CDATA.
  /* <![CDATA[ */
  window.googleAfmcRequest = {
    client: 'ca-mb-pub-7910178764477337',
    format: '320x50_mb',
    output: 'html',
    slotname: '5402205885',
  };
  /* ]]> */
//--></script>
<script type="text/javascript"    src="http://pagead2.googlesyndication.com/pagead/show_afmc_ads.js"></script>
</div>
<div style="height:50px"></div>
AD
}

sub printAdMobAd {
print <<AD;
<div style="position:absolute;left:0px;right:0;width:100%;text-align:center;">
<script type="text/javascript">
var admob_vars = {
 pubid: 'a14ea0db5041a01', // publisher id
 bgcolor: '000000', // background color (hex)
 text: 'FFFFFF', // font-color (hex)
 test: false // test mode, set to false to receive live ads
};
</script>
<script type="text/javascript" src="http://mmv.admob.com/static/iphone/iadmob.js"></script>
</div>
<div style="height:50px"></div>
AD
}

#-------------------ROUTINE FILE STARTS HERE------------------------------
#
# This routine takes (name,value,minutes_to_live,path,domain) as arguments
# to set a cookie.
#
# 0 minutes means a current browser session cookie life
#
sub set_cookie() {

  my ($name,$value,$expires,$path,$domain) = @_;

  $name=&cookie_scrub($name);
  $value=&cookie_scrub($value);

  $expires=$expires * 60;

  my $expire_at=&cookie_date($expires);
  my $namevalue="$name=$value";

  my $COOKIE="";

  if ($expires != 0) {
     $COOKIE= "Set-Cookie: $namevalue; expires=$expire_at; ";
  }
   else {
     $COOKIE= "Set-Cookie: $namevalue; ";   #current session cookie if 0
   }
  if ($path ne ""){
     $COOKIE .= "path=$path; ";
  }
  if ($domain ne ""){
     $COOKIE .= "domain=$domain; ";
  }
   

  return $COOKIE;
}

#
# This routine removes cookie of (name) by setting the expiration
# to a date/time GMT of (now - 24hours)
#
sub remove_cookie() {

  my ($name,$path,$domain) = @_;

  $name=&cookie_scrub($name);
  my $value="";
  my $expire_at=&cookie_date(-86400);
  my $namevalue="$name=$value";

  my $COOKIE= "Set-Cookie: $namevalue; expires=$expire_at; ";
  if ($path ne ""){
     $COOKIE .= "path=$path; ";
  }
  if ($domain ne ""){
     $COOKIE .= "domain=$domain; ";
  }

  return $COOKIE;
}


#
# given a cookie name, this routine returns the value component
# of the name=value pair
#
sub get_cookie() {

  my ($name) = @_;

  $name=&cookie_scrub($name);
  my $temp=$ENV{'HTTP_COOKIE'};
  @pairs=split(/\; /,$temp);
  foreach my $sets (@pairs) {
    my ($key,$value)=split(/=/,$sets);
    $clist{$key} = $value;
  }
  my $retval=$clist{$name};

  return $retval;
}

#
# this routine accepts the number of seconds to add to the server
# time to calculate the expiration string for the cookie. Cookie
# time is ALWAYS GMT!
#
sub cookie_date() {

  my ($seconds) = @_;

  my %mn = ('Jan','01', 'Feb','02', 'Mar','03', 'Apr','04',
            'May','05', 'Jun','06', 'Jul','07', 'Aug','08',
            'Sep','09', 'Oct','10', 'Nov','11', 'Dec','12' );
  my $sydate=gmtime(time+$seconds);
  my ($day, $month, $num, $time, $year) = split(/\s+/,$sydate);
  my    $zl=length($num);
  if ($zl == 1) { 
    $num = "0$num";
  }

  my $retdate="$day $num-$month-$year $time GMT";

  return $retdate;
}


#
# don't allow = or ; as valid elements of name or data
#
sub cookie_scrub() {

  my($retval) = @_;

  $retval=~s/\;//;
  $retval=~s/\=//;

  return $retval;
}


# usual kluge so require does not fail....

     my $XyZ=1;

#-------------------ROUTINE FILE ENDS HERE--------------------------------

