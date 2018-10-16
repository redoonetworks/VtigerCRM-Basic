<?php
/**
 * Created by PhpStorm.
 * User: StefanWarnat
 * Date: 05.10.2018
 * Time: 11:29
 */
//define('PHP_BINARY', 'D:\php\php-7.2.10\php.exe');
//define('PHPDOC_PHAR', 'D:\php\php-7.2.10\phpDocumentor.phar');

define('PHP_BIN', 'php');
define('PHPDOC_PHAR', __DIR__ . DIRECTORY_SEPARATOR . 'phpDocumentor.phar');

define('ROOT_DIR', realpath(__DIR__ . DIRECTORY_SEPARATOR . '..') . DIRECTORY_SEPARATOR);

define('DOCS_DIR', realpath(ROOT_DIR . 'docs') . '/');

//var_dump(PHP_BINARY . ' '.PHPDOC_PHAR.' -t '.DOCS_DIR.'Workflow/ -d '.realpath(ROOT_DIR . DIRECTORY_SEPARATOR . 'modules' . DIRECTORY_SEPARATOR . 'Workflow2' . DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR . 'Workflow'));
//exit();

$output = '';
exec(
    PHP_BIN . ' '.PHPDOC_PHAR.' --template="responsive-twig"  -c '.__DIR__.'/phpdocs/Workflow2.xml -t '.DOCS_DIR.'Workflow/ -d '.realpath(ROOT_DIR . DIRECTORY_SEPARATOR . 'modules' . DIRECTORY_SEPARATOR . 'Workflow2' . DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR . 'Workflow'),
    $output
);

$rootPath = DOCS_DIR.'Workflow/';
$targetFile = __DIR__ . '/phpdocs/docs.zip';

// Initialize archive object
$zip = new \ZipArchive();
$zip->open($targetFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);

// Create recursive directory iterator
/** @var SplFileInfo[] $files */
$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($rootPath),
    RecursiveIteratorIterator::LEAVES_ONLY
);

foreach ($files as $name => $file)
{
    // Skip directories (they would be added automatically)
    if (!$file->isDir())
    {
        // Get real and relative path for current file
        $filePath = $file->getRealPath();
        $relativePath = substr($filePath, strlen($rootPath));

        // Add current file to archive
        $zip->addFile($filePath, $relativePath);
    }
}

// Zip archive will be created only after closing object
$zip->close();

exec('curl -u swarnat:LCD1980mlgr -X POST --upload-file '.$targetFile.' https://wiki.redoo-networks.com/rest/docs/2.0/repository/c1001-d1008 -H "X-Atlassian-Token: no-check"', $output);
var_dump($output);