<?php
require_once "./util.php";

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
             Thank you for signing up to host Swami's bhajans on <strong>${date}</strong>. If you have questions on the format or the altar or anything else, please contact Raghu at raghuram.kanadam@gmail.com or 408-702-2043.
             Bhajans start at 8PM and the format is:
             <ul>
                <li>3 OMs</li>
                <li>3 Gayatris</li>
                <li>108 Names of Sathya Sai <a target="_blank"
                                               href="http://region7saicenters.org/csj/signups/108.pdf">Link
                    to 108 names of Sai</a></li>
                <li>9 Bhajans <a target="_blank"
                                 href="http://region7saicenters.org/csj/images/documents/ssbcsj_Center%20Bhajan%20book.pdf">Link
                    to Bhajan Book </a></li>
                <li>Multi Faith Chants <a target="_blank"
                                          href="http://region7saicenters.org/csj/signups/108.pdf">Link
                    to Multi Faith Chants </a></li>
                <li>5 pages of Tapovanam (Page #$startingPageNumber to $endingPageNumber) <a target="_blank"
                                                      href="http://region7saicenters.org/csj/signups/sai-tapovanam-with-page-numbers.pdf">Link
                    to online Tapovanam book</a></li>
                <li>Aarti</li>
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

sendMail("Raghuram Kanadam", "11/23/2018", "raghuram.kanadam@gmail.com", "ksrraghuram@yahoo.co.in", 10, 15);
?>
Hello
