<?php
namespace FlexSuite;

class Autoloader
{
    protected static $_Registered = array();

    public static function autoloader($classname) {

        if(strpos($classname, "\\")) {
            $classname = trim($classname, '\\');
            $prefix = explode("\\", $classname);
        } else {
            $prefix = explode("_", $classname);
        }

        if(!isset(self::$_Registered[$prefix[0]])) {
            return false;
        }

        $path = self::$_Registered[$prefix[0]]."/";
        $classNamePath = str_replace(array("_", "\\"), "/", $classname);

        $targetFile = realpath($path.$classNamePath.".php");

        if(strpos($targetFile, vglobal('root_directory')) === 0) {
            if(file_exists($targetFile)) {
                require_once($path.$classNamePath.".php");
            }
        }
    }

    public static function registerDirectory($directory) {
        if(substr($directory, 0, 1) == "~") {
            global $root_directory;
            $directory = $root_directory."/".substr($directory, 2);
        }

        $directory = realpath($directory);
        if(is_dir($directory)) {
            $alle = glob($directory.'/*');
            foreach($alle as $datei) {
                if(is_dir($datei)) {
                    self::register(basename($datei), $directory);
                }
            }

        }

    }

    public static function register($prefix, $directory) {
        if(substr($directory, 0, 1) == "~") {
            global $root_directory;
            $directory = $root_directory."/".substr($directory, 2);
        }

        if(file_exists($directory)) {
            self::$_Registered[$prefix] = $directory;
        }
    }

}

defined('DS') ? '' : define('DS', DIRECTORY_SEPARATOR);

spl_autoload_register(__NAMESPACE__ .'\Autoloader::autoloader');

Autoloader::registerDirectory(__DIR__ . DS . '..' . DS . 'lib');