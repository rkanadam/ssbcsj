<?php

require_once "util.php";

$spreadsheet = $spreadsheetFeed->getByTitle('Devotional Service - SSBCSJ');

$method = strtolower($_SERVER['REQUEST_METHOD']);

if ($method === "get") {
    $action = $_REQUEST["action"];
    if (empty($action)) {
        $fd = fopen("{$base}files/Devotional Song Database.csv", "r");
        $lines = array();
        while ($line = fgetcsv($fd)) {
            $lines[] = $line;
        };
        echo json_encode($lines);
    } else if ($action === "get") {
        $date = $_REQUEST["date"];
        $date = date_parse($date);
        $date = date('m/d/Y', mktime($date_array['hour'], $date_array['minute'], $date_array['second'], $date_array['month'], $date_array['day'], $date_array['year']));
        foreach ($spreadsheet->getWorksheets() as $worksheet) {
            echo $worksheet->getTitle ();
            if (stristr($worksheet->getTitle(), $date) !== false) {
                //Found the sheet for the week, now send its contents back
                $cellFeed = $worksheet->getCellFeed();
                echo json_encode(array("rows" => $worksheet->getRowCount(), "cols" => $worksheet->getColCount()));
            }
        }
        echo false;
    } else if ($action === "list") {
        $sheets = array();
        $format = "m/d/Y";
        $today = new DateTime ("now");
        $today = $today->format($format);
        $today = DateTime::createFromFormat($format, $today);

        foreach ($spreadsheet->getWorksheets() as $worksheet) {
            $title = $worksheet->getTitle();
            $matches = array();
            if (preg_match("/([0-9]{2}\/[0-9]{2}\/[0-9]{4})/", $title, $matches)) {
                $date = DateTime::createFromFormat($format, $matches[1]);
                if ($date->getTimestamp() > $today->getTimestamp()) {
                    $sheet = array("title" => $title);
                    $numRows = $worksheet->getRowCount();
                    $numCols = $worksheet->getColCount();
                    $cellFeed = $worksheet->getCellFeed();
                    $data = array();
                    for ($i = 0; $i < $numRows; ++$i) {
                        for ($j = 0; $j < $numCols; ++$j) {
                            if ($cellFeed->getCell($i, $j)) {
                                if (!array_key_exists($i, $data)) {
                                    $data[$i] = array();
                                }
                                $data[$i][$j] = $cellFeed->getCell($i, $j)->getContent();
                            }
                        }
                    }
                    $sheet["timestamp"] = $date->getTimestamp () * 1000;
                    $sheet["data"] = $data;
                    $sheet["rowCount"] = $numRows;
                    $sheet["colCount"] = $numCols;
                    $sheets[] = $sheet;
                }
            }
        }
        echo json_encode($sheets);
    }
} else if ($method === "post") {
    echo json_encode(true);
}



?>