<?php

require_once "util.php";

$method = strtolower($_SERVER['REQUEST_METHOD']);
$app = $_REQUEST["app"];

if (empty($app)) {
    echo "error: empty app";
    return;
}

$i2iFolder = findDirectory("0B3fQzMzGKQsccFQzZUQza1RMZ1E");
$appFolder = findDirectory($app, $i2iFolder, true);

$sheet = findFile("$app.gsheet", $appFolder, true);
$sheet = $sheets->spreadsheets_values->get($sheet->getId(), "DB!");

$db = $sheet->getSheets()->getWorksheets()->getByTitle("DB");

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
} else if ($method === "post") {
    $values = json_decode($_REQUEST["values"]);
    if (is_array($values)) {

    }
}
