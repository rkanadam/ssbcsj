<?php

require_once "auth.php";

$calendarId = '1aaum9q0ba146736315qmrk5ao@group.calendar.google.com';
$calendarService = new Google_Service_Calendar($client);
$method = strtolower($_SERVER['REQUEST_METHOD']);

$eventName = $_REQUEST["event"];
$what = $_REQUEST["what"];

if (empty($eventName) || empty($what)) {
    return;
}

if ($what === "schedule") {
    // Print the next 10 events on the user's calendar.
    $optParams = array(
        'orderBy' => 'startTime',
        'singleEvents' => TRUE,
        'timeMin' => '2016-08-20T07:00:00.000Z'
    );

    $results = $calendarService->events->listEvents($calendarId, $optParams);
    $response = array();
    foreach ($results->getItems() as $event) {
        if (strpos($event->summary, "#i2i") !== false && strpos($event->summary, "#$eventName") !== false) {
            $response[] = array("start" => $event->start->dateTime,
                "end" => $event->end->dateTime,
                "location" => $event->location,
                "summary" => $event->summary,
                "description" => $event->description);
        }
    }
    echo json_encode($response);
}