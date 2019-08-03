<?php
error_reporting(0);

$base = realpath(dirname($_SERVER["SCRIPT_FILENAME"]) . "/../..") . "/";


require "${base}vendor/autoload.php";


use Google\Spreadsheet\DefaultServiceRequest;
use Google\Spreadsheet\ServiceRequestFactory;


$privateKey = file_get_contents("${base}auth.p12");

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
$spreadsheet = $spreadsheetFeed->getByTitle('SSBCSJ SSE Registration 2015/16/17 - DONOTCHANGETITLE');
$registrationFeed = $spreadsheet->getWorksheets()->getByTitle("2019 Registration")->getListFeed();

$rows = array();

$sheetsToMerge = array("2018 Registration", "2019 Registration");
foreach ($sheetsToMerge as $sheetName) {
    $registrationFeed = $spreadsheet->getWorksheets()->getByTitle($sheetName)->getListFeed();
    foreach ($registrationFeed->getEntries() as $entry) {
        $values = $entry->getValues();
        if (!empty ($values["mothersfirstname"]) && !empty ($values["motherslastname"])) {
            $row = array();
            $row["timestamp"] = trim($values["timestamp"]);
            $row["mothersfirstname"] = trim($values["mothersfirstname"]);
            $row["motherslastname"] = trim($values["motherslastname"]);
            $row["fathersfirstname"] = trim($values["fathersfirstname"]);
            $row["fatherslastname"] = trim($values["fatherslastname"]);
            $row["firstnameofchild"] = trim($values["firstnameofchild"]);
            $row["lastnameofchild"] = trim($values["lastnameofchild"]);
            $row["ssegroupofchild"] = trim($values["ssegroupofchild"]);
            $row["schoolgradeofchild"] = trim($values["schoolgradeofchild"]);
            $row["url"] = $entry->getEditUrl();
            $row["sheetTitle"] = $sheetName;
            $combinedKey = strtolower(sprintf("%s-%s", strtolower ($row["firstnameofchild"]), strtolower($row["lastnameofchild"])));
            $rows[$combinedKey] = $row;
        }
    }
}


//ServiceRequestFactory::getInstance()->post($this->getPostUrl(), $entry);

$method = strtolower($_SERVER['REQUEST_METHOD']);

if ($method === "get") {
    $q = $_REQUEST["q"];
    $result = false;
    if (!empty($q) && strlen($q) >= 5) {
        $json = json_decode($q);
        $result = array();
        if ($json && $json->{"firstnameofchild"}) {
            //This if for an exact search
            foreach ($rows as $row) {
                $allPropertiesMatch = true;
                if (!empty ($json->{"fathersfirstname"}) && !empty ($json->{"fatherslastname"})) {
                    $allPropertiesMatch = $row["fathersfirstname"] == $json->{"fathersfirstname"} && $row["fatherslastname"] == $json->{"fatherslastname"};
                } else if (!empty ($json->{"mothersfirstname"}) && !empty ($json->{"motherslastname"})) {
                    $allPropertiesMatch = $row["mothersfirstname"] == $json->{"mothersfirstname"} && $row["motherslastname"] == $json->{"motherslastname"};
                } else {
                    $allPropertiesMatch = false;
                }
                if ($allPropertiesMatch) {
                    //We found children with the same parent!
                    array_push($result, $row);
                }
            }
        } else {
            $keysToSearch = array("mothersfirstname", "motherslastname", "firstnameofchild", "lastnameofchild", "fathersfirstname", "fatherslastname");
            foreach ($rows as $row) {
                foreach ($keysToSearch as $key) {
                    $value = strtolower($row[$key]);
                    if (stristr($value, $q)) {
                        array_push($result, $row);
                        break;
                    }
                }
            }
        }
    }
    echo json_encode($result);
} else if ($method === "post") {

    $values = array();

    $parentPropertiesToCopy = array(
        "fathersfirstname", "fatherslastname", "fathersemail", "fathersphone",
        "mothersfirstname", "motherslastname", "mothersemail", "mothersphone",
        "comments", "centercommunication", "expectations", "interesting", "notinteresting", "change");

    $childPropertiesToCopy = array(
        "firstnameofchild", "lastnameofchild", "ssegroupofchild", "schoolgradeofchild", "allergiesofchild");

    for ($i = 1; $i < 3; ++$i) {
        if (empty($_REQUEST["firstnameofchild$i"])) {
            break;
        }
        $value = array();
        $value["timestamp"] = date("n/j/Y H:i:s");
        foreach ($parentPropertiesToCopy as $parentProperty) {
            $value[$parentProperty] = trim($_REQUEST[$parentProperty]);
        }
        foreach ($childPropertiesToCopy as $childProperty) {
            $value[$childProperty] = trim($_REQUEST["$childProperty$i"]);
        }
        array_push($values, $value);
    }

    foreach ($values as $value) {
        $combinedKey = strtolower(sprintf("%s-%s", $value["firstnameofchild"], $value["lastnameofchild"]));
        if ($rows[$combinedKey] && $rows[$combinedKey]["url"] && $rows[$combinedKey]["sheetTitle"] === "2018 Registration") {
            ServiceRequestFactory::getInstance()->delete($rows[$combinedKey]["url"]);
        }
        $registrationFeed->insert($value);
    }
    echo json_encode(true);
}
?>

