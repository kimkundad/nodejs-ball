<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
// header("Content-Type: text/plain");

// include('functions.php');

$logDatas = file_get_contents("log.html");
?>
<html>
    <head>
		<meta charset="utf-8">
        <title>Log datas</title>

		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
		<meta name="csrf-token" content="mUaUC6PfXbZh8B4GtwreHWufjk1ptInZ6sJSU69u">

		<meta name="robots" content="noindex" />
		<meta name="description" content="">

		<!-- <link rel="icon" type="image/png" href="https://dooball-zaa.com/frontend/images/favicon.png" /> -->
        <style>
            body {
                margin: 0;
                padding: 15px;
                background: #ededed;
            }
        </style>
    </head>
    <body>
        <p><?php echo $logDatas; ?></p>
    </body>
</html>