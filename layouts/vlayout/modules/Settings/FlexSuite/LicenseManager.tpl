<div class="container-fluid" id="moduleManagerContents">
    <form method="POST" action='#' onsubmit="storeLicense();return false;">
        <div class="widget_header row-fluid">
            <div class="span12">
                <h3>
                    <b>
                        {vtranslate('FlexSuite', 'FlexSuite')} {vtranslate('License Configuration', 'FlexSuite')}
                    </b>
                </h3>
            </div>
        </div>
        <hr>

        <script type="text/javascript" src="modules/FulltextSearch/resources/SetLicense.js?v=1.0"></script>
        {if $ACTIVE_LICENSE neq true}
        <div style="margin:20px auto;width:400px;">
            <h4>{vtranslate('Enter your license code', 'FlexSuite')}</h4>
            <hr/>
            <div id="licenseError" style="margin-bottom:5px;display:none;background-color: #a12d22;padding:5px; width:100%;color:#ffffff;font-weight:bold;"></div>
            <input type="text" name="licensecode" id="licensecode" style="width:100%; "/>
            <input type="button" class="btn btn-primary" id="setlicenseBtn" onclick="storeLicense();" value="{vtranslate('store license', 'FlexSuite')}" />
        </div>
        {else}
            <table class="table table-bordered  table-condensed" style="width:500px;">
                <tr class="{if $ACTIVE_LICENSE eq true}success{else}error{/if}">
                    <td width="200">
                        {vtranslate('LBL_LICENSE_IS', 'FlexSuite')}
                    </td>
                    <td>
                        <strong>
                            {if $ACTIVE_LICENSE eq true}
                                {vtranslate('LBL_ACTIVE','FlexSuite')}
                                {else}
                                {vtranslate('LBL_INACTIVE','FlexSuite')}
                            {/if}
                        </strong>
                    </td>
                </tr>
                {*<tr>
                    <td>{vtranslate('LBL_LICENSE_FOR', 'Settings:Workflow2')}</td>
                    <td>{$LICENSE_FOR}</td>
                </tr>*}

            </table>
            <br>
            {*<button class="btn btn-primary" onclick="refreshLicense();">{vtranslate('LBL_REVALIDATE_LICENSE', 'Settings:Workflow2')}</button>*}
            <button class="btn btn-danger" onclick="removeLicense();">{vtranslate('remove License', 'FlexSuite')}</button>
        {/if}
    </form>
</div>
