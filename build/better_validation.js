// Generated by CoffeeScript 1.3.3
(function() {
  var BetterValidation, CONFIGURABLES, HIDDEN_CLASS, find, find_form, toggle_hidden,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  HIDDEN_CLASS = 'hide';

  toggle_hidden = function($elm, show) {
    return $elm.toggleClass(HIDDEN_CLASS, !show);
  };

  find_form = function(target) {
    while (target) {
      if (target.tagName === 'FORM') {
        return target;
      }
      target = target.parentNode;
    }
  };

  find = function($context) {
    return function() {
      return $context.find.apply($context, arguments);
    };
  };

  BetterValidation = (function() {

    function BetterValidation(target, overrides) {
      this.validate_field = __bind(this.validate_field, this);

      var _this = this;
      _.extend(this, overrides);
      this.$target = $(target);
      this.$form = target.tagName !== 'form' ? $(find_form(target)) : this.$target;
      this.is_valid = true;
      this.is_valid_async = false;
      this.is_ajax_form = this.get_attribute('async');
      this.find = find(this.$target);
      this.$error_box = this.find(this.error_box_selector);
      this.$errors = this.find(this.error_selector);
      this.$form.find(':submit').on('click', function(e) {
        return _this.validate(e);
      });
    }

    BetterValidation.prototype.validate = function(e) {
      var $fields, errors,
        _this = this;
      if (!this.$target.has(e.target).length) {
        return false;
      }
      this.reset_all_errors();
      errors = {};
      $fields = this.find(this.field_selector);
      $fields.each(function(i, field) {
        var field_errors;
        field_errors = _this.validate_field(field);
        if (field_errors.length) {
          return errors[_this.field_name.apply(field)] = field_errors;
        }
      });
      errors = this.process_errors(errors);
      this.trigger('validate');
      if (_(errors).keys().length) {
        this.apply_errors(errors);
        this.trigger('invalid', errors);
        return false;
      } else if (this.is_ajax_form && !this.is_valid_async) {
        $.ajax({
          url: this.ajax_url(),
          type: this.method(),
          data: $fields.serialize(),
          success: function() {
            _this.reset_all_errors();
            _this.is_valid_async = true;
            _this.after_ajax_validation.apply(_this, arguments);
            return _this.is_valid_async = false;
          },
          error: function(xhr) {
            errors = _this.process_ajax_errors(xhr);
            _this.apply_errors(errors);
            return _this.trigger('invalid', [errors, xhr]);
          }
        });
        this.trigger('validate_async');
        return false;
      } else {
        this.reset_all_errors();
        this.trigger('valid');
        return true;
      }
    };

    BetterValidation.prototype.get_attribute = function(attribute, html_attribute) {
      return this.$target.data("validate-" + attribute) || this.$form.data("validate-" + attribute) || (html_attribute ? this.$form.attr(attribute) : void 0);
    };

    BetterValidation.prototype.validate_field = function(field) {
      var errors,
        _this = this;
      errors = [];
      _(BetterValidation.VALIDATORS).each(function(validator) {
        var message_function, validate_function;
        message_function = validator[0], validate_function = validator[1];
        if (!validate_function.apply(field)) {
          return errors.push(message_function.apply(field));
        }
      });
      return errors;
    };

    BetterValidation.prototype.apply_errors = function(errors) {
      var _this = this;
      try {
        _(errors).each(function(field_errors, field) {
          return _(field_errors).each(function(error) {
            return _this.toggle_error(field, error, true);
          });
        });
        return this.trigger('error', errors);
      } catch (error) {

      }
    };

    BetterValidation.prototype.toggle_error = function(field, error, show) {
      var $error;
      $error = this.$errors.filter("." + (this.translate_error(error, field)));
      toggle_hidden($error, show);
      if (show) {
        this.toggle_errors(true);
      }
      if (show) {
        return this.is_valid = false;
      }
    };

    BetterValidation.prototype.reset_all_errors = function() {
      this.is_valid = true;
      this.toggle_errors(false);
      this.$errors.each(function() {
        return toggle_hidden($(this), false);
      });
      return this.trigger('reset');
    };

    BetterValidation.prototype.toggle_errors = function(show) {
      return toggle_hidden(this.$error_box, show);
    };

    BetterValidation.prototype.trigger = function() {
      arguments[0] = "better_validation:" + arguments[0];
      return this.$target.trigger.apply(this.$target, arguments);
    };

    BetterValidation.prototype.process_errors = function(errors) {
      return errors;
    };

    BetterValidation.prototype.translate_error = function(error, field) {
      return "" + field + "_" + (error.replace(/\ /g, '_').replace(/\'/g, '').replace(/[\(||\)]/g, ''));
    };

    BetterValidation.prototype.process_ajax_errors = function(xhr) {
      return $.parseJSON(xhr.getResponseHeader('x-error-messages'));
    };

    BetterValidation.prototype.after_ajax_validation = function() {
      var callback, redirect;
      if (callback = this.async_callback || this.get_attribute('async-callback')) {
        if (typeof callback === 'function') {
          return callback;
        } else if (typeof (callback = window[callback]) === 'function') {
          return callback.apply(this.$target, arguments);
        }
      } else if (redirect = this.get_attribute('async-redirect')) {
        return window.top.location = redirect;
      } else {
        return this.$target.trigger('submit');
      }
    };

    BetterValidation.prototype.ajax_url = function() {
      return "" + (this.get_attribute('async-url') || this.$form.attr('action').replace(/\/$/, '')) + ".json";
    };

    BetterValidation.prototype.method = function() {
      return this.get_attribute('method') || this.$form.attr('method');
    };

    BetterValidation.prototype.inline = false;

    BetterValidation.prototype.error_box_selector = '.error-box';

    BetterValidation.prototype.error_selector = '.error';

    BetterValidation.prototype.scope_selector = 'form';

    BetterValidation.prototype.field_selector = 'input, select, textarea';

    BetterValidation.prototype.field_name = function() {
      return $(this).data('validate-field-name') || this.name;
    };

    return BetterValidation;

  })();

  BetterValidation.VALIDATORS = {
    blank: [
      function() {
        return 'is blank';
      }, function() {
        var $field;
        if (($field = $(this)).data('validate-blank')) {
          return $field.val();
        } else {
          return true;
        }
      }
    ],
    regex: [
      function() {
        return $(this).data('validate-regex-message') || 'regex mismatch';
      }, function() {
        var $field, regex;
        if (regex = ($field = $(this)).data('validate-regex')) {
          return new RegExp(regex).test($field.val());
        } else {
          return true;
        }
      }
    ],
    'min-length': [
      function() {
        return $(this).data('validate-min-length-message') || 'is too short';
      }, function() {
        var $field;
        if (($field = $(this)).data('validate-min-length')) {
          return !($field = $(this)).val().length >= parseInt($field.data('validate-min-length'), 10);
        } else {
          return true;
        }
      }
    ],
    'max-length': [
      function() {
        return $(this).data('validate-max-length-message') || 'is too short';
      }, function() {
        var $field;
        if (($field = $(this)).data('validate-max-length')) {
          return !$field.val().length <= parseInt($field.data('validate-max-length'), 10);
        } else {
          return true;
        }
      }
    ]
  };

  CONFIGURABLES = _('ajax_url error_box_selector error_selector field_name field_selector'.split(' '));

  BetterValidation.Configuration = (function() {

    function Configuration() {}

    Configuration.prototype.hidden_class = HIDDEN_CLASS;

    Configuration.prototype.error_selector = BetterValidation.prototype.error_selector;

    Configuration.prototype.error_box_selector = BetterValidation.prototype.error_box_selector;

    Configuration.prototype.ajax_url = BetterValidation.prototype.ajax_url;

    return Configuration;

  })();

  BetterValidation.Configure = function(configuration) {
    var config;
    config = new BetterValidation.Configuration;
    configuration.call(config);
    HIDDEN_CLASS = config.hidden_class;
    return CONFIGURABLES.each(function(config_key) {
      if (config[config_key]) {
        return BetterValidation.prototype[config_key] = config[config_key];
      }
    });
  };

  this.BetterValidation = BetterValidation;

  $.fn.validateBetter = function(options) {
    return this.each(function() {
      return new BetterValidation(this, options);
    });
  };

  $('[data-validate-with="better_validation"]').validateBetter();

}).call(this);
