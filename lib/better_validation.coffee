#############
# Constants #
#############

HIDDEN_CLASS = 'hide'

#############
# Utilities #
#############

toggle_hidden = ($elm, show) -> $elm.toggleClass HIDDEN_CLASS, ! show

find_form = (target) ->
  while target
    return target if target.tagName is 'FORM'
    target = target.parentNode

################################
# Function Wrappers/Generators #
################################

find = ($context) -> -> $context.find.apply $context, arguments

##########################
# BetterValidation Class #
##########################

class BetterValidation

  #################################
  # BetterValidation::constructor #
  # Sets up some shit.            #
  #################################

  constructor: (target, overrides) ->

    _.extend @, overrides

    @$target = $ target

    @$form = if target.tagName isnt 'form' then $(find_form(target)) else @$target

    @is_valid = true
    @is_valid_async = false
    @is_ajax_form = @get_attribute('async')

    @find = find @$target

    @$error_box = @find @error_box_selector
    @$errors = @find @error_selector

    @$form.find(':submit').on 'click', (e) => @validate(e)

  #####################################
  # BetterValidation::validate()      #
  # Run when the form is submitted,   #
  # Executes the action of validation #
  #####################################

  validate: (e) ->
    return false unless @$target.has(e.target).length

    #########
    # Setup #
    #########

    @reset_all_errors()
    errors = {}

    ################
    # Parse Fields #
    ################

    $fields = @find @field_selector
    $fields.each (i, field) =>
      field_errors = @validate_field field
      errors[@field_name.apply field] = field_errors if field_errors.length

    #######################
    # Process Errors Hook #
    #######################

    errors = @process_errors errors

    @trigger 'validate'

    ###################################
    # Apply the errors to the display #
    ###################################

    if _(errors).keys().length

      @apply_errors errors
      false

    ###################################
    # If the form is valid so far,    #
    # send it off to the server       #
    ###################################

    else if @is_ajax_form && ! @is_valid_async

      $.ajax
        url: @ajax_url()
        type: @method()
        data: $fields.serialize()
        success: =>
          @reset_all_errors()
          @is_valid_async = true
          @after_ajax_validation.apply @, arguments
          @is_valid_async = false
        error: (xhr) =>
          errors = @process_ajax_errors(xhr)
          @apply_errors(errors)
      @trigger 'validate_async'
      false

    ###################################
    # If it's not an ajax form,       #
    # use native form submit          #
    ###################################

    else

      @reset_all_errors()
      @trigger 'valid'
      true

  ####################################
  # Get a data attribute either from #
  # the target, the form, or the     #
  # form's html attributes.          #
  ####################################

  get_attribute: (attribute, html_attribute) -> @$target.data("validate-#{attribute}") || @$form.data("validate-#{attribute}") || (@$form.attr(attribute) if html_attribute)

  ###########
  # Helpers #
  ###########

  validate_field: (field) =>
    errors = []
    _(BetterValidation.VALIDATORS).each (validator) =>
      [message_function, validate_function] = validator
      errors.push message_function.apply(field) unless validate_function.apply(field)
    errors

  apply_errors: (errors) ->
    console.log errors
    _(errors).each (field_errors, field) =>
      _(field_errors).each (error) =>
        @toggle_error(field, error, true)
    @trigger('error', errors)

  toggle_error: (field, error, show) ->
    $error = @$errors.filter ".#{@translate_error(error, field)}"
    toggle_hidden $error, show
    @toggle_errors true if show
    @is_valid = false if show

  reset_all_errors: ->
    @is_valid = true
    @toggle_errors false
    @$errors.each -> toggle_hidden $(this), false
    @trigger('reset')

  toggle_errors: (show) -> toggle_hidden @$error_box, show

  trigger: ->
    arguments[0] = "better_validation:#{arguments[0]}"
    @$target.trigger.apply @$target, arguments

  #########
  # Hooks #
  #########

  process_errors: (errors) -> errors

  translate_error: (error, field) -> "#{field}_#{error.replace(/\ /g, '_').replace(/\'/g, '').replace(/[\(||\)]/g, '')}"

  process_ajax_errors: (xhr) -> $.parseJSON(xhr.getResponseHeader 'x-error-messages')

  after_ajax_validation: ->
    if callback = @async_callback || @get_attribute('async-callback')
      (if typeof callback is 'function' then callback else if typeof (callback = window[callback]) is 'function' then callback.apply(@$target, arguments))
    else if redirect = @get_attribute('async-redirect')
      window.top.location = redirect
    else
      @$target.trigger('submit')

  ##############################
  # Configurable variables and #
  # variable generators        #
  ##############################

  ajax_url: -> "#{@get_attribute('async-url') || @$form.attr('action').replace(/\/$/, '')}.json"
  method: -> @get_attribute('method') || @$form.attr('method')
  inline: false
  error_box_selector: '.error-box'
  error_selector: '.error'
  scope_selector: 'form'
  field_selector: 'input, select, textarea'
  field_name: -> $(this).data('validate-field-name') || this.name

#######################
# Built in validators #
#######################

########################################################################################
#                                                                                      #
# BetterValidation.VALIDATORS                                                          #
#                                                                                      #
# Validators can be added by adding a keyed array to this hash.                        #
#                                                                                      #
# The pattern is:                                                                      #
#                                                                                      #
# BetterValidation.VALIDATORS.your_validator = [ label_function, validation_function ] #
#                                                                                      #
# @param label_function: function returning a label used                               #
#   for selecting error message element.                                               #
#                                                                                      #
# @param validation_function: funciton returning true if valid and false if not.       #
#                                                                                      #
# @TODO: Replace with BetterValidation.Validator sub class.                            #
#                                                                                      #
########################################################################################

BetterValidation.VALIDATORS =

  blank: [
    -> 'is blank',
    -> if ($field = $ this).data('validate-blank') then $field.val() else true
  ]

  regex: [
    -> $(this).data('validate-regex-message') || 'regex mismatch',
    -> if regex = ($field = $ this).data('validate-regex') then new RegExp(regex).test($field.val()) else true
  ]

  'min-length': [
    -> $(this).data('validate-min-length-message') || 'is too short',
    -> if ($field = $(this)).data('validate-min-length') then ! ($field = $(this)).val().length >= parseInt($field.data('validate-min-length'), 10) else true
  ]

  'max-length': [
    -> $(this).data('validate-max-length-message') || 'is too short',
    -> if ($field = $(this)).data('validate-max-length') then ! $field.val().length <= parseInt($field.data('validate-max-length'), 10) else true
  ]

###############
# Configuring #
###############

CONFIGURABLES = _('ajax_url error_box_selector error_selector field_name field_selector'.split ' ')

class BetterValidation.Configuration
  hidden_class: HIDDEN_CLASS
  error_selector: BetterValidation::error_selector
  error_box_selector: BetterValidation::error_box_selector
  ajax_url: BetterValidation::ajax_url

BetterValidation.Configure = (configuration) ->
  config = new BetterValidation.Configuration
  configuration.call(config)
  HIDDEN_CLASS = config.hidden_class
  CONFIGURABLES.each (config_key) -> BetterValidation.prototype[config_key] = config[config_key] if config[config_key]

@BetterValidation = BetterValidation

$.fn.validateBetter = (options) -> this.each -> new BetterValidation this, options

$('[data-validate-with="better_validation"]').validateBetter()

