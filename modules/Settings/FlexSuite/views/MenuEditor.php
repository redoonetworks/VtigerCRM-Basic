<?php


class Settings_FlexSuite_MenuEditor_View extends Settings_Vtiger_Index_View {

    public function process(Vtiger_Request $request) {
		$groupId = 14;
		
        $adb = \PearDatabase::getInstance();
        $sql = 'SELECT * FROM flexsuite_menu_item WHERE groupid = ? ORDER BY sequence';
        $rows = \FlexSuite\VtUtils::fetchRows($sql, array($groupId));

        $viewer = $this->getViewer($request);

        $viewer->assign('ITEMS', $rows);
        $viewer->assign('GROUPID', $groupId);

        $viewer->view('MenuEditor.tpl', 'Settings:FlexSuite');
    }

}