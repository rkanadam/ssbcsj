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
}