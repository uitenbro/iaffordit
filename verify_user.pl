#!/usr/bin/perl -w
use cPanelUserConfig; 

use File::Copy;
use CGI; # load the CGI.pm module
my $GET = new CGI; # create a new object
my @VAL = $GET->param; #get all form field names
my $spin =1;

foreach(@VAL){
 	$in{$_} = $GET->param($_); # put all fields and values in hash 
 	#&printp ("$_\t->\t$in{$_}");
}

$USER_DIR = "$in{'user'}";

# 		 	/verify_user.pl
#           /money.pl     
#			/Users/user/passwd.dat
#			/Users/user/datafiles.dat

$APP_URL = "http://$ENV{'HTTP_HOST'}$ENV{'SCRIPT_NAME'}";
$APP_URL =~ s/verify_user\.pl/money\.pl/;

$USER_DATA_LOCATION = "$ENV{'SCRIPT_FILENAME'}";
$USER_DATA_LOCATION =~ s/verify_user\.pl/Users\//;
$USER_FILES_LOCATION = "$USER_DATA_LOCATION$USER_DIR";

$TEMPLATE_LOCATION = "$USER_DATA_LOCATION";
$TEMPLATE_LOCATION .= "\/Templates/";
#&printp("");
if ($in{'user'} ne "") {
	
	#&printp ("username - $in{'user'}");

	if ($in{'passwd'} ne "") {
		#&printp ("password - $in{'passwd'} crypt - $cryptpasswd");
		
		if ($in{'newuser'} eq "yes") {
			if (`ls -l $USER_DATA_LOCATION` =~ /$in{'user'}/) {
					print "Location:login.html?retry=exists\n\n";
			}
			else {
				&create_user_dir;
				#&printp ("set cookie dir=$USER_FILES_LOCATION");
				$cookie =  &set_cookie("dir","$USER_FILES_LOCATION",0,"/","$ENV{'HTTP_HOST'}");
				print "$cookie\n";
				#print "Refresh:0;url=money.pl\n\n";
				print "Location:money.pl\n\n";
			}
		}
		else {	
			if (-d "$USER_FILES_LOCATION") {
				# check password file
				if (&passwd_matches eq "yes") {
					$cookie =  &set_cookie("dir","$USER_FILES_LOCATION",0,"/","$ENV{'HTTP_HOST'}");
					print "$cookie\n";
					print "Location: money.pl\n\n";
                    #print "Refresh:0;url=money.pl\n\n";
				}
				else {
					print "Location:login.html?retry=incorrect\n\n";
				} 
			}
			else {
				print "Location:login.html?retry=nouser\n\n";
			}
		}
	}
	else {
		print "Location:login.html?retry=incorrect\n\n";
	}
}
else {
	print "Location:login.html?retry=nouser\n\n";
}

sub create_user_dir {
	mkdir ("$USER_FILES_LOCATION", 0777); # unless the dir exists, make it ( and chmod it on UNIX )
 	chmod(0777, "$USER_FILES_LOCATION");
 	# store crypted password
 	$salt = join '', ('.', '/', 0..9, 'A'..'Z', 'a'..'z')[rand 64, rand 64];
	$cryptpasswd = crypt($in{'passwd'},$salt);
 	open(WRFL,">$USER_FILES_LOCATION/passwd.dat");
 	print WRFL "$cryptpasswd";
 	close WRFL;
 	# populate template files
 	copy("$TEMPLATE_LOCATION/balance.dat", "$USER_FILES_LOCATION/balance.dat") or &printp ("copy failed");
 	copy("$TEMPLATE_LOCATION/transactions.dat", "$USER_FILES_LOCATION/transactions.dat") or &printp ("copy failed");
	# Get current date
	($sec,$min,$hour,$cday,$cmon,$cyear,$wday,$yday,$isdst) = localtime(time);
	$cyear+=1900;
	$cmon+=2;
	# bring template dates to current
	open(RDFL,"<$USER_FILES_LOCATION/transactions.dat");
	@content=<RDFL>;
	close(RDFL);

	open(WRFL,">$USER_FILES_LOCATION/transactions.dat");
	foreach $line (@content) {
		if ($line =~ /<date>(\d+)\/(\d+)\/(\d+)<\/date>/) {
			#&printp("replace $1/$2/$3 with $cmon/$2/$cyear");
			$line =~ s/<date>(\d+)\/(\d+)\/(\d+)<\/date>/<date>$cmon\/$2\/$cyear<\/date>/;
			#&printp ("$line");
		}
    	print WRFL "$line";
	}
	close WRFL;
}

sub passwd_matches {
	$match = "no";
	open(RDFL,"<$USER_FILES_LOCATION/passwd.dat");
	@content=<RDFL>;
	close(RDFL);
	$crypt = "@content";
	#&printp ("crypt - $crypt passwd - $in{'passwd'}");
	$digest = crypt($in{'passwd'}, $crypt);
	#&printp ("digest - $digest");
	if ("$digest" eq "$crypt") {
		$match = "yes";
	}
	return $match;
}

sub printp {
	if ($spin) {
	print "Content-type: text/html; charset=ISO-8859-1\n\n";
	$spin=0;
	}
	print "<p>@_</p>\n";
}


#-------------------EXAMPLE OF SETTING A COOKIE---------------------------
#!/usr/bin/perl

#require "/usr/local/apache/cgi-bin/cookie.pl";
if ($in{'test'} eq "set") {
   $cookie=&set_cookie("login","testuser",0,"/","$ENV{'HTTP_HOST'}");

print "$cookie\n";

print "Content-type: text/html\n\n";
&printp ("set cookie - $cookie");
print "Have we a cookie?????\n";
}

#-------------------EXAMPLE OF GETTING A VALUE FROM A COOKIE--------------
#!/usr/bin/perl

#require "/usr/local/apache/cgi-bin/cookie.pl";
if ($in{'test'} eq "get") {
   print "Content-type: text/html\n\n";

   $cookie=&get_cookie("login");

   if ($cookie ne "")
    {
     print "you have been authenticated as $cookie\n";
    }
   else
    {
     print "Somebody toss me a freakin' cookie....";
    }
   &printp ("get cookie - $cookie"); 
}  
if ($in{'test'} eq "remove") {
#-------------------EXAMPLE OF REMOVING A COOKIE--------------------------
#!/usr/bin/perl

#require "/usr/local/apache/cgi-bin/cookie.pl";

   $cookie=&remove_cookie("login","/","$ENV{'HTTP_HOST'}");

print "$cookie\n";

print "Content-type: text/html\n\n";
&printp ("removed cookie - $cookie");
print "Have we removed a cookie?????\n";

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

