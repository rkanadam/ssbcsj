<?php
$timezone = "America/Los_Angeles";
date_default_timezone_set($timezone);

$base = realpath(dirname($_SERVER["SCRIPT_FILENAME"]) . "/..");


require "$base/vendor/autoload.php";

use Google\Spreadsheet\DefaultServiceRequest;
use Google\Spreadsheet\ServiceRequestFactory;


$scopes = implode(' ', array("https://spreadsheets.google.com/feeds", Google_Service_Drive::DRIVE, Google_Service_Calendar::CALENDAR));

$privateKey = "$base/server/auth.p12";

$clientEmail = "684263653197-clcarg5o7cg5u2rq9h5arkf0fcbr3k57@developer.gserviceaccount.com";

$client = new Google_Client();
$client->setAuthConfig($privateKey);
$client->addScope($scopes);

if ($client->isAccessTokenExpired()) {
    $client->refreshTokenWithAssertion();
}


$accessToken = $client->getAccessToken();
$accessToken = $accessToken["access_token"];

$serviceRequest = new DefaultServiceRequest($accessToken);
ServiceRequestFactory::setInstance($serviceRequest);

$spreadsheetService = new Google\Spreadsheet\SpreadsheetService();
$spreadsheetFeed = $spreadsheetService->getSpreadsheets();

$drive = new Google_Service_Drive($client);
$sheets = new Google_Service_Sheets($client);



function startsWith($haystack, $needle)
{
    // search backwards starting from haystack length characters from the end
    return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== FALSE;
}

function endsWith($haystack, $needle)
{
    // search forward starting from end minus needle length characters
    return $needle === "" || (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== FALSE);
}

$drive = new Google_Service_Drive($client);

function email($to, $subject, $contents)
{
    $url = 'https://script.google.com/macros/s/AKfycbw8zsf1KdEHiaMoydYYafJp6TY0LSI4hj26TrrYAAnQLukfQPU/exec';
    $data = array('to' => $to, 'subject' => $subject, "body" => $contents);
    $options = array(
        'http' => array(
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data),
        ),
    );
    $context = stream_context_create($options);
    return file_get_contents($url, false, $context);
}

function findFile($name, $folder = null, $create = false)
{
    global $drive;

    $query = "name = '$name' and mimeType != 'application/vnd.google-apps.folder'";
    if (!empty ($folder)) {
        if (is_string($folder)) {
            $query .= " and '" . $folder . "' in parents";
        } else {
            $query .= " and '" . $folder->getId() . "' in parents";
        }
    }

    $children = $drive->files->listFiles(array("q" => $query));
    if ($children && $children->getFiles() && count($children->getFiles())) {
        return $children->getFiles()[0];
    }

    if ($create === true) {
        return newFile($name, $folder);
    }

    return null;
}

function findDirectory($name, $parent = null, $create = false)
{
    global $drive;

    $query = "name = '$name' and mimeType = 'application/vnd.google-apps.folder'";
    if (!empty ($parent)) {
        if (is_string($parent)) {
            $query .= " and '" . $parent . "' in parents";
        } else {
            $query .= " and '" . $parent->getId() . "' in parents";
        }
    }

    $children = $drive->files->listFiles(array("q" => $query));
    if ($children && $children->getFiles() && count($children->getFiles())) {
        return $children->getFiles()[0];
    }

    if ($create === true) {
        return newDirectory($name, $parent);
    }

    return null;
}

function newDirectory($name, $parent = null)
{

    global $drive;
    $args = array('name' => $name, 'mimeType' => 'application/vnd.google-apps.folder');
    if (is_string($parent)) {
        $args["parents"] = $parent;
    } else {
        $args["parents"] = $parent->getId();
    }
    $folder = new Google_Service_Drive_DriveFile($args);

    return $drive->files->create($folder, array(
        'fields' => 'id'));
}

function newFile($name, $parent = null)
{

    global $drive;
    $args = array('name' => $name);
    if (is_string($parent)) {
        $args["parents"] = $parent;
    } else {
        $args["parents"] = $parent->getId();
    }
    $folder = new Google_Service_Drive_DriveFile($args);

    return $drive->files->create($folder, array(
        'fields' => 'id'));
}