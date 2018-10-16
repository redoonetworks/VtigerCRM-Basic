var gulp = require('gulp');
var concat = require('gulp-concat-util');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

gulp.task('flexsuite_main', function() {
    return gulp.src(
        [
            'layouts/v7/lib/jquery/purl.js',
            'layouts/v7/lib/jquery/select2/select2.min.js',
            'layouts/v7/lib/jquery/jquery.class.min.js',
            'layouts/v7/lib/jquery/jquery-ui-1.11.3.custom/jquery-ui.js',
            'layouts/v7/lib/todc/js/bootstrap.min.js',
            'libraries/jquery/jstorage.min.js',
            'layouts/v7/lib/jquery/jquery-validation/jquery.validate.min.js',
            'layouts/v7/lib/jquery/jquery.slimscroll.min.js',
            'assets/libraries/FlexUtils/FlexUtils.js',
            'libraries/jquery/jquery.ba-outside-events.min.js',
            'libraries/jquery/defunkt-jquery-pjax/jquery.pjax.js',
            'libraries/jquery/multiplefileupload/jquery_MultiFile.js',
            'resources/jquery.additions.js',
            'layouts/v7/lib/bootstrap-notify/bootstrap-notify.min.js',
            'layouts/v7/lib/jquery/websockets/reconnecting-websocket.js',
            'layouts/v7/lib/jquery/jquery-play-sound/jquery.playSound.js',
            'layouts/v7/lib/jquery/malihu-custom-scrollbar/jquery.mousewheel.min.js',
            'layouts/v7/lib/jquery/malihu-custom-scrollbar/jquery.mCustomScrollbar.js',
            'layouts/v7/lib/jquery/autoComplete/jquery.textcomplete.js',
            'layouts/v7/lib/jquery/jquery.qtip.custom/jquery.qtip.js',
            'libraries/jquery/jquery-visibility.min.js',
            'layouts/v7/lib/momentjs/moment.js',
            'layouts/v7/lib/jquery/daterangepicker/moment.min.js',
            'layouts/v7/lib/jquery/daterangepicker/jquery.daterangepicker.js',
            'layouts/v7/lib/jquery/jquery.timeago.js',
            'libraries/jquery/ckeditor/ckeditor.js',
            'libraries/jquery/ckeditor/adapters/jquery.js',
            'layouts/v7/lib/anchorme_js/anchorme.min.js',
            'layouts/v7/modules/Vtiger/resources/Class.js',
            'layouts/v7/resources/helper.js',
            'layouts/v7/resources/application.js',
            'layouts/v7/modules/Vtiger/resources/Utils.js',
            'layouts/v7/modules/Vtiger/resources/validation.js',
            'layouts/v7/lib/bootbox/bootbox.js',
            'layouts/v7/modules/Vtiger/resources/Base.js',
            'layouts/v7/modules/Vtiger/resources/Vtiger.js',
            'layouts/v7/modules/Calendar/resources/TaskManagement.js',
            'layouts/v7/modules/Import/resources/Import.js',
            'layouts/v7/modules/Emails/resources/EmailPreview.js',
            'layouts/v7/modules/Vtiger/resources/Base.js',
            'layouts/v7/modules/Google/resources/Settings.js',
            'layouts/v7/modules/Vtiger/resources/CkEditor.js',
            'layouts/v7/modules/Documents/resources/Documents.js',
        ]
    )
        .pipe(sourcemaps.init())
        .pipe(concat('./flexsuite.js'))
        // .pipe(concat.header('(function() { \n'))
        // .pipe(concat.footer('\n})();\n'))
        .pipe(sourcemaps.write())
        .pipe(uglify())
        .pipe(gulp.dest('./assets/dist/'));
});