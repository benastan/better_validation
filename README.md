# Better Validation

A better JavaScript validation library.

## Overview

Form validation is a bitch. Why not Markup API-driven errors?

## Dependencies

- Jquery (http://www.jquery.com)
- Underscore (http://underscorejs.org)

## Usage

Let's try it out...

### Basic forms

Let's start with a simple registration form. Your markup looks like:

    <form action="/users" method="post" data-validate-with="better_validation">
      <div class="error-box hide">
        <p class="error name_is_blank">Please enter your name</p>
        <p class="error password_is_too_short">Your password must be at least 6 characters.</p>
      </div>
      <div class="field">
        <label for="name">Name:</label>
        <input type="text" name="name" data-validate-blank="true" />
      </div>
      <div class="field">
        <label for="password">Name:</label>
        <input type="text" name="password" data-validate-blank="true" data-min-length="6" />
      </div>
      <div class="field">
        <input type="submit" value="Register" />
      </div>
    </form>

And that's it! BetterValidation will automatically validate this form
when submitted, showing and hiding errors based on the requested
`data-validate` validators. When all validation parameters are met, the
form is automatically submitted.

### Async Forms

Forms can also be validated/submitted via AJAX. With the above example,
simply set the form's `data-validate-async` attribute to 'true'.
BetterValidation will then send a request, as per the form itself.

  <form action="/users" method="post" data-validate-with="better_validation" data-validate-async="true">

On the server side, simply set the 'X-Error-Messages' HTTP header to a
string of JSON in the following format:

    {
      "name": [ "is blank" ],
      "password": [ "is too short" ],
      "another_field": [ "some custom error" ]
    }

The final error, not seen in the `Basic Form` example, would show the
 the HTML Element matching the selector
".error.another_field_some_custom_error".

#### Async Redirects and Callbacks

You can also provide a redirect or a callback to be performed after
asynchronous validation.

For a redirect, just set the `data-validate-async-redirect` attribute to
the url of the redirect:

    <form action="/users" method="post" data-validate-with="better_validation" data-validate-async="true" data-validate-async-redirect="/profile">

For more complex post-validation handling, set the name of a
globally-accessible callback to the `data-validate-async-callback`
attribute.

    <form action="/users" method="post" data-validate-with="better_validation" data-validate-async="true" data-validate-async-callback="redirect_registered_user">

Doing so will evaluate the code `window.redirect_registered_user()`
after the form is successfully validated asynchronously.

#### More advanced usage

See advanced configuration, below.

## Advanced Usage

** Coming soon... **

### The BetterValidation class and jQuery.validateBetter()

** Coming soon... **

### Scoped Asynchronous Forms

** Coming soon... **

