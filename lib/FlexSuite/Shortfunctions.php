<?php
/**
 * Created by PhpStorm.
 * User: Stefan
 * Date: 22.07.2016
 * Time: 11:36
 */

namespace FlexSuite;


class Shortfunctions
{
    private static $register = null;

    /**
     * @param String $functionName
     * @param Callable $callable
     * @param bool $parseParameters Should the Parameter automatically parsed with VTTemplate
     */
    public static function register($functionName, $callable, $parseParameters = true) {
        if(!is_callable($callable)) {
            return;
        }

        self::$register[$functionName] = array(
            'call' => $callable,
            'parseParameters' => $parseParameters == true
        );
    }

    private function init() {
        self::$register = array();

        $alle = glob(dirname(__FILE__).'/../../extends/shortfunctions/*.inc.php');
        foreach($alle as $datei) { include_once(realpath($datei)); }
    }

    public static function call($function, $parameter = array(), $context = null) {
        if(self::$register === null) {
            self::init();
        }

        if(!is_array($parameter)) {
            $parameter = array();
        }

        if(!isset(self::$register[$function])) {
            throw new \Exception('Not found');
        }

        if($context === null) {
            $context = VTEntity::getDummy();
        }

        if(self::$register[$function]['parseParameters'] == true) {
            foreach($parameter as $key => $value) {
                $parameter[$key] = VTTemplate::parse($value, $context);
            }
        }

        array_unshift($parameter, $context);

        return call_user_func_array(self::$register[$function]['call'], $parameter);
    }
}