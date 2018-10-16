<?php
/**
 * @copyright 2016-2017 Redoo Networks GmbH
 * @link https://redoo-networks.com/
 * This file is part of a vTigerCRM module, implemented by Redoo Networks GmbH and must not used without permission.
 */

namespace FlexSuite;


class Profiler
{
    private static $_Profiler = array();
    private static $_LastProfilerTime = null;

    public static function profile($label) {
        if(empty(self::$_LastProfilerTime)) {
            self::$_Profiler[] = array('Label', 'Time (ms)');
            self::$_Profiler[] = array($label, '');
        } else {
            self::$_Profiler[] = array($label, (microtime(true) - self::$_LastProfilerTime) * 1000);
        }

        self::$_LastProfilerTime = microtime(true);
    }

    public static function finish() {
//        \RedooReports\ChromePHP::table(self::$_Profiler);
    }
}