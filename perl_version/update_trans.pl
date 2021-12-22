#!/usr/bin/perl -w
use cPanelUserConfig;

#$TRANS_FILE = "/usr/home/web/n/nathanu/cgi-bin/money/transactions.dat";
#$MONEY_URL = "http://snow.prohosting.com/nathanu/cgi-bin/money/money.pl";

$DIR = &get_cookie("dir");
if ($DIR ne "") {
	$TRANS_FILE= "$DIR/transactions.dat";
	$BALANCE_FILE = "$DIR/balance.dat";
	$PASSWD_FILE = "$DIR/passwd.dat";
	if (!((-e $TRANS_FILE) && (-e $BALANCE_FILE) && (-e $PASSWD_FILE))) {
		print "Location: /login.html?retry=nofiles\n\n";
	} 
}
else {
	print "Location: /login.html?retry=nocookie\n\n";
}

$MONEY_URL = "http://$ENV{'HTTP_HOST'}$ENV{'SCRIPT_NAME'}";
$MONEY_URL =~ s/update_trans\.pl/money\.pl/;

#print "Content-type: text/html\n\n";
#print "<HEAD><TITLE>Money</TITLE></HEAD>\n<BODY BACKGROUND=\"../../Backgnd/clouds.jpg\">";
#print "<BR><B><BR>$TRANS_FILE<BR>$MONEY_URL<BR>";

# Read in text from command line
if ($ENV{'REQUEST_METHOD'} eq "GET") {
  $in = $ENV{'QUERY_STRING'};
  #print "Get $in<BR>";
}
elsif ($ENV{'REQUEST_METHOD'} eq "POST") {
  read(STDIN,$in,$ENV{'CONTENT_LENGTH'});
  #print "Post $in<BR>";
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

$action=$in{'action'};
$index=$in{'index'};
$date=$in{'date'};
if ($date =~ /(\d+)-(\d+)-(\d+)/) {
    $date = "$2/$3/$1";
}
$name=$in{'name'};
$freq=$in{'freq'};
$type=$in{'type'};
$amount=$in{'amount'};
if ($amount =~ /^\d+$/) {
    $amount .= ".00";
}
$tags=$in{'tags'};

#print "<B>action=$action  index=$in{'index'} date=$in{'date'}  name=$in{'name'} freq=$in{'freq'}  type=$in{'type'} amount=$in{'amount'}<BR><BR>";

# Read the file
open(RDFL,"<$TRANS_FILE");
@content=<RDFL>;
close(RDFL);
$content = join( "", @content);
@transactions = $content =~ /<transaction>(.*?)<\/transaction>/sg;

# Create the new line
$date =~ /(\d+)\/(\d+)\/(\d+)/;
$pmon = sprintf("%02d", $1);
$pday = sprintf("%02d", $2);
$pyear = sprintf("%d", $3);
if ($action eq "one") {
  $freq = "one";
}

$newline = "<transaction><date>$date</date><name>$name</name>\n\t<freq>$freq</freq><type>$type</type><amount>$amount</amount><tags>$tags</tags></transaction>";

open(WRFL,">$TRANS_FILE");
$count = 0;
# Find the transaction by index and parse the data into local variables
foreach $trans (@transactions) {
  #print "count=$count  index=$index<BR>";
  # If this is the indexed transaction
  if ($trans =~ /<date>(\d+)\/(\d+)\/(\d+)<\/date>\s*<name>(.*?)<\/name>\s*<freq>(\w+)<\/freq>\s*<type>(\w+)<\/type>\s*<amount>(\d+)\.(\d+)<\/amount>\s*<tags>(.*?)<\/tags>/) {
    if ($count == $index) {
      # If this applys to all future transactions and 
      if ($action eq "all") {
        # Replace the contents with the new information
        #print "$newline<BR>";
        print WRFL "$newline\n";
      }
      # If this change applys only to one transaction
      elsif ($action eq "one") {
        # Write the new one time transaction
        #print "$newline<BR>";
        print WRFL "$newline\n";
        # Write the future transactions with the next due date
        $tmon[0] = $1;
        $tday[0] = $2;
        $tyear[0] = $3;
        if ($tyear[0] < 100) {
            $tyear[0] = 2000 + $tyear[0];
        }
        $name[0] = $4;
        $freq[0] = $5;
        $type[0] = $6;
        $amount[0] = $7 * 100 + $8;
        $tags[0] = $9;
        $id = 0;
        &calcNextDate;
        $pmon = sprintf("%02d", $tmon[0]);
        $pday = sprintf("%02d", $tday[0]);
        $pyear = sprintf("%d", $tyear[0]);
        $pamount = $amount[0];
        $pamount =~ s/(..)\z/\.$1/;
        $future = "<transaction><date>$pmon\/$pday\/$pyear</date><name>$name[0]</name>\n\t<freq>$freq[0]</freq><type>$type[0]</type><amount>$pamount</amount><tags>$tags[0]</tags></transaction>";
        #print "$future<BR>";
        print WRFL "$future\n";
      }
      elsif ($action eq "pay") {
        # Write the future transactions with the next due date
        $tmon[0] = $1;
        $tday[0] = $2;
        $tyear[0] = $3;
        if ($tyear[0] < 100) {
            $tyear[0] = 2000 + $tyear[0];
        }
        $name[0] = $4;
        $freq[0] = $5;
        $type[0] = $6;
        $amount[0] = $7 * 100 + $8;
        $tags[0] = $9;
        $id = 0;
        if ($freq[0] eq "one") {
          #print "paid and deleted<BR>";
          print WRFL "";
        }
        else {
          &calcNextDate;
          $pmon = sprintf("%02d", $tmon[0]);
          $pday = sprintf("%02d", $tday[0]);
          $pyear = sprintf("%d", $tyear[0]);
          $pamount = $amount[0];
          $pamount =~ s/(..)\z/\.$1/;
          $future = "<transaction><date>$pmon\/$pday\/$pyear</date><name>$name[0]</name>\n\t<freq>$freq[0]</freq><type>$type[0]</type><amount>$pamount</amount><tags>$tags[0]</tags></transaction>";
          #print "$future<BR>";
          print WRFL "$future\n";
        }
      }
      # If the action is delete then replace current line with an empty line
      elsif ($action eq "del") {
        #print "deleted<BR>";
        print WRFL "";
      }
    }
    else {
    # Write the line to the file
    #print "$line<BR>";
    print WRFL "<transaction>$trans</transaction>\n";
    }
    $count++;
  }
}
if ($action eq "new") {
  #print "$newline<BR>";
  print WRFL "$newline\n";
}
close(WRFL);

#print "<A HREF=money.pl>Money</A>";
print "Location: $MONEY_URL\n\n";

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
     # All monhtly bills scheduled after the 28 will be paid on 28th
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
  #print "Stepping $days<BR>";
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

