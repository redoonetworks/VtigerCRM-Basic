<?php
use Ifsnop\Mysqldump as IMysqldump;

require_once('vendor/autoload.php');
require_once('../config.inc.php');

$db_server   = $dbconfig['db_server'];
$db_name     = $dbconfig['db_name'];
$db_username = $dbconfig['db_username'];
$db_password = $dbconfig['db_password']; 

$filename = 'mysqldump.sql';

try {
	$dumpSettingsDefault = array(
		'add-drop-table' => true,
	);
	
    $dump = new IMysqldump\Mysqldump('mysql:host='.$db_server.';dbname='.$db_name, $db_username, $db_password, $dumpSettingsDefault);
    $dump->start($filename);
} catch (\Exception $e) {
    echo 'mysqldump-php error: ' . $e->getMessage();
}