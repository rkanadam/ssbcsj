<?php

require_once "util.php";


$spreadsheet = $spreadsheetFeed->getByTitle('Grandparents Clothes Service - SSE - 2016');

$method = strtolower($_SERVER['REQUEST_METHOD']);

if ($method === "get") {
    foreach ($spreadsheet->getWorksheets() as $worksheet) {
        $title = $worksheet->getTitle();
        $matches = array();
        $sheet = array("title" => $title);
        $numRows = $worksheet->getRowCount();
        $numCols = $worksheet->getColCount();
        $cellFeed = $worksheet->getCellFeed();
        $data = array();
        $today = new DateTime ("now");
        for ($i = 0; $i < $numRows; ++$i) {
            for ($j = 0; $j <= $numCols; ++$j) {
                if ($cellFeed->getCell($i, $j)) {
                    if (!array_key_exists($i, $data)) {
                        $data[$i] = array();
                    }
                    $data[$i][$j] = $cellFeed->getCell($i, $j)->getContent();
                }
            }
        }
        $sheet["timestamp"] = $today->getTimestamp() * 1000;
        $sheet["data"] = $data;
        $sheet["rowCount"] = $numRows;
        $sheet["colCount"] = $numCols;
        echo json_encode($sheet);
        //This will process one sheet only
        return;
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

    sendMail($_REQUEST["name"], $_REQUEST["description"], $_REQUEST["date"], $_REQUEST["email"] /* Add any additional emails here . "," */);
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
<div style = 'display:block' id = 'email-template'>
    <div style = 'padding: 1em;font-family:Verdana'>
        <div>Sairam! ${name}</div>
        <div style = "padding: 2em">
             <div>
                 Thank you for signing up with  a $description for the Grand Parents Winter Service on behalf of the Sathya Sai Baba Center of Central San Jose.
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
    email($to, "Signup confirmation for Grand Parents Winter Service - $description", $html);
}
