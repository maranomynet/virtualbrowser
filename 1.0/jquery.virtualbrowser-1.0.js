/*
  jQuery.fn.virtualBrowser();
    Turns any element into a virtual browser window (or iframe).
    attempting to convert all link clicks and form submits into ajax-requests
    and inserting (and manipulating) the response document into the virtualBrowser
    element (the equivalient of a browser's <body>)

  Events:
    * 'preload'  // $('#browserElm').bind('vbrowserpreload', function (e, elm) {
                        this              // the virtualBrowser body element
                        $(this).data('virtualBrowser').cfg // config object
                        elm  // the link or form element that was clicked/activated
                        // Cancellable via e.preventDefault()
                      });
    * 'load'     // $('#browserElm').bind('vbrowserload', function (e, response) {
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
        config = $.extend(
                {
                  //url:     '',  // Initial URL for the frame
                  //params:  '',  // Object/String data (as in $.get(url, data, callback) )
                  loadmsg: '<div class="loading" />'
                  loadmsgMode: 'none',  // Options: (none|overlay|replace)
                  //onPreload: function(e, cfg){},  // shorthand to bind 'vbrowserpreload' event handler
                  //onLoad:  function(e, cfg){},  // shorthand to bind 'vbrowserload' event handler
                },
                config || {};
              );

        var body = $(this);
      }

      return this;
    };


  $.fn.virtualBrowser.i18n = {
      en: 'Loading...',
      is: 'Sæki gögn...'
    }

})(jQuery);
