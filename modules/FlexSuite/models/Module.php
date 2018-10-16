<?php
/*+***********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
 *************************************************************************************/

class FlexSuite_Module_Model extends Vtiger_Module_Model {
    /**
   	 * Function to get Settings links
   	 * @return <Array>
   	 */
   	public function getSettingLinks(){
           $settingsLinks = parent::getSettingLinks();
/*
           $settingsLinks[] = array(
                'linktype' => 'LISTVIEWSETTING',
                'linklabel' => 'check DB',
                 'linkurl' => 'index.php?parent=Settings&module=FlexSuite&view=CheckDB&filename=vtiger',
            );

           $settingsLinks[] = array(
                'linktype' => 'LISTVIEWSETTING',
                'linklabel' => 'set License',
                 'linkurl' => 'index.php?parent=Settings&module=FlexSuite&view=LicenseManager&filename=vtiger',
            );
           $settingsLinks[] = array(
                'linktype' => 'LISTVIEWSETTING',
                'linklabel' => 'check for Update',
                 'linkurl' => 'index.php?parent=Settings&module=FlexSuite&view=Upgrade&filename=vtiger',
            );
*/

           return $settingsLinks;
    }

}