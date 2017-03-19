<?php
ob_start();
$callback = $_REQUEST["callback"];
$base = empty($callback) ? "" : "https://52.90.42.27:8010/ssbcsj/";
?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <base href="<?= $base ?>">
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
        <meta name="description" content="">
        <meta name="author" content="">
        <link rel="icon" href="../../favicon.ico">

        <title>SSBCSJ - Center Devotional Slide Maker</title>
        <!-- Latest compiled and minified CSS -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">

        <!-- Optional theme -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">

        <link rel="stylesheet" href="styles/bootstrap-select.min.css">

        <link rel="stylesheet" href="styles/slide_maker.css">

        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>

        <!-- Latest compiled and minified JavaScript -->
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js"></script>

        <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
        <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
        <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
        <![endif]-->
        <script src="scripts/typeahead.bundle.min.js"></script>
        <script src="scripts/bootstrap-select.min.js"></script>
        <script src="scripts/bhajan_parser.js"></script>
        <script src="scripts/slide_maker.js"></script>

        <!-- include summernote css/js-->
        <link href="https://netdna.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/summernote/0.7.1/summernote.css" rel="stylesheet">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/summernote/0.7.1/summernote.js"></script>
    </head>
    <body id="bhajan_signup">
    <div class="content">
    <div class="container content">
        <div class="row choices bg-info">
            <div class="col-sm-6 text-center">
                <div class="btn-group" id="buttons">
                    <button type="button" class="btn btn-default dropdown-toggle"
                            data-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false">
                        <span class="text">What do you want to do ?</span> <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a href="#bhajanFiller">Search and fill in bhajans</a></li>
                        <li><a href="#slideMaker">Download Bhajan Slides</a></li>
                        <li><a href="#emailReminder">Send E-Mail Reminders</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12" id="bhajanFiller" style="display: none">
                <form id="bhajanSignupForm">
                    <div class="row">
                        <div class="col-sm-6">
                            <div class="form-group">
                                <div class="input-group top20">
                                    <div class="input-group-addon"><span class="glyphicon glyphicon-search"></span>
                                    </div>
                                    <input type="text" id="bhajanPicker" class="form-control typeahead"
                                           placeholder="Type a few words to find a bhajan">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row" id="lyrics">
                        <div class="col-sm-6 text-left">
                            <h5>Lyrics</h5>
                        </div>
                        <div class="col-sm-6 text-left">
                            <textarea class="form-control" name="lyrics"></textarea>
                        </div>
                    </div>
                    <div class="row" id="meaning">
                        <div class="col-sm-6 text-left">
                            <h5>Meaning</h5>
                        </div>
                        <div class="col-sm-6 text-left">
                            <textarea class="form-control" name="meaning"></textarea>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-6 text-left">
                            <h5>Scale</h5>
                        </div>
                        <div class="col-sm-6">
                            <input type="text" name="scale" class="form-control">
                        </div>
                    </div>
                    <div class="row" id="insert">
                        <div class="col-sm-6 top20">
                            <div class="form-group text-center">
                                <div class="bg-danger" style="padding: 5px">
                                    <p>
                                        Before clicking on insert please ensure that you are on the row where you want
                                        to insert the bhajan.
                                    </p>
                                    <p>
                                        Select any cell on that row first and then click insert
                                    </p>
                                </div>
                                <input type="button" class="btn btn-lg btn-primary" value="Insert">
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12" id="slideMaker" style="display: none">
                <div class="panel panel-default">
                    <div class="panel-body">
                        <div class="row">
                            <div class="col-sm-12">
                                <dl class="dl-horizontal">
                                    <dt>Bhajans</dt>
                                    <dd id="bhajans"><span>?</span></dd>
                                    <dt>Unisons</dt>
                                    <dd id="unisons"><span>?</span></dd>
                                    <dt>Divine Code of Conduct</dt>
                                    <dd id="divineCodeOfConduct"><span>Divine Code of Conduct</span></dd>
                                    <dt>Thought for the Week</dt>
                                    <dd id="thoughtForTheWeek"><span>Thought for the Week</span></dd>
                                    <dt>Missing Bhajans</dt>
                                    <dd id="missingBhajans">
                                        <ul style="padding-left: 15px"></ul>
                                    </dd>
                                </dl>
                            </div>
                            <div class="row">
                                <div class="col-sm-6">
                                    <form id="slideGeneratorForm" method="post"
                                          action="https://52.90.42.27:1926/make" target="_blank">
                                        <input type="hidden" name="bhajans" value="" id="bhajans">
                                        <div class="form-group text-center">
                                            <label for="slideTemplate">Slide Template</label>
                                            <select name = "template" class="form-control" id = "slideTemplate">
                                                <option value="25th Anniversary" selected>25th Anniversary</option>
                                                <option value="CSJ" selected>CSJ</option>
                                                <option value="GAB2016">GAB 2016</option>
                                                <option value="Peninsula">Peninsula Sai Center</option>
                                                <option value="Shivaratri2016">Shivaratri 2016</option>
                                                <option value="Regional Retreat 2016">Regional Retreat 2016</option>
                                            </select>
                                        </div>
                                    </form>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group text-center">
                                        <input type="button" class="btn btn-lg btn-primary" value="Download Slides"
                                               id="downloadSlides">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12" id="emailReminder" style="display: none">
                <div class="row">
                    <div class="col-sm-6">
                        <h5>CC</h5>
                    </div>
                    <div class="col-sm-6">
                        <input type="text" id="cc" name="cc" class="form-group"
                               placeholder="comma separated e-mail addresses" value="raghuram.kanadam@gmail.com">
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6">
                        <h5>BCC</h5>
                    </div>
                    <div class="col-sm-6">
                        <input type="text" id="bcc" name="bcc" class="form-group"
                               placeholder="comma separated e-mails addresses">
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6">
                        <h5>Subject</h5>
                        <h6>Type { to see placeholders values</h6>
                    </div>
                    <div class="col-sm-6">
                        <div id="subject">You are scheduled to sing a {description} on {date} at {time}</div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6">
                        <h5>E-Mail</h5>
                        <h6>Type { to see placeholders values</h6>
                    </div>
                    <div class="col-sm-6">
                        <div id="email">
                            <div
                                style="color: rgb(34, 34, 34); font-family: Verdana; font-size: 12.8px; line-height: normal;">
                                Sairam {name},
                            </div>
                            <div
                                style="color: rgb(34, 34, 34); font-family: Verdana; font-size: 12.8px; line-height: normal; padding: 2em;">
                                <div>You are scheduled to lead a devotional song on&nbsp;<strong>{date}</strong>&nbsp;at&nbsp;<strong>{time}</strong>.
                                </div>
                                <br>

                                <div>Please do find the lyrics as will be projected on the slide listed
                                    below.<br><strong
                                        style="color: red; text-decoration: underline; font-size: medium;">Please
                                        respond to this e-mail and let us know if these are incorrect</strong>.
                                </div>
                                <div><br></div>
                                <div><pre
                                        style="white-space: pre-wrap; font-family: monospace; font-size: large; color: blue;">{lyrics}
</pre>
                                </div>
                                <div><strong>Practiced Scale</strong>&nbsp;:&nbsp;
                                    <pre style="white-space: pre-wrap; font-family: monospace; font-size: large;">{scale}</pre>
                                </div>
                            </div>
                            <p><span
                                    style="color: rgb(34, 34, 34); font-family: Verdana; font-size: 12.8px; line-height: normal;">Thank you! for taking the time to respond back to us. Sairam</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6">
                        <div class="form-group text-center">
                            <input type="button" class="btn btn-lg btn-primary" value="Send E-Mails"
                                   id="sendEmail">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="indicator" title="Please wait ..." style="overflow: hidden;display: none">
        <div
            style="position:absolute;top: 0%;left: 0%;width: 100%;height: 100%;background: #CCC;opacity: .9;z-index: 100">
        </div>
        <div class="progress progress-striped active"
             style="height: 50px;margin-bottom: 0px;position:absolute;top: 50%;left: 25%;width: 50%;z-index: 101">
            <div class="progress-bar progress-bar-info" style="width: 100%">
                <h4>Loading ...</h4>
            </div>
        </div>
    </div>
    </body>
    </html>
<?php
$content = ob_get_contents();
ob_end_clean();
if (!empty($callback)) {
    echo "$callback(" . json_encode($content) . ")";
} else {
    echo $content;
}
?>