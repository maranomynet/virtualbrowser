// encoding: utf-8
// ----------------------------------------------------------------------------------
// jQuery.fn.virtualBrowser v 1.1
// ----------------------------------------------------------------------------------
// Copyright 2011
//   Hugsmiðjan ehf. (http://www.hugsmidjan.is)  &
//   Már Örlygsson  (http://mar.anomy.net/)
//
// Dual licensed under a MIT licence (http://en.wikipedia.org/wiki/MIT_License)
// and GPL 2.0 or above (http://www.gnu.org/licenses/old-licenses/gpl-2.0.html).
// ----------------------------------------------------------------------------------

/*
  jQuery.fn.virtualBrowser();
    Turns any element into a virtual browser window (or iframe), attempting to
    capture all link-clicks and form submits and convert them into ajax-requests,
    and then (manipulate and) insert the response document into the
    virtualBrowser element (which is the semantic equivalient of a real browser's <body>).

  Source & more info:
    * http://github.com/maranomynet/virtualbrowser/

  Requires:
    * jQuery 1.5.2+


  Usage/Init:
    * $('#popupBody').virtualBrowser(options);
    * $('#popupBody').virtualBrowser(options, url);  // initial URL to load.


  Options:
    * url:           null,                      // String|linkElm|formElm|collection: Initial URL for the frame (Uses the 'href' or 'action' attributes in case elements were passed.)
    * params:        null,                      // Object/String: Persistent request data (as in $.get(url, data, callback) ) that gets added to *every* 'load' request.
    * noCache:       null,                      // Boolean: Controls the $.ajax() cache option
    * selector:      '>*',                      // String selector to quickly filter the incoming DOM just before injecting it into the virtualBrowser container/body
    * stripCfg:      null,                      // Object: config for the $.getResultsBody() method
    * onBeforeload:  null,                      // Function: Shorthand for .bind('VBbeforeload' handler);
    * onError:       null,                      // Function: Shorthand for .bind('VBerror', handler);
    * onLoad:        null,                      // Function: Shorthand for .bind('VBload', handler);
    * onLoaded:      null,                      // Function: Shorthand for .bind('VBloaded', handler);
    * onDisengaged:  null,                      // Function: Shorthand for .bind('VBdisengaged', handler);
    * loadingClass:  null,                      // String: className to apply to the virtualBrowser body element during loading
    * loadmsgElm:    '<div class="loading" />'  // String/Element: Template for a loading message displayed while loading a URL
    * loadmsgMode:   'none',                    // String: Options: (none|overlay|replace)  // none == no load message; overlay == overlays the old content with the loadmsg; replace == removes the old content before displaying the loadmsg
    * disengage:     false,                     // Boolean: Sugar method. True triggers the 'disengage' method as soon as the next VBloaded has finished.


  Localization:
    * jQuery.fn.virtualBrowser.i18n['lang'] = {
          loading: 'loading message in your language'
        };



  Events:
    * 'VBbeforeload'  // Triggered before the $.ajax call.
                      //  .bind('VBbeforeload', function (e, request) {
                              this  // the virtualBrowser body element
                              $(this).data('virtualBrowser').cfg  // config object
                              $(this).data('virtualBrowser').lastRequest // the request object from the last 'load'
                              request  // Object: {
                                       //   url:  // String the URL that was just loaded (Modifiable by handler)
                                       //   elm:  // undefined or jQuery collection containing the link (or form element) that was clicked/submitted
                                       //   btn:  // undefined or Object whose presense indicates that form-submit was triggered by a named button or input[type=image]
                                                  // Contains an `elm` property (jQuery collection with the button element), and also `X` & `Y` (int) click coordinates for image buttons.
                                       // }
                              // Cancellable via e.preventDefault()
                              // cancel caching of the request by explicitly setting `request.noCache = true;`
                              // e.passThrough = true;  // Instructs the virtualBrowser to disable any click events and pass the click through to the web browser
                            });

    * 'VBerror'       // Triggered when the ajax request returns an error.
                      //  .bind('VBerror', function (e, request) {
                              this  // the virtualBrowser body element
                              $(this).data('virtualBrowser').cfg // config object
                              $(this).data('virtualBrowser').lastRequest // the *current* request object
                              request  // Object: {
                                       // ...all the same properties as the 'VBload' event
                                       // ...except `result` and `resultDOM` are empty
                                       // }
                              // Assign custom error DOM into `request.resultDOM`, or `request.result` to trigger normal processing by VBload and VBloaded...
                              // ...otherwise nothing will happen...
                            });

    * 'VBload'        // Triggered after the $.ajax request has completed, *before* any DOM injection has taken place
                      //  .bind('VBload', function (e, request) {
                              this  // the virtualBrowser body element
                              $(this).data('virtualBrowser').cfg  // config object
                              $(this).data('virtualBrowser').lastRequest // the request object from the last 'load'
                              request  // Object: {
                                       //   result:     // String: The $.ajax()/$.get() callback responseText parameter
                                       //   resultDOM:  // Element(s)/Collection that will get inserted into the virtualBrowser body.
                                                        // ...will be `undefined` unless `cfg.selector` is non-empty, or an `VBerror` handler has injected a custom resultDOM.
                                                        // set/modify this property to your heart's desire.
                                       //   xhr:        // The XMLHTTPRequest object
                                       //   status:  // The friendly status msg returned by .ajax Complete callback (i.e. "notmodified", "success", "error", "timeout", etc.)
                                       //   url:     // String the URL that was just loaded
                                       //   params:  // String the contents of the $.ajax data property
                                       //   method:  // String the method that was used (either "GET" or "POST")
                                       //   noCache: // boolean (defaults to false)
                                       //   elm:     // (See above documentation for 'VBbeforeload'.)
                                       //   btn:     // (See above documentation for 'VBbeforeload'.)
                                       // }
                              // Cancellable via e.preventDefault()
                            });

    * 'VBloaded'      // Triggered *after* the resultDOM has been injected into the virtualBrowser body. Think of it as `window.onload` of sorts.
                      //  .bind('VBloaded', function (e, request) {
                              this  // the virtualBrowser body element
                              $(this).data('virtualBrowser').cfg // config object
                              $(this).data('virtualBrowser').lastRequest // the *current* request object
                              request  // Object: {
                                       // ...all the same properties as the 'VBload' event...
                                       // }
                              // Uncancellable!
                            });

    * 'VBdisengaged'  // Triggered when the 'disengage' method has finished running (only unbinding VBdisengaged events happens after)
                      //  .bind('VBdisengaged', function (e) {
                              this  // the virtualBrowser body element
                              // NOTE: config and other data has been removed at this point.
                              // Uncancellable!
                            });


  Methods:
    * 'load'      // .virtualBrowser('load', url|linkElm|formElm|collection);  // loads an url (or the 'href' or 'action' attributes of an element) inside the virtualBrwoser 'body' element. Triggers the normal 'vbrowserpreload' and 'vbrowserload' events
    * 'data'      // syntactic sugar method that returns .data('virtualBrowser') - an object containing:
                  //    cfg:          // the config object for his virtualBrowser
                  //    lastRequest:  // the request object used in the last 'load' action (updated just *before* 'VBloaded' is triggered)
    * 'disengage' // .virtualBrowser('disengage');  // Removes all VB* events, removes virtualBrowser data and config, but leaves the DOM otherwise intact.


  TODO/ideas:
    * Consider rewriting $.injectBaseHrefToHtml() to use DOM-based methods instead of those crazy RegExps. (See below.)
    * Consider adding history buffer 'back' (and 'forward'?) methods
        * and an off-by-default 'storeDomWithHistory' option that would store the previous DOM states as-is (with events, data and all) in the history buffer.
        * and 'request' method to retrieve requests from a history buffer.
    * Consider adding 'reload' sugar method (Already possible via performing 'load' on the VBdata.lastRequest object).

*/

(function($, undefined){

  // make all relative URLs explicitly Absolute - based on a base URL
  // FIXME: fork the code and use pure DOM methods in modern browsers
  $.injectBaseHrefToHtml = function (html, url) {
      // WARNING: horrendous RegExp based HTML parsing follows...
      // Needed for IE6-8 since the HTML to DOM conversion mangles the relative URLs...
      // (i.e. link.attr('href') reports a "resolved" URL - rather than the raw attribute value)

      // Example: url == 'http://foo.com/path/file?bar=1#anchor'
      var fileUrl = url.split('#')[0],                                      // 'http://foo.com/path/file?bar=1'
          filePart = fileUrl[_replace](/([^?]*\/)?(.*)/, '$2'),              // file?bar=1
          pathPrefix = fileUrl.split('?')[0][_replace](/(.*\/)?.*/, '$1');  // 'http://foo.com/path/'

      html =  html
                  [_replace](/(<[^>]+ (href|src|action)=["'])(["'#])/gi, '$1'+filePart+'$3') // prepend all empty/withinpage urls with filePart
                  [_replace](/(<[^>]+ (href|src|action)=["'])\?/gi, '$1'+filePart.split('?')[0]+'?') // prepend all samepage querystring URLs ("?baz=1") with just the filename
                  [_replace](/(["'])([a-z]{3,12}:)/gi, '$1`<<`>>$2') // Escape all protocol names (potential URLs) for easy, cross-browser RegExp detection
                  [_replace](/(<[^>]+ (href|src|action)=["'])([^\/`])/gi, '$1'+pathPrefix+'$3') // prepend pathPrefix to all relative URLs (not starting with `/`, `//`, ` ({protocol}:)
                  [_replace](/\`<<`>>/g, ''); // Unescape "protocol" back to normal
      return html;
    };


  // Utility method to turn `$.get`/`$.ajax` xhr.responseText HTML document source
  // into a DOM tree, wrapped in a `<div/>` element for easy `.find()`ing
  // ...stripping out all nasty `<script>`s and such things.
  $.getResultBody = $.getResultBody || function (responseText, cfg) {
      var me = $.getResultBody;
      cfg = cfg || {};
      //return $('<body/>').append( // <-- this seems to cause crashes in IE8. (Note: Crash doesn't seem to happen on first run)
      return $('<div/>').append(
                  $(responseText||[])
                      .not( cfg.stripFlat || me.stripFlat || 'script,title,meta,link,style' )
                          .find( cfg.stripDeep || me.stripDeep || 'script,style' )
                              .remove()
                          .end()
                );
    };

  var _docLoc            = document.location,
      _isDefaultPrevented = 'isDefaultPrevented',  // ...to save bandwidth
      _preventDefault     = 'preventDefault',      // ...to save bandwidth
      _stopPropagation    = 'stopPropagation',     // ...to save bandwidth
      _passThrough        = 'passThrough',         // ...to save bandwidth
      _virtualBrowser     = 'virtualBrowser',      // ...to save bandwidth
      _VBbeforeload       = 'VBbeforeload',        // ...to save bandwidth
      _VBload             = 'VBload',              // ...to save bandwidth
      _VBerror            = 'VBerror',             // ...to save bandwidth
      _VBloaded           = 'VBloaded',            // ...to save bandwidth
      _VBdisengaged       = 'VBdisengaged',        // ...to save bandwidth
      _replace            = 'replace',             // ...to save bandwidth
      _resultDOM          = 'resultDOM',           // ...to save bandwidth
      _result             = 'result',              // ...to save bandwidth
      _protocolSlash      = /^(https?:)?\/\//,



      _methods = {

          'load': function (arg, _privateOpts) {
              var request = {},
                  elm,
                  url,
                  body = $(this),
                  VBdata = body.data(_virtualBrowser),
                  config = VBdata.cfg,
                  evBeforeload = $.Event(_VBbeforeload),
                  evLoad, evLoaded,
                  applyLoadMsg;

              if ( $.isPlainObject(arg) )
              {
                $.extend( request, arg );
                url = request.url;
                delete request.elm; // incoming request objects don't get to have an elm - it only confuses things.
              }
              else if ( typeof arg == 'string' )
              {
                url = arg;
              }
              else
              {
                elm = $(arg);
                request.elm = elm;
                url = elm.attr('href');
                url = url === undefined ? elm.attr('action') : url;
              }
              // Correctly resolve relative empty-string URLs (like <form action="">)
              url = request.url = (url === '') ? _docLoc.href : url;

              if ( VBdata.$$empty )
              {
                request.isFirst = true;
                delete VBdata.$$empty;
              }

              if (url)
              {
                evBeforeload[_stopPropagation]();
                if ( VBdata._clicked ) {
                  request.btn = VBdata._clicked; // store reference to the clicked button - to allow access/evaulation by event handlers.
                }
                body.trigger(evBeforeload, [request]);
                // trap external (non-AJAXable) URLs or links targeted at another window and set .passThrough as true
                if (  // if passThrough is already set, then there's not need for further checks, and...
                      !evBeforeload[_passThrough] &&
                      (
                        (
                          // if event handler hasn't explicitly set passThrough to false
                          evBeforeload[_passThrough] === undefined  &&
                          // and elm is defined, and is `target`ted at an external window
                          // (IDEA: allow named virtualBrowsers to target and trigger 'open' actions on eachother)
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
                evBeforeload[_passThrough]  &&  evBeforeload[_preventDefault]();

                if ( !evBeforeload[_isDefaultPrevented]() )
                {
                  var noCache = request.noCache =  request.noCache !== undefined ? request.noCache : config.noCache,
                      params = config.params ? [config.params] : [],
                      method;
                  
                  if ( elm && elm.is('form') )
                  {
                    method = elm.attr('method');
                    params.push( elm.serialize() );
                    var clicked = VBdata._clicked;
                    if ( clicked )
                    {
                      var clickedElm = clicked.elm;
                      if ( clickedElm.is(':image') )
                      {
                        var name = clickedElm[0].name;
                        params.push( name+'.x='+ Math.round(clicked.X) );
                        params.push( name+'.y='+ Math.round(clicked.Y) );
                      }
                      else
                      {
                        params.push( $.param( clickedElm ) );
                      }
                      delete VBdata._clicked
                    }
                    // raise a flag if we need to submit via an iframe...
                    var mp = 'multipart/form-data';
                    evBeforeload._doIframeSubmit =  elm.attr('enctype') == mp  ||  elm.attr('encoding') == mp  ||  !!elm.find('input:file')[0];
                  }
                  if ( request.params )
                  {
                    params.push(
                        (typeof request.params == 'string') ?
                            request.params:
                            $.param(request.params||{})
                      );
                  }
                  params = request.params =  params.join('&');
                  method = request.method =  request.method || method || 'GET';

                  body.addClass(config.loadingClass);
                  if ( config.loadmsgElm )
                  {
                    // timeout is required because on `evBeforeload._doIframeSubmit` we pass the submit event through
                    // ...and in those cases, instantly `.empty()`ing the body is a bad idea. :-)
                    applyLoadMsg = setTimeout(function(){
                        config.loadmsgMode == 'replace'  &&  body.empty();
                        body.append(config.loadmsgElm);
                      }, 0);
                  }

                  var ajaxOptions = {
                          url: request.url.split('#')[0],  // just to be safe :)
                          data: params,
                          type: method,
                          cache: !noCache,
                          complete: function (xhr, status) {
                              if (!xhr) { return } // on error with jQuery 1.4, IE<=8 will sometimes run the complete callback twice - with xhr undefined the second time.
                              clearTimeout(applyLoadMsg); // prevent race-conditions between loadMsgElm injection thread, and the ajax loader.
                              body.removeClass(config.loadingClass||'');
                              request.xhr = xhr; 
                              request.status = status || 'error';
                              var isError = !status || status == 'error';
                              if ( isError )
                              {
                                body.trigger(_VBerror, [request]);
                              }
                              else
                              {
                                request[_result] = $.injectBaseHrefToHtml(xhr.responseText||'', request.url);
                              }
                              // We intentionally allow VBerror handlers to set custom .result string and then process it normally.
                              if ( request[_result]  &&  config.selector )
                              {
                                request[_resultDOM] = $.getResultBody( request[_result], config.stripCfg ).find( config.selector );
                              }
                              // allow VBerror handlers to set custom .resultDOM and then process it normally.
                              if ( !isError  ||  request[_result]  ||  request[_resultDOM] )
                              {
                                evLoad = $.Event(_VBload);
                                evLoad[_stopPropagation]();
                                body.trigger(evLoad, [request]);
                                if ( !evLoad[_isDefaultPrevented]() )
                                {
                                  evLoaded = $.Event(_VBloaded);
                                  evLoaded[_stopPropagation]();
                                  config.loadmsgElm  &&  config.loadmsgElm.detach();
                                  // default to just dumping resultBody's `.contents()` into the DOM.
                                  request[_resultDOM] = request[_resultDOM]  ||  $.getResultBody( request[_result], config.stripCfg ).contents();
                                  body
                                      .empty()
                                      .append( request[_resultDOM] );
                                  VBdata.lastRequest = request;
                                  body
                                      .trigger(evLoaded, [request])
                                      // NOTE: We can't rely on bubbling in IE8- because bubbling happens first on the container elements,
                                      // and last on the form itself. (at least in jQuery 1.4 and 1.5)
                                      // This makes .isDefaultPrevented() checks fail when plugin-users bind (and .preventDefault())
                                      // submit events on contained forms directly.
                                      .find('form')
                                          .data(_virtualBrowser, body)
                                          .bind('submit', _handleHttpRequest);
                                  // Throw out unneccessary properties that we don't want to store. (Saves memory among other things.)
                                  delete request[_resultDOM];
                                  delete request[_result];
                                }
                              }
                              delete request.xhr;
                              if ( config.disengage )
                              {
                                body[_virtualBrowser]('disengage');
                              }
                            }
                          };

                  if ( evBeforeload._doIframeSubmit )
                  {
                    // perform a fake XHR request by temporarily injecting an iframe;
                    var iframeName = 'if'+ (new Date).getTime(),
                        // javascript:""; seems to be the safest bet for HTTP and HTTPS pages.
                        // See here: http://www.zachleat.com/web/adventures-in-i-frame-shims-or-how-i-learned-to-love-the-bomb/
                        iframe =  $('<iframe name="'+ iframeName +'" src=\'javascript:"";\' style="position:absolute;top:-999em;left:-999em;visibility:hidden;" />')
                                      .appendTo( 'body' ),
                        oldAction = elm.attr('action') || '',
                        oldTarget = elm.attr('target') || '';
                    elm.attr('target', iframeName);
                    if ( config.params )
                    {
                      elm.attr('action',
                          oldAction + (/\?/.test(oldAction)?'&':'?') + config.params
                        );
                    }
                    iframe.bind('load', function () {
                        var status = 'success'; // this is kind of meaningless... the iframe might very well contain a 404 or whatever...
                        ajaxOptions.complete({
                            fakeXHR:      'iframe',
                            responseText: '<html>'+iframe.contents().find('html').html()+'</html>'
                          }, status);
                        elm.attr({
                            target: oldTarget,
                            action: oldAction
                          });
                          
                        // timeout allows the "loading" thread to finish.
                        // (Otherwise tab-loading indicator keeps spinning idefinitely (in Firefox at least).)
                        setTimeout(function(){ iframe.remove(); }, 0);
                      });
                    if ( !_privateOpts || !_privateOpts._nativeEvent )
                    {
                      elm.trigger('submit', ['VBiframeHack']);
                    }
                  }
                  else
                  {
                    $.ajax(ajaxOptions);
                  }
                }
              }
              return evBeforeload;
            },


          'data': function () {
              return $(this).data(_virtualBrowser);
            },

          'disengage': function () {
              var body = $(this);
              body
                  .removeData( _virtualBrowser )
                  .unbind( 'click', _handleHttpRequest)
                  .find('form')
                      .removeData(_virtualBrowser)
                      .unbind( 'click', _handleHttpRequest)
                  .end()
                  .unbind( [_VBbeforeload,_VBerror,_VBload,_VBloaded].join(' ') )
                  .trigger( _VBdisengaged )
                  .unbind( _VBdisengaged );
            }

        },




      _handleHttpRequest = function (e) {
          var isSubmit = (e.type == 'submit'),
              elm = isSubmit ?
                        $(this):
                        $(e.target).closest('[href], input:submit, button:submit, input:image'),
              vbElm = isSubmit ?
                        elm.data(_virtualBrowser):
                        this;
          if (elm[0])
          {
            if ( !e[_isDefaultPrevented]() )
            {
              if ( elm.is('input, button') ) // click on a submit button - 
              {
                if ( !elm[0].disabled )
                {
                  // make note of which submit button was clicked.
                  var VBdata = $(vbElm).data(_virtualBrowser);
                  if ( elm.is(':image') )
                  {
                    var offs = elm.offset();
                    VBdata._clicked = {
                        elm: elm,
                        X:   e.pageX - offs.left,
                        Y:   e.pageY - offs.top
                      };
                  }
                  else if ( elm.is('[name]') )
                  {
                    VBdata._clicked = { elm: elm };
                  }
                  // in case the 'submit' event on the form gets cancelled we need to guarantee that this value gets removed.
                  // A timeout should (theoretically at least) accomplish that.
                  VBdata._clicked  &&  setTimeout(function(){ delete VBdata._clicked; }, 0);
                }
              }
              else // normal link-click or submit event
              {
                var bfloadEv = _methods['load'].call(vbElm, elm, {_nativeEvent:true});
                if ( !bfloadEv[_passThrough] )
                {
                  !bfloadEv._doIframeSubmit  &&  e[_preventDefault]();
                  bfloadEv.isPropagationStopped()  &&  e[_stopPropagation]();
                }
              }
            }
          }
        },



      fnVB = $.fn[_virtualBrowser] = function (config, args) {
          var bodies = this,
              confIsString = typeof config == 'string';
          if (confIsString)
          {
            var method = _methods[config],
                retValue;
            if ( method )
            {
              bodies.each(function(i){
                  var methodRet = method.apply( this, [].concat(args) );  // Normalize `args` into an array. ([].concat() does that :-)
                  if (!i) { retValue = methodRet; }
                });
            }
            if ( retValue !== undefined )
            {
              return retValue;
            }
          }
          else
          {
            bodies
                .each(function () {
                    var body = $(this),
                        cfg = $.extend({}, fnVB.defaults, config);
                    $.each(['Beforeload','Error','Load','Loaded','Disengaged'], function (onType, type) {
                        onType = 'on'+type;
                        cfg[onType]  &&  bodies.bind( 'VB'+type.toLowerCase(), cfg[onType] );
                        delete cfg[onType];
                      });
                    cfg.params = (typeof cfg.params == 'string') ?
                                        cfg.params:
                                        $.param(cfg.params||{});
                    args && (cfg.url = args);

                    if ( cfg.loadmsgMode != 'none' )
                    {
                      var loadmsgElm = cfg.loadmsgElm || '<div class="loading" />',
                          // Automatically sniff the document language and choose a loading message accordingly - defaulting on English
                          loadmsg = (fnVB.i18n[body.closest('*[lang]').attr('lang')] || {}).loading || fnVB.i18n.en.loading;

                      if (loadmsgElm.charAt)
                      {
                        loadmsgElm = loadmsgElm.replace(/%\{msg\}/g, loadmsg);
                      }
                      loadmsgElm = cfg.loadmsgElm = $(loadmsgElm);
                      if ( !loadmsgElm.text() )
                      {
                        loadmsgElm.append(loadmsg);
                      }
                    }
                    else
                    {
                      delete cfg.loadmsgElm;
                    }
                    body.data(_virtualBrowser, { cfg: cfg, $$empty:1 });
                    body
                        // Depend on 'click' events bubbling up to the virtualBrowser element to allow event-delegation
                        // Thus, we assume that any clicks who's bubbling were cancelled should not be handled by virtualBrowser.
                        .bind( 'click', _handleHttpRequest);

                    if ( cfg.url )
                    {
                      body[_virtualBrowser]('load', cfg.url);
                    }
                    else
                    {
                      // NOTE: We can't rely on bubbling in IE8- because bubbling happens first on the container elements,
                      // and last on the form itself. (at least in jQuery 1.4 and 1.5)
                      // This makes .isDefaultPrevented() checks fail when plugin-users bind (and .preventDefault())
                      // submit events on contained forms directly.
                      body.find( 'form' )
                          .add( body.filter('form') ) // allow body itself to be a <form>
                              .data(_virtualBrowser, body)
                              .bind( 'submit', _handleHttpRequest);
                    }
                  })

          }
          return this;
        };


  fnVB.defaults = {
      //url:          null,                     // String: Initial URL for the frame
      //noCache:      false,                    // Boolean: Controls the $.ajax() cache option
      //params:       null,                     // Object/String: Persistent request data (as in $.get(url, data, callback) ) that gets added to *every* 'load' request.
      //stripCfg:     null,                     // Object: config for the $.getResultsBody() method
      //selector:     '>*',                     // String selector to quickly filter the incoming DOM before injecting it into the virtualBrowser container/body
      //onBeforeload: null,                     // Function: Shorthand for .bind('VBbeforeload' handler);
      //onLoad:       null,                     // Function: Shorthand for .bind('VBload' handler);
      //onLoaded:     null,                     // Function: Shorthand for .bind('VBloaded' handler);
      //onDisengaged: null,                     // Function: Shorthand for .bind('VBdisengaged' handler);
      //loadingClass: null,                     // String: className to apply to the virtualBrowser body element during loading
      //loadmsgElm:  '<div class="loading" />', // String/Element: Template for a loading message displayed while loading a URL
      loadmsgMode:    'none'                    // String: available: "none", "overlay" & "replace"
      //disengage:    false,                    // Boolean: Sugar method. True triggers the 'disengage' method as soon as the next VBloaded has finished.
    };

  fnVB.i18n = {
      // FIXME: add more translations...
      en: { loading: 'Loading...' },
      is: { loading: 'Sæki gögn...' }
    }

})(jQuery);
