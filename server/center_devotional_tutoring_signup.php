<?php

require_once "util.php";

$spreadsheet = $spreadsheetFeed->getByTitle('Bhajan Tutoring - SSBCSJ');

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
            echo $worksheet->getTitle();
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
                    $sheet["timestamp"] = $date->getTimestamp() * 1000;
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
    $sheetTitle = $_REQUEST["sheetTitle"];
    if (empty($sheetTitle)) {
        echo json_encode(false);
        exit (0);
    }

    $sheet = $spreadsheet->getWorksheets()->getByTitle($sheetTitle);
    if (!$sheet) {
        echo json_encode(false);
        exit (0);
    }

    $row = $_REQUEST["row"];
    if (empty($row)) {
        echo json_encode(false);
        exit (0);
    }
    $row = intval($row, 10);
    $cellFeed = $sheet->getCellFeed();
    if ($row <= 0) {
        echo json_encode(false);
        exit (0);
    }

    $updateBatch = new \Google\Spreadsheet\Batch\BatchRequest();
    $insertBatch = new \Google\Spreadsheet\Batch\BatchRequest();
    $hasAnUpdate = false;
    $hasAnInsert = true;

    $maxColNum = intval($_REQUEST["colCount"], 10);
    for ($col = 1; $col <= $maxColNum; ++$col) {
        if (array_key_exists("col$col", $_REQUEST)) {
            $cell = $cellFeed->getCell($row, $col);
            if ($cell) {
                $cell->setContent($_REQUEST["col$col"]);
                $updateBatch->addEntry($cell);
                $hasAnUpdate = true;
            } else {
                $cell = $cellFeed->createInsertionCell($row, $col, $_REQUEST["col$col"]);
                $insertBatch->addEntry($cell);
                $hasAnInsert = true;
            }
        }
    }
    if ($hasAnUpdate) {
        $cellFeed->updateBatch($updateBatch);
    }
    if ($hasAnInsert) {
        $cellFeed->insertBatch($insertBatch);
    }

    sendMail($_REQUEST["name"], $_REQUEST["description"], $_REQUEST["date"], $_REQUEST["email"]);
    echo json_encode(true);
}

function sendMail ($name, $description, $date, $to) {
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
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data),
        ),
    );
    $context  = stream_context_create($options);
    file_get_contents($url, false, $context);
}
