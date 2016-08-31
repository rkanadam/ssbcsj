<?php

require_once "auth.php";

$method = strtolower($_SERVER['REQUEST_METHOD']);
$app = $_REQUEST["app"];

if (empty($app)) {
    echo "error: empty app";
    return;
}

$spreadsheet = $spreadsheetFeed->getByTitle("App Database - $app");
$db = $spreadsheet->getWorksheets()->getByTitle("DB");

if ($method === "get") {
    $entries = $db->getListFeed()->getEntries();
    echo "[";
    $isFirst = true;
    foreach ($entries as $entry) {
        if ($isFirst === true) {
            $isFirst = false;
        } else {
            echo ",";
        }
        echo json_encode($entry->getValues());
    }
    echo "]";
    return;
}
