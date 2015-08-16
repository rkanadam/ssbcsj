<?php
date_default_timezone_set("America/Los_Angeles");

$base = realpath(dirname($_SERVER["SCRIPT_FILENAME"]) . "/../..") . "/";


require "${base}vendor/autoload.php";

use Google\Spreadsheet\DefaultServiceRequest;
use Google\Spreadsheet\ServiceRequestFactory;


$scopes = implode(' ', array(
    Google_Service_Calendar::CALENDAR,
    "https://spreadsheets.google.com/feeds"));

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
$method = strtolower($_SERVER['REQUEST_METHOD']);

if ($method === "get") {
    $service = new Google_Service_Calendar($client);
// Print the next 10 events on the user's calendar.
    $calendarId = 'rs5nhgqdv7hsiruqnralb4t0ak@group.calendar.google.com';
    $optParams = array(
        'orderBy' => 'startTime',
        'singleEvents' => TRUE
    );


    $results = $service->events->listEvents($calendarId, $optParams);
    $response = array();
    foreach ($results->getItems() as $event) {
        $response[] = array("start" => $event->start->dateTime,
            "end" => $event->end->dateTime,
            "location" => $event->location,
            "summary" => $event->summary,
            "description" => $event->description);
    }
    echo json_encode($response);
} else if ($method === "post") {

    $accessToken = json_decode($client->getAccessToken());
    $accessToken = $accessToken->{"access_token"};

    $serviceRequest = new DefaultServiceRequest($accessToken);
    ServiceRequestFactory::setInstance($serviceRequest);

    $spreadsheetService = new Google\Spreadsheet\SpreadsheetService();
    $spreadsheetFeed = $spreadsheetService->getSpreadsheets();
    $spreadsheet = $spreadsheetFeed->getByTitle('SSBCSJ - 90 Day Bhajan Signup');
    $registrationFeed = $spreadsheet->getWorksheets()->getByTitle("Signup Requests")->getListFeed();

    $value = array();
    $propertiesToCopy = array("city", "date", "name", "email", "phone", "address", "comments");
    $value["timestamp"] = date("n/j/Y H:i:s");
    foreach ($propertiesToCopy as $property) {
        $value[$property] = trim($_REQUEST[$property]);
    }
    $registrationFeed->insert($value);
    echo json_encode(true);
}
?>