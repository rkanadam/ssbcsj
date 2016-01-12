<?php

require_once "util.php";

$calendarId = "ailsv609cntohfr2jl3a78vl5s@group.calendar.google.com";
$method = strtolower($_SERVER['REQUEST_METHOD']);
$calendarService = new Google_Service_Calendar($client);

if ($method === "get") {
    $calendarService = new Google_Service_Calendar($client);
    $optParams = array(
        'orderBy' => 'startTime',
        'singleEvents' => TRUE
    );

    $results = $calendarService->events->listEvents($calendarId, $optParams);
    $response = array();
    foreach ($results->getItems() as $event) {
        $response[] = array("start" => $event->start->dateTime,
            "end" => $event->end->dateTime,
            "location" => $event->location,
            "summary" => $event->summary,
            "description" => $event->description,
            "id" => $event->getId());
    }
    echo json_encode($response);
} else {
    $spreadsheetService = new Google\Spreadsheet\SpreadsheetService();
    $spreadsheetFeed = $spreadsheetService->getSpreadsheets();
    $spreadsheet = $spreadsheetFeed->getByTitle('Fremont Bhajan Signup');
    $signupFeed = $spreadsheet->getWorksheets()->getByTitle("Signup Requests")->getListFeed();

    $id = $_REQUEST["when"];
    $name = $_REQUEST["name"];
    $address = $_REQUEST["address"];
    $email = $_REQUEST["email"];
    $event = $calendarService->events->get($calendarId, $id);

    $value = array();
    $propertiesToCopy = array("name", "email", "phone", "address", "comments");
    $value["date"] = date("n/j/Y H:i:s", $event->getStart()->dateTime);
    $value["timestamp"] = date("n/j/Y H:i:s");
    foreach ($propertiesToCopy as $property) {
        $value[$property] = trim($_REQUEST[$property]);
    }
    $signupFeed->insert($value);

    $event->setSummary("Bhajans in the residence of $name");
    $event->setLocation($address);
    $attendees = array();
    $defaultFolks = array("siva.paturi@gmail.com", "hasmouli@yahoo.com");
    foreach ($defaultFolks as $defaultFolk) {
        $attendee = new Google_Service_Calendar_EventAttendee ();
        $attendee->setEmail($defaultFolk);
        //$attendees[] = $attendee;
    }
    $attendee = new Google_Service_Calendar_EventAttendee ();
    $attendee->setEmail($email);
    $attendees[] = $attendee;
    $event->setAttendees($attendees);
    $calendarService->events->update($calendarId, $id, $event, array("sendNotifications" => true));
    echo json_encode(true);
}

function sendMail($name, $description, $date, $to)
{
    $description = trim($description);
    if (preg_match("/^a/i", $description) > 0) {
        $description = "The $description";
    } else {
        $description = "A $description";
    }
    $description = strtolower($description);

    $html = <<<EOD
<div style = 'display:none' id = 'email-template'>
    <div style = 'padding: 1em;font-family:Verdana'>
        <div>Sairam! ${name}</div>
        <div style = "padding: 2em">
             <div>
                 Thank you for signing up to lead $description at the Sathya Sai Baba Center of Central San Jose on <strong>${date}</strong>
             </div>
             <br/>
             <div>
                 Please treat this e-mail as a confirmation of your signup.
             </div>
        </div>
        <div>Sairam!<br/></div>
    </div>
</div>
EOD;

    $url = 'https://script.google.com/macros/s/AKfycbw8zsf1KdEHiaMoydYYafJp6TY0LSI4hj26TrrYAAnQLukfQPU/exec';
    $data = array('to' => $to, 'subject' => "Signup confirmation for leading $description on $date", "body" => $html);
    $options = array(
        'http' => array(
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data),
        ),
    );
    $context = stream_context_create($options);
    file_get_contents($url, false, $context);
}
