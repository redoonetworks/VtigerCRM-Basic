<?php
/**
 * @copyright 2016-2017 Redoo Networks GmbH
 * @link https://redoo-networks.com/
 * This file is part of a vTigerCRM module, implemented by Redoo Networks GmbH and must not used without permission.
 */
namespace FlexSuite;

class Formatter
{

    private static $Config = array(
        'dateformat' => false,
        'decimal_separator' => false,
        'thousands_separator' => false,
        'decimals' => false,
    );

    public static function setDateformat($dateformat)
    {
        self::$Config['dateformat'] = $dateformat;
    }

    public static function setNumberconfig($decimals, $decimal_separator, $thousends_separator)
    {
        self::$Config['decimal_separator'] = $decimal_separator;
        self::$Config['thousends_separator'] = $thousends_separator;
        self::$Config['decimals'] = $decimals;
    }

    /**
     * @param $value
     */
    public static function convertDateToDBFormat($value)
    {
        if (self::$Config['dateformat'] === false) {
            $currentUser = \Users_Record_Model::getCurrentUserModel();
            self::$Config['dateformat'] = $currentUser->get('date_format');
        }

        $date_format = str_replace(array('yyyy', 'mm', 'dd'), array('Y', 'm', 'd'), self::$Config['dateformat']);

        if (is_string($value)) {
            $value = \DateTime::createFromFormat($date_format, $value);
        }

        return $value->format('Y-m-d');
    }

    /**
     * @param \stdClass $field
     * @param $value
     * @param VTEntity $context
     * @return mixed|null|string
     */
    public static function formatField(\stdClass $field, $value, $context)
    {
        if($field->uitype == '69' ) {
            $record = \Vtiger_Record_Model::getInstanceById($context->getId(), $context->getModuleName());
            $image = $record->getImageDetails();
        }

        $value = self::format($value, $field->type->name);

        return $value;
    }

    public static function format($value, $type) {
        switch ($type) {
            case 'double':
            case 'decimal':
            case 'currency':
                $value = Formatter::convertDecimalToUserFormat($value);
                break;
            case 'date':
                $parts = explode(' ', $value);
                if(count($parts) > 0) $value = $parts[0];

                $value = Formatter::convertDateToUserFormat($value);
                break;
            case 'datetime':
                $value = Formatter::convertDateToUserFormat($value);
                break;
            case 'url':

                if (!empty($value)) {
                    $href = $value;
                    if (strpos($href, '://') === false) {
                        $href = 'http://' . $value;
                    }
                    $value = '<a href="' . $href . '">' . $value . '</a>';
                }

                break;
            case 'reference':
                $value = \Vtiger_Functions::getCRMRecordLabel($value);
                break;
            case 'user_reference':
                $value = \Vtiger_Functions::getOwnerRecordLabel($value);
                break;
        }

        return $value;
    }

    public static function convertDecimalToUserFormat($value)
    {
        global $default_charset;

        if (self::$Config['decimal_separator'] === false) {
            $currentUser = \Users_Record_Model::getCurrentUserModel();
            self::$Config['decimal_separator'] = str_replace("\xC2\xA0", ' ', html_entity_decode($currentUser->get('currency_decimal_separator'), ENT_QUOTES, $default_charset));
        }
        if (self::$Config['thousands_separator'] === false) {
            $currentUser = \Users_Record_Model::getCurrentUserModel();
            self::$Config['thousands_separator'] = str_replace("\xC2\xA0", ' ', html_entity_decode($currentUser->get('currency_grouping_separator'), ENT_QUOTES, $default_charset));
        }
        if (self::$Config['decimals'] === false) {
            $currentUser = \Users_Record_Model::getCurrentUserModel();
            self::$Config['decimals'] = intval($currentUser->get('no_of_currency_decimals'));
        }

        return number_format(
            $value, intval(self::$Config['decimals']), self::$Config['decimal_separator'], self::$Config['thousands_separator']
        );
    }

    /**
     * @param $value
     */
    public static function convertDateToUserFormat($value)
    {
        if (empty($value)) {
            return '';
        }
        $currentUser = \Users_Record_Model::getCurrentUserModel();
        if (self::$Config['dateformat'] === false) {
//            $currentUser = \Users_Record_Model::getCurrentUserModel();
            self::$Config['dateformat'] = $currentUser->get('date_format');
        }
//        if (self::$Config['timezone'] === false) {

        self::$Config['timezone'] = $currentUser->get('time_zone');
//        }
        $date_format = str_replace(array('yyyy', 'mm', 'dd'), array('Y', 'm', 'd'), self::$Config['dateformat']);
        $valueParts = explode(' ', $value);
        if (count($valueParts) > 1) {
            if ($currentUser->get('hour_format') == '12') {
                $date_format .= ' h:i A';
            } else {
                $date_format .= ' H:i:s';
            }
        }
        if (is_string($value)) {
            $value = new \DateTime($value, new \DateTimeZone('UTC'));
        }
        if ($value instanceof \DateTime) {
            $value->setTimezone(new \DateTimeZone(self::$Config['timezone']));
            return $value->format($date_format);
        } else {
            return '';
        }
    }
}
