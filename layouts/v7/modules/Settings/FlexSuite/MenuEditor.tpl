<ul data-groupid="{$GROUPID}" class="menugroup" style="list-style-type: none;">
    {foreach from=$ITEMS item=ITEM}

        <li id="item_{$ITEM.id}" style="line-height:25px;font-weight:bold;background-color:#ffffff;border:1px solid #cccccc;margin:2px;">{$ITEM.type} - {$ITEM.title}</li>
    {/foreach}
</ul>

<script type="text/javascript">
    jQuery( function() {
        jQuery( ".menugroup" ).each(function(index, ele) {
            var groupId = jQuery(ele).data('groupid');

            $(ele).sortable({
                update: function( event, ui ) {
                    FlexAjax('FlexSuite').postSettingsAction('MenuReorder', { groupId: groupId, itemsequence:jQuery(this).sortable( "toArray" )});
                }
            });

            jQuery( ele ).disableSelection();
        });


    } );
</script>