(function($){

    var hideableFields =
    {
        '#isTag-': 'hide-regular-job-settings',
        '#trigger-buttons-': 'hide-regular-job-settings',
        '#branchRegex-': 'hide-regular-job-settings',
        '#pathRegex-': 'hide-regular-job-settings',
        '#prDestinationRegex-': 'hide-regular-job-settings',
        '#pipeline-buttons-': 'hide-pipeline-job-settings'
    }

    // create button definitions here
    // button logic is automatically created for all values in triggers
    var triggers =
        {
            '.branch-created':
                {
                    'trigger': 'add;',
                    'extraFields': ['#branchRegex-']
                },
            '.push-event':
                {
                    'trigger': 'push;',
                    'extraFields': ['#pathRegex-', '#branchRegex-']
                },
            '.manual':
                {
                    'trigger': 'manual;',
                    'extraFields': ['#requirePermission-']
                },
            '.branch-deleted':
                {
                    'trigger': 'delete;',
                    'extraFields': ['#branchRegex-']
                },
            '.pr-opened':
                {
                    'trigger': 'pullrequest;',
                    'extraFields': ['#pathRegex-', '#prDestinationRegex-']
                },
            '.pr-merged':
                {
                    'trigger': 'prmerged;',
                    'extraFields': ['#pathRegex-', '#prDestinationRegex-']
                },
            '.pr-auto-merged':
                {
                    'trigger': 'prautomerged;',
                    'extraFields': []
                },
            '.pr-declined':
                {
                    'trigger': 'prdeclined;',
                    'extraFields': ['#pathRegex-', '#prDestinationRegex-']
                },
            '.pr-deleted':
                {
                    'trigger': 'prdeleted;',
                    'extraFields': ['#pathRegex-', '#prDestinationRegex-']
                },
            '.pr-approved':
                {
                    'trigger': 'prapproved;',
                    'extraFields': ['#pathRegex-', '#prDestinationRegex-']
                }
        };

    // used by showField to determine if the field should be hidden or not
    // triggers is automatically populated by populateFields, class is the only needed value
    var extraFields =
        {
            '#branchRegex-': {
                'class' : 'hide-branches',
                'triggers' : []
            },
            '#pathRegex-': {
                'class' : 'hide-paths',
                'triggers' : []
            },
            '#requirePermission-': {
                'class' : 'hide-permissions',
                'triggers' : []
            },
            '#prDestinationRegex-': {
                'class' : 'hide-pr-dest',
                'triggers' : []
            }
        };

    var pipelineFields =
    {
        '.branch-none': 'branch-none;',
        '.branch-all': 'branch-all;',
        '.branch-pr': 'branch-pr;',
        '.branch-nonpr': 'branch-nonpr;',
        '.pr-none': 'pr-none;',
        '.pr-as-is': 'pr-asis;',
        '.pr-as-merge': 'pr-asmerge;',
        '.pr-both': 'pr-both;',
    }

    //
    // functions
    //
    function populateFields () {
        var trigKeys = Object.keys(triggers);
        for (var j = 0; j < trigKeys.length; j++) {
            var trigger = trigKeys[j];
            var fields = triggers[trigger]['extraFields'];
            for (var k = 0; k < fields.length; k++) {
                var field = fields[k];
                extraFields[field]['triggers'].push(triggers[trigger]['trigger'])
            }
        }
    }
    populateFields();

    function updateTrigger (element, value, enable) {
        var id = element.get(0).id.replace("job-", "");
        var trigger = element.find('#triggers-' + id);
        var existing = trigger.val();
        if (enable) {
            if (existing.indexOf("value") == -1) {
                existing += value
            }
        } else {
            existing = existing.replace(value, "");
        }
        trigger.val(existing);
    }

    function updatePipelineSettings (element, value) {
        var id = element.get(0).id.replace("job-", "");
        var pipelineSettings = element.find('#pipelineSettings-' + id);
        var existing = pipelineSettings.val();
        var prefix = value.split("-")[0];
        var settingRegex = new RegExp(prefix + '.+?;');

        if (existing.search(settingRegex) == -1) {
            existing += value;
        } else {
            existing = existing.replace(settingRegex, value);
        }

        pipelineSettings.val(existing);
    }

    function showField (existing, trigger, field) {
        var relevantTriggers = extraFields[field]['triggers'];
        var shouldDisplay = false;
        for (var i = 0; i < relevantTriggers.length; i++) {
            if (existing.indexOf(relevantTriggers[i]) != -1 && relevantTriggers[i] != trigger){
                shouldDisplay = true
            }
        }
        return shouldDisplay
    }

    function setButton (buttonName) {
        var triggerName = triggers[buttonName]['trigger'];
        var fields = triggers[buttonName]['extraFields'];
        $(document).on('click', buttonName, function(e) {
            e.preventDefault();
            var classes = $(this).find('span').attr('class');
            var id = $(this).parent().parent().get(0).id.replace("job-", "");
            if (classes.indexOf("aui-lozenge-success") > -1) {
                updateTrigger($(this).parent().parent(), triggerName, false);
                var trigger = $(this).parent().parent().find('#triggers-' + id);
                var existing = trigger.val();
                for (var i = 0; i < fields.length; i++){
                    var field = fields[i];
                    if (!showField(existing, triggerName, field)){
                        $(this).parent().parent().find(field + id).parent().addClass(extraFields[field]['class']);
                    }
                }
            } else {
                updateTrigger($(this).parent().parent(), triggerName, true);
                for (var j = 0; j < fields.length; j++){
                    var fieldID = fields[j];
                    $(this).parent().parent().find(fieldID + id).parent().removeClass(extraFields[fieldID]['class']);
                }
            }
            $(this).find('span').toggleClass("aui-lozenge-success");
        });
    }

    function setPipelineButton (buttonName) {
        $(document).on('click', buttonName, function(e) {
            e.preventDefault();
            var classes = $(this).find('span').attr('class');
            var id = $(this).parent().parent().get(0).id.replace("job-", "");
            if (!classes.indexOf("aui-lozenge-success") > -1) {
                updatePipelineSettings($(this).parent().parent(), pipelineFields[buttonName])
                var prefix = buttonName.split("-")[0].substring(1);
                $(this).parent().find("a[class^='" + prefix + "']").find('span').removeClass("aui-lozenge-success");
                $(this).find('span').toggleClass("aui-lozenge-success");
            }
        });
    }

    function setIsPipelineButton () {
        $(document).on('click', '[id^=isPipeline]', function(e) {
            var id = $(this).parent().parent().parent().get(0).id.replace("job-", "");
            Object.keys(hideableFields).forEach(function(fieldName) {
                var target = $(fieldName + id)
                if (target.is("div")){
                    $(fieldName + id).toggleClass(hideableFields[fieldName])
                } else {
                    $(fieldName + id).parent().toggleClass(hideableFields[fieldName])
                }
            });
            if (this.checked) {

            }
        });
    }
    setIsPipelineButton()

    //
    // event bindings
    //
    $(document).on('click', '#add-job', function(e) {
        e.preventDefault();
        var existingJobs = $('.parameterized-builds').children('.job').length;
        var html = com.kylenicholls.stash.parameterizedbuilds.hook.addJob({
            'count' : existingJobs,
            'jobName' : '',
            'isTag' : false,
            'isPipeline': false,
            'trigger' : '',
            'pipelineSettings': 'branch-none;pr-none;',
            'token' : '',
            'branch' : '',
            'path' : '',
            'param' : '',
            'permissions' : '',
            'prDestinationRegex': '',
            'collapsed' : false
        });
        $(html).insertBefore($(this));
        $('.parameterized-builds').find('.delete-job').removeClass('hidden').addClass('inline-button');
    });

    $(document).on('click', '.toggle-job', function(e) {
        e.preventDefault();
        $currentJob = $(this).parent().find('.field-group');
        var classes = $(this).find('span').attr('class');
        if (classes.indexOf("aui-iconfont-expanded") > -1) {
            var title = $currentJob.first().find('input').val();
            $(this).find('a').append(title);
        } else {
            $(this).find('a').contents().filter(function(){ return this.nodeType == 3; }).remove();
        }
        $(this).find('span').toggleClass('aui-iconfont-expanded');
        $(this).find('span').toggleClass('aui-iconfont-collapsed');
        $currentJob.each(function(index, field) {
            $(field).toggleClass('hidden');
        });
    });

    $(document).on('click', '.delete-job', function (e) {
        e.preventDefault();
        $(this).parent().remove();
        var $container = $('.parameterized-builds');
        var $jobs = $container.find('.job');
        if ($jobs.length == 1) {
            $jobs.children(".delete-job").removeClass('inline-button').addClass('hidden');
        }

        // re-number inputs
        $jobs.each(function(index, currentJob) {
            $(currentJob).attr('id', 'job-' + index);
            var $jobFields = $(currentJob).find('.field-group');
            $jobFields.each(function(index2, currentField) {
                var i = 0; //avoid manual renumbering when a field is added
                if (index2 === i++) {
                    $(currentField).find('label').attr('for', 'jobName-' + index);
                    $(currentField).find('input').attr('id', 'jobName-' + index).attr('name', 'jobName-' + index);
                }
                if (index2 === i++) {
                    $(currentField).find('label').attr('for', 'isTag-' + index);
                    $(currentField).find('select').attr('id', 'isTag-' + index).attr('name', 'isTag-' + index);
                }
                if (index2 === i++) {
                    $(currentField).find('label').attr('for', 'isPipeline-' + index);
                    $(currentField).find('select').attr('id', 'isPipeline-' + index).attr('name', 'isPipeline-' + index);
                }
                if (index2 === i++) {
                    $(currentField).find('label').attr('for', 'trigger-buttons-' + index);
                }
                if (index2 === i++) {
                    $(currentField).find('label').attr('for', 'triggers-' + index);
                    $(currentField).find('input').attr('id', 'triggers-' + index).attr('name', 'triggers-' + index);
                }
                if (index2 === i++) {
                    $(currentField).find('label').attr('for', 'token-' + index);
                    $(currentField).find('input').attr('id', 'token-' + index).attr('name', 'token-' + index);
                }
                if (index2 === i++) {
                    $(currentField).find('label').attr('for', 'buildParameters-' + index);
                    $(currentField).find('textarea').attr('id', 'buildParameters-' + index).attr('name', 'buildParameters-' + index);
                }
                if (index2 === i++) {
                    $(currentField).find('label').attr('for', 'branchRegex-' + index);
                    $(currentField).find('input').attr('id', 'branchRegex-' + index).attr('name', 'branchRegex-' + index);
                }
                if (index2 === i++) {
                    $(currentField).find('label').attr('for', 'pathRegex-' + index);
                    $(currentField).find('input').attr('id', 'pathRegex-' + index).attr('name', 'pathRegex-' + index);
                }
                if (index2 === i++) {
                    $(currentField).find('label').attr('for', 'requirePermission-' + index);
                    $(currentField).find('select').attr('id', 'requirePermission-' + index).attr('name', 'requirePermission-' + index);
                }
                if (index2 === i++) {
                    $(currentField).find('label').attr('for', 'prDestinationRegex-' + index);
                    $(currentField).find('select').attr('id', 'prDestinationRegex-' + index).attr('name', 'prDestinationRegex-' + index);
                }
            });
        });
    });

    // create event bindings for each trigger
    Object.keys(triggers).forEach(setButton);
    Object.keys(pipelineFields).forEach(setPipelineButton);
}(AJS.$));