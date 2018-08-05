<?php
$timezone = "America/Los_Angeles";
date_default_timezone_set($timezone);

$base = realpath(dirname($_SERVER["SCRIPT_FILENAME"]) . "/..") . "/";


require "${base}vendor/autoload.php";

use Google\Spreadsheet\DefaultServiceRequest;
use Google\Spreadsheet\ServiceRequestFactory;


$scopes = implode(' ', array("https://spreadsheets.google.com/feeds", Google_Service_Drive::DRIVE_READONLY, Google_Service_Calendar::CALENDAR));

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
$accessToken = json_decode($client->getAccessToken());
$accessToken = $accessToken->{"access_token"};

$serviceRequest = new DefaultServiceRequest($accessToken);
ServiceRequestFactory::setInstance($serviceRequest);

$spreadsheetService = new Google\Spreadsheet\SpreadsheetService();
$spreadsheetFeed = $spreadsheetService->getSpreadsheets();


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

function email ($to, $subject, $contents, $cc = null, $bcc = null) {

    $addresses = is_array($to) ? $to : array($to);
    if (!empty($cc)) {
        if (is_array($cc)) {
            foreach ($cc as $address) {
                array_push($addresses, $address);
            }
        } else if (is_string($cc)) {
            array_push($addresses, $cc);
        }
    }
    if (!empty($bcc)) {
        if (is_array($bcc)) {
            foreach ($bcc as $address) {
                array_push($addresses, $address);
            }
        } else if (is_string($bcc)) {
            array_push($addresses, $bcc);
        }
    }

    // To send HTML mail, the Content-type header must be set
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-type: text/html; charset=iso-8859-1';
    return mail(join(", ", $addresses), $subject,$contents, implode("\r\n", $headers));
}