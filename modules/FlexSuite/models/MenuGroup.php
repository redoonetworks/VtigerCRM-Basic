<?php


class FlexSuite_MenuGroup_Model
{
    /**
     * ID of Group
     * @var int|null
     */
    private $GroupId = null;

    public function __construct($groupId) {
        $this->GroupId = intval($groupId);
    }

    /**
     * @todo
     *
     * @return FlexSuite_MenuItem_Model[]
     */
    public function getItems() {

    }

    /**
     * Function add a item to Group
     * @param FlexSuite_MenuItem_Model $item Item to add
     */
    public function addItem(FlexSuite_MenuItem_Model $item) {
        $adb = \PearDatabase::getInstance();

        $result = $adb->pquery('SELECT MAX(sequence) as sequence FROM flexsuite_menu_item WHERE groupid = ?', array($this->GroupId));
        if($adb->num_rows($result) == 0) {
            $maxSequence = 0;
        } else {
            $maxSequence = intval($adb->query_result($result, 0, 'sequence'));
        }

        \FlexSuite\Database::table('flexsuite_menu_item')->insert(array(
            'groupid' => $this->GroupId,
            'type' => $item->getType(),
            'title' => $item->getTitle(),
            'configuration' => \FlexSuite\VtUtils::json_encode($item->getConfiguration()),
            'sequence' => ++$maxSequence,
        ));
    }
}