<?php
/**
 * Created by Stefan Warnat
 * User: Stefan
 * Date: 25.08.2017
 * Time: 18:18
 */

namespace FlexSuite;


class Database
{
    private $_Table = null;

    /**
     * @param $table string
     * @return Database
     */
    public static function table($table) {
        $obj = new Database($table);
        return $obj;
    }

    public function __construct($table) {
        $this->_Table = $table;
    }

    public static function direct($value) {
        return array('direct' => true, 'value' => $value);
    }

    /**
     * @param $set
     * @return $this
     */
    public function insert($set) {
        $sql = $params = array();

        foreach($set as $key => $value) {
            if(is_array($value) && $value['direct'] === true) {
                $sql[] = '`'.$key.'` = '.$value['value'];
            } else {
                $sql[] = '`'.$key.'` = ?';
                $params[] = $value;
            }
        }

        VtUtils::pquery('INSERT INTO `'.$this->_Table.'` SET '.implode(',',$sql), $params);

        return $this;
    }

    public function lastInsertId() {
        $sql = 'SELECT LAST_INSERT_ID() as id';
        $result = VtUtils::fetchByAssoc($sql);

        return $result['id'];
    }

    /**
     * @param $set
     * @param $where
     * @return $this
     */
    public function update($set, $where) {
        if(!is_array($where) && is_numeric($where)) {
            $where = array('id = '.$where);
        }

        $sql = $params = array();

        foreach($set as $key => $value) {
            $sql[] = '`'.$key.'` = ?';
            $params[] = $value;
        }

        VtUtils::pquery('UPDATE `'.$this->_Table.'` SET '.implode(',', $sql).' WHERE '.implode(' AND ', $where), $params);

        return $this;
    }
}