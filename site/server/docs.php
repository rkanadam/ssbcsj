<?php

$method = strtolower($_SERVER['REQUEST_METHOD']);
$action = $_REQUEST["action"];

if ($method === "get") {
    if ($action === "main") {
        $url = 'https://docs.google.com/document/d/1ybeMOSM6_FhqKa9-_qCqBiz0xUSlMf4i5FnTrAqTmDQ/pub';
        $data = array();
        $options = array(
            'http' => array(
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => 'GET',
                'content' => http_build_query($data),
            ),
        );
        $context = stream_context_create($options);
        echo file_get_contents($url, false, $context);
    }
}

