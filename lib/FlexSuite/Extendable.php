<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Stefan Warnat <support@stefanwarnat.de>
 * Date: 20.09.14 23:16
 * You must not use this file without permission.
 */
namespace FlexSuite;


abstract class Extendable {
    private static $_interfaces = array();
    private static $_objectCache = array();

    private $_extendableKey = null;
    protected $_workflow = null;

    public function __construct($key) {
        $this->_extendableKey = $key;
    }
    public function getExtendableKey() {
        return $this->_extendableKey;
    }
    public function setWorkflow($value) {
        $this->_workflow = $value;
    }
    public function getWorkflow() {
        return $this->_workflow;
    }
    public static function getKeyByClassname($className) {
        $className = '\\'.str_replace("/", "\\", trim($className, '/'));

        if(empty(self::$_interfaces[get_called_class()])) {
            $ParentClassName = get_called_class();
            $ParentClassName::init();
            foreach(self::$_interfaces[get_called_class()] as $key => $ItemClassName) {
                if($ItemClassName === $className) {
                    return $key;
                }
            }

            return false;
        }
    }
    public static function register($key, $class) {

        if(!in_array($class, self::$_interfaces)) {
            self::$_interfaces[get_called_class()][$key] = $class;
        }
    }
    public static function getItem($key) {
        static::init();

        if(isset(self::$_interfaces[get_called_class()][$key])) {
            return new self::$_interfaces[get_called_class()][$key]($key);
        } else {
            return false;
        }

    }
    public static function getItems() {
        static::init();

        if(empty(self::$_objectCache[get_called_class()])) {
            self::$_objectCache[get_called_class()] = array();

            foreach(self::$_interfaces[get_called_class()] as $key => $interface) {
                self::$_objectCache[get_called_class()][] = new $interface($key);
            }
        }

        return self::$_objectCache[get_called_class()];
    }

    public static function _init($directory) {

        if(count(self::$_interfaces[get_called_class()]) === 0) {
            $alle = glob($directory.'/*.inc.php');
            foreach($alle as $datei) { include_once(realpath($datei)); }
        }

    }

    abstract public static function init();
}

?>