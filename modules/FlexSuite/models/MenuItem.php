<?php


class FlexSuite_MenuItem_Model {

    /**
     * Id of MenuItem
     * @var int|null
     */
    private $ItemId = null;

    const TYPE_MODULE = 'module';
    const TYPE_CUSTOMVIEW = 'customview';
    const TYPE_URL = 'url';
    const TYPE_SEPARATOR = 'separator';

    /**
     * Contain Item Data
     * @var null
     */
    private $Data = null;

    public function __construct($itemId, $data = null) {
        $this->ItemId = intval($itemId);
    }

    public function setSequence($sequence) {
        $this->getData();

        $this->Data['sequence'] = $sequence;
    }
    public function setTitle($title) {
        $this->getData();

        $this->Data['title'] = $title;
    }
    public function setType($type) {
        $this->getData();

        $this->Data['type'] = $type;
    }
    public function setConfiguration($configuration) {
        $this->getData();

        $this->Data['configuration'] = $configuration;
    }
    /**
     * Function allows to set data, without a db query
     * @param array $data
     */
    public function initData($data) {
        $this->Data = $data;
    }

    public function getTitle() {
        $this->getData();

        return $this->Data['title'];
    }
    /**
     * @return string
     */
    public function getType() {
        $this->getData();

        return $this->Data['type'];
    }

    /**
     * @return array
     */
    public function getConfiguration() {
        $this->getData();

        return $this->Data['configuration'];
    }

    private function getData() {
        if($this->Data !== null) return;

        $adb = \PearDatabase::getInstance();

        $sql = 'SELECT * FROM flexsuite_menu_item WHERE id = ?';
        $result = $adb->pquery($sql, array($this->ItemId));

        $this->Data = $adb->fetchByAssoc($result);
        $this->Data['configuration'] = \FlexSuite\VtUtils::json_decode(html_entity_decode($this->Data['configuration']));

        if(empty($this->Data['configuration'])) {
            $this->Data['configuration'] = array();
        }
    }

    /**
     * @todo
     */
    public function save() {

    }
}