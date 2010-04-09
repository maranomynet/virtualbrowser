// encoding: utf-8
// ----------------------------------------------------------------------------------
// jQuery.fn.virtualBrowser v 1.0
// ----------------------------------------------------------------------------------
// (c) 2009 Hugsmiðjan ehf  -- http://www.hugsmidjan.is
//  written by:
//   * Már Örlygsson        -- http://mar.anomy.net
// ----------------------------------------------------------------------------------

/*
  jQuery.fn.virtualBrowser();
    Turns any element into a virtual browser window (or iframe), attempting to
    capture all link-clicks and form submits and convert them into ajax-requests,
    and then inserting (and manipulating) the response document into the
    virtualBrowser element (the semantic equivalient of a browser's <body>).

  Requires:
    * jQuery 1.3.3+
    * eutils 1.0     ( $.getResultBody() )


  Usage/Init:
    * $('#popupBody').virtualBrowser(options);
    * $('#popupBody').virtualBrowser(options, url);  // initial ('home') URL.


  Options:
    * url:           null,                      // String: Initial URL for the frame
    * params:        null,                      // Object/String: Request data (as in $.get(url, data, callback) )
    * onBeforeload:  null,                      // Function: Shorthand for .bind('VBbeforeload' handler);
    * onLoad:        null,                      // Function: Shorthand for .bind('VBload', handler);
    * onLoaded:      null,                      // Function: Shorthand for .bind('VBloaded', handler);
    * loadmsgElm:    '<div class="loading" />'  // String/Element: Template for a loading message displayed while loading a URL
    * loadmsgMode:   'none',                    // String: Options: (none|overlay|replace)  // none == no load message; overlay == overlays the old content with the loadmsg; replace == removes the old content before displaying the loadmsg

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
                              // cancel caching of the request by setting `request.noCache == true;`
                              // e.passThrough = true;  // Instructs the virtualBrowser to disable any click events and pass the click through to the web browser
                            });
    * 'VBload'         // .bind('VBload', function (e, request) {
                              this  // the virtualBrowser body element
                              $(this).data('virtualBrowser').cfg // config object
                              request  // Object: {
                                       //   result:     // String: The $.ajax()/$.get() callback responseText parameter (Read by handler)
                                       //   resultDOM:  // Element(s)/Collection to insert into the virtualBrowser body  (Set by handler)
                                       //   xhr:        // The XMLHTTPRequest object
                                       //   status:     // The friendly status msg returned by .ajax Complete callback (i.e. "notmodified", "success", "error", "timeout", etc.)
                                       //   url:  // String the URL that was just loaded
                                       //   elm:  // jQuery collection containing (when applicable) the link (or form element) that was clicked/submitted
                                       // }
                              // Cancellable via e.preventDefault()
                            });

    * 'VBloaded'         // .bind('VBloaded', function (e, request) {
                              this  // the virtualBrowser body element
                              $(this).data('virtualBrowser').cfg // config object
                              request  // Object: {
                                       //   url:  // String the URL that was just loaded
                                       //   elm:  // jQuery collection containing (when applicable) the link (or form element) that was clicked/submitted
                                       // }
                              // Uncancellable!
                            });


  Methods:
    * 'load'     // .virtualBrowser('load', url);  // loads an url. Triggers the normal 'vbrowserpreload' and 'vbrowserload' events



  TODO/ideas:
    * Offer the onLoad handlers a cleaned DOM (stripped of <scripts/>, <link/>, etc).
    * Remove dependency on eutils.
    * History buffer
       * Add 'back' (and 'forward'?) methods
    * Consider adding 'reload' method

*/

(function($, undefined){

  // FIXME: remove this when jQuery 1.4 is out
  $.fn.detach = $.fn.detach || function(){
      return this.each(function(){
          var parent = this.parentNode;
          parent  &&  parent.nodeType==1  &&  parent.removeChild(this);
        });
    };



  var _docLoc            = document.location,
      _isDefaultPrevented = 'isDefaultPrevented',  // ...to save bandwidth
      _stopPropagation    = 'stopPropagation',     // ...to save bandwidth
      _passThrough        = 'passThrough',         // ...to save bandwidth
      _virtualBrowser     = 'virtualBrowser',      // ...to save bandwidth
      _VBbeforeload       = 'VBbeforeload',        // ...to save bandwidth
      _VBload             = 'VBload',              // ...to save bandwidth
      _VBloaded           = 'VBloaded',            // ...to save bandwidth
      _replace            = 'replace',             // ...to save bandwidth
      _protocolSlash      = /^(https?:)?\/\//,



      _methods = {
          'load': function (url) {
              var elm = typeof url != 'string' ? $(url) : undefined,
                  body = $(this),
                  config = body.data(_virtualBrowser).cfg,
                  evBeforeload = $.Event(_VBbeforeload), 
                  evLoad, evLoaded,
                  loadmsgMode = config.loadmsgMode,
                  request = { elm: elm };

              if (elm)
              {
                url = elm.attr('href');
                url = url === undefined ? elm.attr('action') : url;
              }
              // Correctly resolve relative empty-string URLs (like <form action="">)
              url = request.url = url === '' ? _docLoc.href : url;

              if (url)
              {
                evBeforeload[_stopPropagation]();
                body.trigger(evBeforeload, request);
                // trap external (non-AJAXable) URLs or links targeted at another window and set .passThrough as true
                if (  // if passThrough is already set, then there's not need for further checks, and...
                      !evBeforeload[_passThrough] &&
                      (
                        (
                          // if event handler hasn't explicitly set passThrough to false
                          evBeforeload[_passThrough] === undefined  &&  
                          // and elm is defined, and is `target`ted at an external window  // IDEA: allow named virtualBrowsers to target and trigger 'open' actions on eachother
                          elm  &&  elm[0].target  &&  elm[0].target != window.name
                        ) 
                          || // ...or...
                        (
                          /^([a-z]{3,12}:|\/\/)/i.test(url)  &&  // the URL starts with a protocol (as well as "protocol-neutral" URLs (//host.com/).)
                          // and the URL doesn't start with the same hostName and portNumber as the current page.
                          !url.toLowerCase()[_replace](_protocolSlash, '').indexOf( _docLoc.href.toLowerCase()[_replace](_protocolSlash, '').split('/')[0] ) == 0
                        )
                      )
                    )
                {
                  evBeforeload[_passThrough] = true;
                }
                // virtualBrowser should not handle .passThrough events.
                evBeforeload[_passThrough]  &&  evBeforeload.preventDefault();

                if ( !evBeforeload[_isDefaultPrevented]() )
                {
                  var params = config.params,
                      cache = request.noCache,
                      method;
                  if (elm && elm.is('form'))
                  {
                    params = elm.serialize() + '&' + params;
                    method = elm.attr('method')||'GET';
                  }
                  $.ajax({
                      url: request.url.split('#')[0],  // in case jQuery (or the Browser) chops this off before sending the request...
                      data: params,
                      type: method,
                      cache: cache !== undefined ? cache : !config.noCache,
                      complete:  function (xhr, status) {
                                    // Example: request.url == 'http://foo.com/path/file?bar=1#anchor'
                                    var fileUrl = request.url.split('#')[0],                              // 'http://foo.com/path/file?bar=1'
                                        filePart = fileUrl[_replace](/([^?]*\/)?(.*)/, '$2'),              // file?bar=1
                                        pathPrefix = fileUrl.split('?')[0][_replace](/(.*\/)?.*/, '$1'),  // 'http://foo.com/path/'
                                        hasQuery = /\?/.test(fileUrl),                                     // fileUrl contains a queryString
                                        txt = xhr.responseText;
                                    hasQuery  &&  ( txt = txt[_replace](/(['"])\?/gi, '$1¨<<`>>') ); // Escape "? and '? (potential urls starting with a queryString)
                                    txt =  txt[_replace](/(<[^>]+ (href|src|action)=["'])(["'#¨])/gi, '$1'+filePart+'$3'); // prepend all empty/localpage urls with filePart
                                    hasQuery  &&  ( txt =  txt[_replace](/(['"])¨<<`>>/gi, '$1?') // Unescape all unaffected "? and '? pairs back to normal
                                                              [_replace](/¨<<`>>/gi, '&amp;') );  // Transform affected (all other) ? symbols into &amp;
                                    txt =  txt[_replace](/http:\/\//gi, '^<<`>>')  // Escape all "http://" (potential URLs) for easy, cross-browser RegExp detection 
                                              [_replace](/https:\/\//gi, '`<<`>>') // Escape all "https://" (potential URLs) for easy, cross-browser RegExp detection 
                                              [_replace](/(<[^>]+ (href|src|action)=["'])([^\/`\^])/gi, '$1'+pathPrefix+'$3') // prepend pathPrefix to all relative URLs (not starting with `/`, `//`, `(https://) or ^(http://)
                                              [_replace](/\^<<`>>/g, 'http://')    // Unescape "http://" back to normal
                                              [_replace](/\^<<`>>/g, 'http://')    // Unescape "http://" back to normal
                                              [_replace](/`<<`>>/g,  'https://');  // Unescape "https://" back to normal
                                    request.result = txt;
                                    request.xhr = xhr;
                                    request.status = status;
                                    evLoad = $.Event(_VBload);
                                    evLoad[_stopPropagation]();
                                    body.trigger(evLoad, request);
                                    if ( !evLoad[_isDefaultPrevented]() )
                                    {
                                      evLoaded = $.Event(_VBloaded);
                                      evLoaded[_stopPropagation]();
                                      config.loadmsgElm.detach();
                                      body
                                          .empty()
                                          .append( request.resultDOM || $.getResultBody(request.result)[0].childNodes )
                                          .trigger(evLoaded, { url: request.url, elm: request.elm })
                                          // Depend on 'click' events bubbling up to the virtualBrowser `body` to allow event-delegation and click-bubbling within the `body`
                                          // Thus, we assume that any clicks who's bubbling were cancelled should not be handled by VB.
                                          .bind('click', _handleClickOnBody)
                                          .find('form')
                                              // NOTE for next version: by requiring jQuery 1.4 we could depend on 'submit' events bubbling up to the `body`
                                              .data(_virtualBrowser+'Elm', body)
                                              .bind('submit', _handleRequestOnElm);
                                    }
                                  }
                      });
                  if (loadmsgMode && loadmsgMode != 'none')
                  {
                    config.loadmsgMode == 'replace'  &&  body.empty();
                    body.append(config.loadmsgElm);
                  }
                }
              }
              return evBeforeload;
            }

        },

      _handleClickOnBody = function (e) {
          var link = $(e.target).closest('[href]');
          if (link[0])
          {
            e.VBbody = this;
            _handleRequestOnElm.call(link, e);
          }
        },

      _handleRequestOnElm = function (e) {
          if ( !e[_isDefaultPrevented]() )
          {
            var elm = this,
                VBbody = e.VBbody || $(elm).data(_virtualBrowser+'Elm') || this;
                bfloadEv = _methods['load'].call(VBbody, elm);
            bfloadEv.isPropagationStopped()  &&  e[_stopPropagation]();
            !bfloadEv[_passThrough] && e.preventDefault();
          }
        },



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
                      //noCache:     false,                     // Controls the $.ajax() cache option 
                      //params:      null,                      // Object/String: Request data (as in $.get(url, data, callback) )
                      //onBeforeload: null,                     // Function: Shorthand for .bind('VBbeforeload' handler);
                      //onLoad:      null,                      // Function: Shorthand for .bind('VBload' handler);
                      //onLoaded:    null,                      // Function: Shorthand for .bind('VBloaded' handler);
                      //loadmsgElm:  '<div class="loading" />'  // String/Element: Template for a loading message displayed while loading a URL
                      loadmsgMode:    'none'                    // String: available: "none", "overlay" & "replace"
                    },
                    config || {}
                  );
            args && (config.url = args);
            var body = this,
                loadmsgElm = config.loadmsgElm || '<div class="loading" />',
                loadmsg = (fnVB.i18n[body.closest('*[lang]').attr('lang')] || {}).loading || fnVB.i18n.en.loading;

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
                .data(_virtualBrowser, { cfg: config });

            config.onLoad && body.bind(_VBload, config.onLoad);
            config.onLoaded && body.bind(_VBloaded, config.onLoaded);
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
