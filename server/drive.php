<?php

require_once "util.php";

$results = $drive->files->listFiles();

if (count($results->getItems()) == 0) {
    print "No files found.\n";
} else {
    print "Files:\n";
    foreach ($results->getItems() as $file) {
        printf("%s (%s, %s)\n", $file->getTitle(), $file->getId(), $file->getWebContentLink ());
    }
}