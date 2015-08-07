<?php

require 'vendor/autoload.php';


use Google\Spreadsheet\DefaultServiceRequest;
use Google\Spreadsheet\ServiceRequestFactory;


$privateKey = file_get_contents("auth.p12");
$clientEmail = "684263653197-clcarg5o7cg5u2rq9h5arkf0fcbr3k57@developer.gserviceaccount.com";
$scopes = array("https://spreadsheets.google.com/feeds");

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

$accessToken = json_decode($client->getAccessToken());
$accessToken = $accessToken->{"access_token"};


$serviceRequest = new DefaultServiceRequest($accessToken);
ServiceRequestFactory::setInstance($serviceRequest);

$spreadsheetService = new Google\Spreadsheet\SpreadsheetService();
$spreadsheetFeed = $spreadsheetService->getSpreadsheets();
$spreadsheet = $spreadsheetFeed->getByTitle('SSBCSJ SSE Registration 2015');
$listFeed = $spreadsheet->getWorksheets()->getByTitle("Main")->getListFeed();
$entries = $listFeed->getEntries();
$listFeed->insert(array("firstname" => "Hello", "lastname" => "World!"));
print_r($entries[0]->getValues ());

?>

