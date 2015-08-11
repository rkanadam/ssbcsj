<?php
date_default_timezone_set("America/Los_Angeles");

$base = realpath(dirname($_SERVER["SCRIPT_FILENAME"]) . "/../..") . "/";


require "${base}vendor/autoload.php";

$scopes = implode(' ', array(
    Google_Service_Calendar::CALENDAR,
    Google_Service_Drive::DRIVE));

$privateKey = file_get_contents("${base}auth.p12");

$clientEmail = "684263653197-clcarg5o7cg5u2rq9h5arkf0fcbr3k57@developer.gserviceaccount.com";

$credentials = new Google_Auth_AssertionCredentials(
    $clientEmail,
    $scopes,
    $privateKey
);

$client = new Google_Client();
$client->setAssertionCredentials($credentials);
if ($client->getAuth()->isAccessTokenExpired()) {
    $client->getAuth()->refreshTokenWithAssertion();
}


$service = new Google_Service_Calendar($client);
// Print the next 10 events on the user's calendar.
$calendarId = 'rs5nhgqdv7hsiruqnralb4t0ak@group.calendar.google.com';
$optParams = array(
    'orderBy' => 'startTime',
    'singleEvents' => TRUE
);


$results = $service->events->listEvents($calendarId, $optParams);

if (count($results->getItems()) == 0) {
    print "No upcoming events found.\n";
} else {
    print "Upcoming events:\n";
    foreach ($results->getItems() as $event) {
        $start = $event->start->dateTime;
        if (empty($start)) {
            $start = $event->start->date;
        }
        printf("%s (%s) (%s) (%s)\n", $event->getSummary(), $start, $event->location, print_r($event->getAttendees ()[0]->getEmail (), true));
    }
}
?>