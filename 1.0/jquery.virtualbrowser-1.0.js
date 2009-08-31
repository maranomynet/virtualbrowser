// encoding: utf-8
/*
  jQuery.fn.virtualBrowser();
    Turns any element into a virtual browser window (or iframe), attempting to 
    capture all link-clicks and form submits and convert them into ajax-requests,
    and then inserting (and manipulating) the response document into the 
    virtualBrowser element (the semantic equivalient of a browser's <body>).


  Usage/Init:
    * $('#popupBody').virtualBrowser(options);
    * $('#popupBody').virtualBrowser(url);


  Options:
    * url:         null,                      // String: Initial URL for the frame
    * params:      null,                      // Object/String: Request data (as in $.get(url, data, callback) )
    * loadmsg:     '<div class="loading" />'  // String/Element: Template for a loading message displayed while loading a URL
    * loadmsgMode: 'none',                    // String: Options: (none|overlay|replace)
    * onPreload:   null,                      // Function: Shorthand for .bind('vbrowserpreload' handler);
    * onLoad:      null,                      // Function: Shorthand for .bind('vbrowserload' handler);

  Localization:
    * jQuery.fn.virtualBrowser.i18n['lang'] = {
          loading: 'loading message in your language'
        };



  Events:
    * 'preload'  // .bind('vbrowserpreload', function (e, elm) {
                        this              // the virtualBrowser body element
                        $(this).data('virtualBrowser').cfg // config object
                        elm  // the link or form element that was clicked/activated
                        // Cancellable via e.preventDefault()
                      });
    * 'load'     // .bind('vbrowserload', function (e, response) {
                        this                               // the virtualBrowser body element
                        $(this).data('virtualBrowser').cfg // config object
                        response                           // { result: '$.ajax()/$.get() result string.' // read by handler
                                                           //   dom: DOMElementsToInsertIntoVBrowserBody  // set by handler
                                                           // }
                        // Cancellable via e.preventDefault()
                      });


  Methods:
    * 'load'     // .virtualBrowser('load', url);  // loads an url. Triggers the normal 'vbrowserpreload' and 'vbrowserload' events



  TODO/ideas: 
    * History buffer
       * Add 'back' (and 'forward'?) methods
    * Consider adding 'reload' method
       
*/

(function($){

  
  var methods = {
      'load': function (url) {
          
        }
      
    };


  $.fn.virtualBrowser = function (config, args) {
      var confIsString = typeof config == 'string';
      if (confIsString)
      {
        var method = methods[config];
        if (method)
        {
          this.each(function(){
              method.apply( this, [].concat(args) );
            });
        }
        else
        {
          config = { url: config };
          confIsString = false;
        }
      }

      if (confIsString)
      {
        var body = $(this),
            lang = ...;

        config = $.extend(
                {
                  //url:         null,                      // String: Initial URL for the frame
                  //params:      null,                      // Object/String: Request data (as in $.get(url, data, callback) )
                  loadmsg:     '<div class="loading" />'  // String/Element: Template for a loading message displayed while loading a URL
                  loadmsgMode: 'none',                    // String: Options: (none|overlay|replace)
                  //onPreload:   null,                      // Function: Shorthand for .bind('vbrowserpreload' handler);
                  //onLoad:      null,                      // Function: Shorthand for .bind('vbrowserload' handler);
                },
                config || {};
              );

      }

      return this;
    };


  $.fn.virtualBrowser.i18n = {
      en: { loading: 'Loading...' },
      is: { loading: 'Sæki gögn...' }
    }

})(jQuery);
