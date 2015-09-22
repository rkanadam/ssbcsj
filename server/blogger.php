<?php
date_default_timezone_set("America/Los_Angeles");

$base = realpath(dirname($_SERVER["SCRIPT_FILENAME"]) . "/..") . "/";


require "${base}vendor/autoload.php";

use Google\Spreadsheet\DefaultServiceRequest;
use Google\Spreadsheet\ServiceRequestFactory;


$scopes = implode(' ', array(
    Google_Service_Blogger::BLOGGER_READONLY));

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
    $service = new Google_Service_Blogger($client);
    $posts = $service->posts->listPosts("6307492909634712244", array("maxResults" => 90, "fetchBodies" => true))->getItems();
    echo json_encode($posts);
}
?>