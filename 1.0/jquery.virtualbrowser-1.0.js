// encoding: utf-8
/*
  jQuery.fn.virtualBrowser();
    Turns any element into a virtual browser window (or iframe), attempting to
    capture all link-clicks and form submits and convert them into ajax-requests,
    and then inserting (and manipulating) the response document into the
    virtualBrowser element (the semantic equivalient of a browser's <body>).

  Requires:
    * jQuery 1.3.3+


  Usage/Init:
    * $('#popupBody').virtualBrowser(options);
    * $('#popupBody').virtualBrowser(options, url);  // initial ('home') URL.


  Options:
    * url:           null,                      // String: Initial URL for the frame
    * params:        null,                      // Object/String: Request data (as in $.get(url, data, callback) )
    * onBeforeload:  null,                      // Function: Shorthand for .bind('VBbeforeload' handler);
    * onLoad:        null,                      // Function: Shorthand for .bind('VBload', handler);
    * loadmsgElm:    '<div class="loading" />'  // String/Element: Template for a loading message displayed while loading a URL
    * loadmsgMode:   'none',                    // String: Options: (none|overlay|replace)

  Localization:
    * jQuery.fn.virtualBrowser.i18n['lang'] = {
          loading: 'loading message in your language'
        };



  Events:
    * 'VBbeforeload'   // .bind('VBbeforeload', function (e, request) {
                              this  // the virtualBrowser body element
                              $(this).data('virtualBrowser').cfg  // config object
                              request  // Object: {
                                       //   url:  // String the URL that was just loaded (Modifiable by handler)
                                       //   elm:  // jQuery collection containing (when applicable) the link (or form element) that was clicked/submitted
                                       // }
                              // Cancellable via e.preventDefault()
                              // e.passThrough = true;  // Instructs the virtualBrowser to disable any click events and pass the click through to the web browser
                            });
    * 'VBload'         // .bind('VBload', function (e, request) {
                              this  // the virtualBrowser body element
                              $(this).data('virtualBrowser').cfg // config object
                              request  // Object: {
                                       //   result:     // String: The $.ajax()/$.get() callback responseText parameter (Read by handler)
                                       //   resultDOM:  // Element(s)/Collection to insert into the virtualBrowser body  (Set by handler)
                                       //   url:  // String the URL that was just loaded
                                       //   elm:  // jQuery collection containing (when applicable) the link (or form element) that was clicked/submitted
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

(function($, undefined){

  // FIXME: remove this when
  $.fn.detach = $.fn.detach || function(){
      return this.each(function(){
          var parent = this.parentNode;
          parent  &&  parent.nodeType==1  &&  parent.removeChild(this);
        });
    };



  var _virtualBrowser = 'virtualBrowser',  // ...to save bandwidth
      _VBbeforeload   = 'VBbeforeload',    // ...to save bandwidth
      _VBload         = 'VBload',          // ...to save bandwidth
      _replace        = 'replace',         // ...to save bandwidth
      _protocolSlash  = /^(https?:)?\/\//,



      _methods = {
          'load': function (url) {
              var elm = typeof url != 'string' ? $(url) : undefined,
                  body = $(this),
                  config = body.data(_virtualBrowser).cfg,
                  ev1 = jQuery.Event(_VBbeforeload),
                  loadmsgMode = config.loadmsgMode,
                  request = { elm: elm };

              url = request.url = elm ?
                                (elm.attr('href') || elm.attr('action') || ''):
                                url;
              if (url)
              {
                body.trigger(ev1, request);
                // trap external (non-AJAXable) URLs or links targeted at another window and set .passThrough as true
                if (  // if passThrough is already set, then there's not need for further checks, and...
                      !ev1.passThrough &&
                      (
                        (
                          // if event handler hasn't explicitly set passThrough to false
                          ev1.passThrough === undefined  &&  
                          // and elm is defined, and is `target`ted at an external window  // IDEA: allow named virtualBrowsers to target and trigger 'open' actions on eachother
                          elm  &&  elm[0].target  &&  elm[0].target != window.name
                        ) 
                          || // ...or...
                        (
                          /^([a-z]{3,12}:|\/\/)/i.test(url)  &&  // the URL starts with a protocol (as well as relative protocol URLs (//host.com/).)
                          // and the URL doesn't start with the same hostName and portNumber as the current page.
                          !url.toLowerCase()[_replace](_protocolSlash, '').indexOf( location.href.toLowerCase()[_replace](_protocolSlash, '').split('/')[0] ) == 0
                        )
                      )
                    )
                {
                  ev1.passThrough = true;
                }
                // virtualBrowser should not handle .passThrough events.
                ev1.passThrough  &&  ev1.preventDefault();

                if ( !ev1.isDefaultPrevented() )
                {
                  if (loadmsgMode && loadmsgMode != 'none')
                  {
                    config.loadmsgMode == 'replace'  &&  body.empty();
                    body.append(config.loadmsgElm);
                  }
                  var params = config.params,
                      method;
                  if (elm && elm.is('form'))
                  {
                    params = elm.serialize() + '&' + params;
                    method = elm.attr('method')||'GET';
                  }
                  $.ajax({
                      url: request.url,
                      data: params,
                      type: method,
                      complete:  function (xhr) {
                                    // Example: request.url == 'http://foo.com/path/file?bar=1#anchor'
                                    var fileUrl = request.url.split('#')[0],  // 'http://foo.com/path/file?bar=1'
                                        pathPrefix = fileUrl.split('?')[0][_replace](/(.*\/).*/, '$1'),  // 'http://foo.com/path/'
                                        hasQuery = /\?/.test(fileUrl),  // fileUrl contains a queryString
                                        txt = xhr.responseText;
                                    hasQuery  &&  ( txt = txt[_replace](/(['"])\?/gi, '$1¨<<`>>') ); // Escape "? and '? (potential urls starting with a queryString)
                                    txt =  txt[_replace](/(<[^>]+ (href|src|action)=["'])(["'#¨])/gi, '$1'+fileUrl+'$3'); // prepend all empty/localpage urls with fileUrl
                                    hasQuery  &&  ( txt =  txt[_replace](/(['"])¨<<`>>/gi, '$1?') // Unescape all unaffected "? and '? pairs back to normal
                                                              [_replace](/¨<<`>>/gi, '&amp;') );  // Transform affected (all other) ? symbols into &amp;
                                    txt =  txt[_replace](/http:\/\//gi, '^<<`>>')  // Escape all "http://" (potential URLs) for easy, cross-browser RegExp detection 
                                              [_replace](/https:\/\//gi, '`<<`>>') // Escape all "https://" (potential URLs) for easy, cross-browser RegExp detection 
                                              [_replace](/(<[^>]+ (href|src|action)=["'])([^\/`\^])/gi, '$1'+pathPrefix+'$3') // prepend pathPrefix to all relative URLs (not starting with /, `(https://) or ^(http://)
                                              [_replace](/\^<<`>>/g, 'http://')  // Unescape "http://" back to normal
                                              [_replace](/`<<`>>/g,  'https://');  // Unescape "https://" back to normal
                                    request.result = txt;
                                    var ev2 = jQuery.Event(_VBload);
                                    body.trigger(ev2, request);
                                    if ( !ev2.isDefaultPrevented() )
                                    {
                                      config.loadmsgElm.detach();
                                      body
                                          .empty()
                                          .append( request.resultDOM || $.getResultBody(request.result) )
                                          .find('form')
                                              .data(_virtualBrowser+'Elm', body)
                                              .bind('submit', _handleRequest);
                                    }
                                  }
                      });
                }
              }
              return ev1;
            }

        },



      _handleRequest = function (e) {
          var elm = e.type=='submit' ?
                        e.target:  // <form />
                        $(e.target).closest('[href]')[0];  // link!
          if (elm)
          {
            var body = $(this).data(_virtualBrowser+'Elm') || this;
                bfloadEv = _methods['load'].call(body, elm);
            bfloadEv.isPropagationStopped()  &&  e.stopPropagation();
            !bfloadEv.passThrough && e.preventDefault();
          }
        };



      fnVB = $.fn[_virtualBrowser] = function (config, args) {
          var confIsString = typeof config == 'string';
          if (confIsString)
          {
            var method = _methods[config];
            method  &&  this.each(function(){
                  method.apply( this, [].concat(args) );  // Normalize `args` into an array. ([].concat() does that :-)
                });
          }
          else
          {
            config = $.extend(
                    {
                      //url:         null,                      // String: Initial URL for the frame
                      //params:      null,                      // Object/String: Request data (as in $.get(url, data, callback) )
                      //onBeforeload:   null,                   // Function: Shorthand for .bind('VBbeforeload' handler);
                      //onLoad:      null,                      // Function: Shorthand for .bind('VBload' handler);
                      //loadmsgElm:  '<div class="loading" />'  // String/Element: Template for a loading message displayed while loading a URL
                      loadmsgMode:    'none'                    // String: available: "none", "overlay" & "replace"
                    },
                    config || {}
                  );
            args && (config.url = args);
            var body = $(this),
                loadmsgElm = config.loadmsgElm || '<div class="loading" />',
                loadmsg = (fnVB.i18n[body.closest('[lang]').attr('lang')] || {}).loading || fnVB.i18n.en.loading;;

            if (loadmsgElm.charAt)
            {
              loadmsgElm = loadmsgElm.replace(/%\{msg\}/g, loadmsg);
            }
            loadmsgElm = config.loadmsgElm = $(loadmsgElm);
            if ( !loadmsgElm.text() )
            {
              loadmsgElm.append(loadmsg);
            }

            body
                .data(_virtualBrowser, { cfg: config })
                .bind('click', _handleRequest);

            config.onLoad && body.bind(_VBload, config.onLoad);
            config.onBeforeload && body.bind(_VBbeforeload, config.onBeforeload);
            config.params =  typeof config.params == 'string' ?
                              config.params:
                              $.param(config.params||{});

            config.url  &&  body[_virtualBrowser]('load', config.url)
          }

          return this;
        };



  fnVB.i18n = {
      en: { loading: 'Loading...' },
      is: { loading: 'Sæki gögn...' }
    }

})(jQuery);
