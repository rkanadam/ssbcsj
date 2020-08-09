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
        'timeMin' => '2020-08-21T02:15:00.000Z'
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
    $registrationFeed = $spreadsheet->getWorksheets()->getByTitle("Signup Requests 2020")->getListFeed();

    $value = array();
    $propertiesToCopy = array("city", "date", "name", "email", "phone", "address", "comments");
    $value["timestamp"] = date("n/j/Y H:i:s");
    foreach ($propertiesToCopy as $property) {
        $value[$property] = trim($_REQUEST[$property]);
    }
    if (!empty ($_REQUEST["cityName"])) {
        $value["city"] = $_REQUEST["cityName"];
    }
    if (!empty ($value["date"])) {
        $parsedDate = DateTime::createFromFormat('Y-m-d\TH:i:s+', $value["date"]);
        $parsedDate->setTimeZone(new DateTimeZone('America/Los_Angeles'));
        $parsedDate->modify('-1 day'); // Dont ask, just do, no time to debug
        $value["date"] = $parsedDate->format ("F/d/Y - D");
    }
    $registrationFeed->insert($value);

    $event = new Google_Service_Calendar_Event ();

    $name = $_REQUEST["name"];
    $address = $_REQUEST["address"];
    $email = $_REQUEST["email"];
    $date = $_REQUEST["date"];
    $comments = $_REQUEST["comments"];
    $phone = $_REQUEST["phone"];
    $city = $value["city"];

    $event->setSummary("SSBCSJ Birthday Bhajan - Residence of $name - Virtual");
    $event->setLocation($address);

    $start = new DateTime($date);
    $start->setTimezone(new DateTimeZone($timezone));
    $firstDay = new DateTime("2020-08-21T02:15:00.000Z");
    $firstDay->setTimezone(new DateTimeZone($timezone));
    $interval = $start->diff($firstDay);
    $dayNumber = $interval->days;
    $endingPageNumber = ($dayNumber * 5) % 155;
    $startingPageNumber = $endingPageNumber - 4;
    if ($endingPageNumber === 0) {
        //This is the ending of the book, give it 7 pages and close.
        $startingPageNumber = 150;
        $endingPageNumber = "End of the book";
    }
    $description = <<<EOD

    Format:
        3 OMs
        3 Gayatris
        108 Names of Sathya Sai Link to 108 names of Sai
        5 pages reading of Tapovanam Link to online Tapovanam book
        3 Bhajans
        3 Sai Gayatris
        Aarati
        Samastha Lokah Sukhino Bhavantu
EOD;

    if (!empty($comments)) {
        $description .= "\n-----------------------------------\n$comments\n\n";
    }
    if (!empty($comments)) {
        $description .= "\n-----------------------------------\n$phone\n\n";
    }
    $description .= "\n-----------------------------------\nQuestion ? Please check with the devotional co-ordinator, Susandhya, stbhutia@yahoo.com or 408-836-0179\n\n";


    $event->setDescription($description);

    $defaultFolks = array("stbhutia@yahoo.com");
//    if (stristr($city, "1") !== FALSE) {
//        array_push($defaultFolks, "swamiemail108@gmail.com");
//        array_push($defaultFolks, "sathyanandb@gmail.com");
//        array_push($defaultFolks, "Sameer.Mandalika@gmail.com");
//    } else if (stristr($city, "4") !== FALSE) {
//        array_push($defaultFolks, "vk2004@gmail.com");
//    } else {
//        array_push($defaultFolks, "madhumitha1988@gmail.com");
//        array_push($defaultFolks, "sidc93@gmail.com");
//        array_push($defaultFolks, "sharankashyap@gmail.com");
//    }
    foreach ($defaultFolks as $defaultFolk) {
        $attendee = new Google_Service_Calendar_EventAttendee ();
        $attendee->setEmail($defaultFolk);
        $attendees[] = $attendee;
    }
    $attendee = new Google_Service_Calendar_EventAttendee ();
    $attendee->setEmail($email);
    $attendees[] = $attendee;
    $event->setAttendees($attendees);

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
    sendMail($name, $date, $email, $defaultFolks, $startingPageNumber, $endingPageNumber);
    echo json_encode(true);
}

function sendMail($name, $date, $to, $cc = null, $startingPageNumber, $endingPageNumber)
{
    $date = new DateTime($date);
    $timezone = "America/Los_Angeles";
    $date->setTimezone(new DateTimeZone($timezone));
    $date = $date->format('D, d M y \a\t h:i A');

    $html = <<<EOD
<div style = 'padding: 1em;font-family:Verdana'>
    <div>Sairam! ${name}</div>
    <div style = "padding: 2em">
         <div>
             Thank you for signing up to host Swami's bhajans on <strong>${date}</strong>. If you have questions on the format or the altar or anything else, please contact Susandhya at stbhutia@yahoo.com or 408-836-0179.
             Bhajans start at 7:15PM and the format is:
             <ul>
                <li>3 OMs</li>
                <li>3 Gayatris</li>
                <li>108 Names of Sathya Sai <a target="_blank"
                                               href="http://region7saicenters.org/csj/signups/108.pdf">Link
                    to 108 names of Sai</a></li>
                <li>5 pages of Tapovanam (Page #$startingPageNumber to $endingPageNumber) <a target="_blank"
                                                      href="http://region7saicenters.org/csj/signups/sai-tapovanam-with-page-numbers.pdf">Link
                    to online Tapovanam book</a></li>
                <li>3 Bhajans</li>
                <li>3 Sai Gayatris</li>
                <li>Aarti</li>
                <li>Samastha Lokah Sukhino Bhavantu</li>
            </ul>
         </div>
         <div>
            Hosting Guidelines
<!--            <ul>-->
<!--                <li>Please attend bhajan the previous day to welcome everyone</li>-->
<!--                <li>You must collect Tapovanam books from the previous host</li>-->
<!--                <li>Please keep the altar simple</li>-->
<!--                <li>Only Vibhuti prasad & one fruit recommended for prasad</li>-->
<!--            </ul>-->
            <ul>
                <li>Please do a dry run the day before to ensure you are able to connect and host.</li>
                <li>Please login 5 minutes early.</li>
                <li>Please watch out for any additional announcements facilitating the hosting</li>
                <li>Please keep the altar simple</li>
            </ul>
         </div>
         <br/>
         <div>
             Please treat this e-mail as a confirmation of your signup.
         </div>
    </div>
    <div>Sairam!<br/></div>
</div>
EOD;
    return email($to, "Signup confirmation for hosting Swami's bhajans on $date", $html, $cc);
}

?>
