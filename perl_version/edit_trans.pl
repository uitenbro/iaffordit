#!/usr/bin/perl -w
use cPanelUserConfig;

$DIR = &get_cookie("dir");
if ($DIR ne "") {
	$TRANS_FILE= "$DIR/transactions.dat";
	$BALANCE_FILE = "$DIR/balance.dat";
	$PASSWD_FILE = "$DIR/passwd.dat";
	if (!((-e $TRANS_FILE) && (-e $BALANCE_FILE) && (-e $PASSWD_FILE))) {
		print "Location: login.html?retry=nofiles\n\n";
	}
}
else {
	print "Location: login.html?retry=nocookie\n\n";
}

print "Content-type: text/html; charset=ISO-8859-1\n\n";

print <<TOPHTML;
<html>
<meta name="viewport" content="user-scalable=no; width=device-width; initial-scale=1.0; maximum-scale=1.0;" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<link rel="apple-touch-startup-image" href="./canvas.png" />
<link rel="apple-touch-icon" href="./apple-touch-icon.png" />
<head>
<title>iAfford It - Balance Forecaster</title>
<link rel="stylesheet" href="stylesheet/iphone.css" />

	
</head>
<body onload = "setTimeout(function(){window.scrollTo(0, 1);}, 100);">


TOPHTML

print <<HEADERDIV;
<div id="header">
	<h1>iAfford It</h1>
	<a href="javascript:history.back();" class="Action" id="leftActionButton">Cancel</a>
	<a href="javascript:javascript:document.update_trans.submit();;" class="Action">Save</a>
	<!--<a href="info.html" class="Action" id="helpButton">Help</a> -->
</div>
HEADERDIV

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

$action = $in{'action'};
$index = $in{'index'};

# Read the file
open(RDFL,"<$TRANS_FILE");
@content=<RDFL>;
close(RDFL);
$content = join( "", @content);
@transactions = $content =~ /<transaction>(.*?)<\/transaction>/sg;

$count = 0;
if (($action eq "one") || ($action eq "all")) {
# Find the transaction by index and parse the data into local variables
  foreach $trans (@transactions) {
    # if this is the indexed entry
    if ($trans =~ /<date>(\d+)\/(\d+)\/(\d+)<\/date>\s*<name>(.*?)<\/name>\s*<freq>(\w+)<\/freq>\s*<type>(\w+)<\/type>\s*<amount>(\d+)\.(\d+)<\/amount><tags>(.*?)<\/tags>/) {
      if ($count == $index) {
        #print "$line<br/><br/>";
        $tmon = $1;
        $tday = $2;
        $tyear = $3;
        if ($tyear < 100) {
             $tyear = 2000 + $tyear;
        }
        $name = $4;
        $freq = $5;
        $type = $6;
        $amount = $7 * 100 + $8;
        $tags = $9
      }
      $count++;
    }
  }
}
else {
  # Get current date
  ($sec,$min,$hour,$tday,$tmon,$tyear,$wday,$yday,$isdst) = localtime(time);
  $tyear+=1900;
  $tmon+=1;
}
print "<h1>Edit Transaction</h1>\n";

print "<ul>\n";

print "<form name= \"update_trans\" method=\"post\" action=\"update_trans.pl\">\n";

print "<input type=\"hidden\" name=\"action\" value=\"$action\"/>\n";
print "<input type=\"hidden\" name=\"index\" value=\"$index\"/>\n";



$pmon = sprintf("%02d", $tmon);
$pday = sprintf("%02d", $tday);
$pyear = sprintf("%d", $tyear);
print "<li>Date</li>\n<li><input type=\"date\" name=\"date\" size=\"7\" value=\"$pyear-$pmon-$pday\"/></li>\n";
print "<li>Name</li>\n<li><input type=\"text\" name=\"name\" size=\"20\" value=\"$name\" autocorrect=\"on\" autocapitalize=\"on\"/></li>\n";

print "<li>Frequency</li>\n";

if ($action eq "one") {
  print "<li>once</li>";
}
else {
  print "<li><select name=\"freq\">\n<option ";
  if ($freq eq "one") {print "selected=\"selected\" ";}
  print "value=\"one\">once</option>\n<option ";
  if ($freq eq "wkl") {print "selected=\"selected\" ";}
  print "value=\"wkl\">weekly</option>\n<option ";
  if ($freq eq "bwk") {print "selected=\"selected\" ";}
  print "value=\"bwk\">bi-weekly</option>\n<option ";
  if ($freq eq "twk") {print "selected=\"selected\" ";}
  print "value=\"twk\">tri-weekly</option>\n<option ";
  if (($freq eq "mon") || ($freq eq "")) {print "selected=\"selected\" ";}
  print "value=\"mon\">monthly</option>\n<option ";
  if ($freq eq "bmn") {print "selected=\"selected\" ";}
  print "value=\"bmn\">bi-monthly</option>\n<option ";
  if ($freq eq "qtr") {print "selected=\"selected\" ";}
  print "value=\"qtr\">quarterly</option>\n<option ";
  if ($freq eq "san") {print "selected=\"selected\" ";}
  print "value=\"san\">semi-annually</option>\n<option ";
  if ($freq eq "anl") {print "selected=\"selected\" ";}
  print "value=\"anl\">annually</option>\n</select></li>\n";
}

print "<li>Type</li><li><select name=\"type\">\n<option ";
if ($type eq "bill") {print "selected=\"selected\" ";}
print "value=\"bill\">bill</option>\n<option ";
if ($type eq "dep") {print "selected=\"selected\" ";}
print "value=\"dep\">deposit</option>\n</select></li>\n";
$pamount = $amount;
$pamount =~ s/(..)\z/\.$1/;
$pamount =~ s/^\./0\./;
print "<li>Amount</li><li><input type=\"number\" size=\"10\" name=\"amount\" value=\"$pamount\" /></li>\n";
print "<li>Tags</li>\n<li><input type=\"text\" name=\"tags\" size=\"20\" value=\"$tags\"/></li>\n";
print "</form></ul>\n";

# print <<GOOGLEMOBLIE;
# <div style="position:absolute;left:0px;right:0;width:100%;text-align:center;">
# <script type="text/javascript"><!--
#   // XHTML should not attempt to parse these strings, declare them CDATA.
#   /* <![CDATA[ */
#   window.googleAfmcRequest = {
#     client: 'ca-mb-pub-7910178764477337',
#     format: '320x50_mb',
#     output: 'html',
#     slotname: '5402205885',
#   };
#   /* ]]> */
# //--></script>
# <script type="text/javascript"    src="http://pagead2.googlesyndication.com/pagead/show_afmc_ads.js"></script>
# </div>
# <div style="height:50px"></div>
# GOOGLEMOBLIE
# 
# print <<ADMOB;
# <div style="position:absolute;left:0px;right:0;width:100%;text-align:center;">
# 
# <script type="text/javascript">
# var admob_vars = {
#  pubid: 'a14ea0db5041a01', // publisher id
#  bgcolor: '000000', // background color (hex)
#  text: 'FFFFFF', // font-color (hex)
#  test: false // test mode, set to false to receive live ads
# };
# </script>
# <script type="text/javascript" src="http://mmv.admob.com/static/iphone/iadmob.js"></script>
# </div>
# <div style="height:50px"></div>
# ADMOB
# 
# print <<GOOGLEAD;
# <ul>
# <li style="text-align:center;"><script type="text/javascript"><!--
# google_ad_client = "pub-7910178764477337";
# /* 234x60, created 9/4/11 */
# google_ad_slot = "4331149991";
# google_ad_width = 234;
# google_ad_height = 60;
# //-->
# </script>
# <script type="text/javascript"
# src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
# </script></li>
# 	
# </ul>
# GOOGLEAD

print "</body></html>";


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

