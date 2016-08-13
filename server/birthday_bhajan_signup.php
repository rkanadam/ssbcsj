<?php
require_once "util.php";

$method = strtolower($_SERVER['REQUEST_METHOD']);
$calendarId = 'rs5nhgqdv7hsiruqnralb4t0ak@group.calendar.google.com';
$calendarService = new Google_Service_Calendar($client);

if ($method === "get") {
    // Print the next 10 events on the user's calendar.
    $optParams = array(
        'orderBy' => 'startTime',
        'singleEvents' => TRUE,
        'timeMin' => '2016-08-20T07:00:00.000Z'
    );

    $results = $calendarService->events->listEvents($calendarId, $optParams);
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
    $spreadsheet = $spreadsheetFeed->getByTitle('SSBCSJ - Birthday Bhajan Signup');
    $registrationFeed = $spreadsheet->getWorksheets()->getByTitle("Signup Requests 2016")->getListFeed();

    $value = array();
    $propertiesToCopy = array("city", "date", "name", "email", "phone", "address", "comments");
    $value["timestamp"] = date("n/j/Y H:i:s");
    foreach ($propertiesToCopy as $property) {
        $value[$property] = trim($_REQUEST[$property]);
    }
    $registrationFeed->insert($value);

    $event = new Google_Service_Calendar_Event ();

    $name = $_REQUEST["name"];
    $address = $_REQUEST["address"];
    $email = $_REQUEST["email"];
    $date = $_REQUEST["date"];
    $comments = $_REQUEST["comments"];
    $phone = $_REQUEST["phone"];

    $event->setSummary("SSBCSJ Birthday Bhajan - Residence of $name");
    $event->setLocation($address);
    $description = <<<EOD

    Format:
    3 OMs
    3 Gayatris
    108 Names of Sathya Sai
    9 Bhajans
    Multi Faith Chants
    1 chapter reading of Tapovanam
    Aarti

EOD;

    if (!empty($comments)) {
        $description .= "\nPhone: \n$phone\n\n";
    }
    if (!empty($comments)) {
        $description .= "\nComments: \n$comments\n\n";
    }

    $event->setDescription($description);

    $defaultFolks = array("raghuram.kanadam@gmail.com");
    foreach ($defaultFolks as $defaultFolk) {
        $attendee = new Google_Service_Calendar_EventAttendee ();
        $attendee->setEmail($defaultFolk);
        $attendees[] = $attendee;
    }
    $attendee = new Google_Service_Calendar_EventAttendee ();
    $attendee->setEmail($email);
    $attendees[] = $attendee;
    $event->setAttendees($attendees);

    $start = new DateTime($date);
    $start->setTimezone(new DateTimeZone($timezone));
    $gstart = new Google_Service_Calendar_EventDateTime();
    $gstart->setDateTime($start->format(DateTime::ISO8601));
    $gstart->setTimeZone($timezone);
    $event->setStart($gstart);

    $end = new DateTime($date);
    $end->setTimezone(new DateTimeZone($timezone));
    $end->add(new DateInterval("PT1H"));
    $gend = new Google_Service_Calendar_EventDateTime();
    $gend->setDateTime($end->format(DateTime::ISO8601));
    $gend->setTimeZone($timezone);
    $event->setEnd($gend);

    //Next insert it into the calendar
    $calendarService->events->insert($calendarId, $event);
    sendMail($name, $date, $email);
    echo json_encode(true);
}

function sendMail($name, $date, $to)
{
    $date = new DateTime($date);
    $timezone = "America/Los_Angeles";
    $date->setTimezone(new DateTimeZone($timezone));
    $date = $date->format('D, d M y \a\t h:i A');

    $html = <<<EOD
<div style = 'display:none' id = 'email-template'>
    <div style = 'padding: 1em;font-family:Verdana'>
        <div>Sairam! ${name}</div>
        <div style = "padding: 2em">
             <div>
                 Thank you for signing up to host Swami on <strong>${date}</strong>. If you have questions on the format or the altar or anything else, please contact Raghu at raghuram.kanadam@gmail.com or 408-702-2043.
                 Bhajans start at 8PM and the format is:
                 <ul>
                    <li>3 OMs</li>
                    <li>3 Gayatris</li>
                    <li>108 Names of Sathya Sai <a target="_blank"
                                                   href="../108.pdf">Link
                        to 108 names of Sai</a></li>
                    <li>9 Bhajans <a target="_blank"
                                     href="http://region7saicenters.org/csj/images/documents/ssbcsj_Center%20Bhajan%20book.pdf">Link
                        to Bhajan Book </a></li>
                    <li>Multi Faith Chants <a target="_blank"
                                              href="../108.pdf">Link
                        to Multi Faith Chants </a></li>
                    <li>1 chapter reading of Tapovanam <a target="_blank"
                                                          href="http://www.sathyasaiottawa.org/pdf/SSE_Resources/sai-tapovanam.pdf">Link
                        to online Tapovanam book</a></li>
                    <li>Aarti</li>
                </ul>
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
    email($to, "Signup confirmation for hosting Swami's bhajans on $date", $html);
}

?>