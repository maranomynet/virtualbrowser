// encoding: utf-8
// $.fn.virtualBrowser 1.1  -- (c) 2010 Hugsmiðjan ehf. 
(function(b,n){b.injectBaseHrefToHtml=function(a,g){var c=g.split('#')[0],d=c[i](/([^?]*\/)?(.*)/,'$2'),f=c.split('?')[0][i](/(.*\/)?.*/,'$1');a=a[i](/(<[^>]+ (href|src|action)=["'])(["'#])/gi,'$1'+d+'$3')[i](/(<[^>]+ (href|src|action)=["'])\?/gi,'$1'+d.split('?')[0]+'?')[i](/(["'])([a-z]{3,12}:)/gi,'$1`<<`>>$2')[i](/(<[^>]+ (href|src|action)=["'])([^\/`])/gi,'$1'+f+'$3')[i](/\`<<`>>/g,'');return a};b.getResultBody=function(a){return b('<div/>').append(b(a||[]).not('script,title,meta,link,style').find('script,style').remove().end())};var v=document.location,s='isDefaultPrevented',o='stopPropagation',m='passThrough',l='virtualBrowser',w='VBbeforeload',x='VBload',y='VBloaded',i='replace',z=/^(https?:)?\/\//,A={'load':function(c){var d=typeof c!='string'?b(c):n,f=b(this),h=f.data(l),j=h.cfg,k=b.Event(w),p,t,B=j.loadmsgMode,e={elm:d};if(d){c=d.attr('href');c=c===n?d.attr('action'):c}c=e.url=c===''?v.href:c;if(c){k[o]();f.trigger(k,e);if(!k[m]&&((k[m]===n&&d&&d[0].target&&d[0].target!=window.name)||(/^([a-z]{3,12}:|\/\/)/i.test(c)&&!c.toLowerCase()[i](z,'').indexOf(v.href.toLowerCase()[i](z,'').split('/')[0])==0))){k[m]=true}k[m]&&k.preventDefault();if(!k[s]()){var D=e.noCache=e.noCache!==n?e.noCache:j.noCache,q=j.params||'',r='GET';if(d&&d.is('form')){r=d.attr('method')||r;q+='&'+d.serialize();var C=h._0;if(C){q+='&'+b.param(C);delete h._0}}e.params=q;e.method=r;b.ajax({url:e.url.split('#')[0],data:q,type:r,cache:!D,complete:function(a,g){e.result=b.injectBaseHrefToHtml(a.responseText,e.url);e.xhr=a;e.status=g;p=b.Event(x);p[o]();f.trigger(p,e);if(!p[s]()){t=b.Event(y);t[o]();j.loadmsgElm.detach();f.empty().append(e.resultDOM||b.getResultBody(e.result).contents());delete e.resultDOM;delete e.result;delete e.xhr;h.lastRequest=e;f.trigger(t,e)}}});if(B&&B!='none'){j.loadmsgMode=='replace'&&f.empty();f.append(j.loadmsgElm)}}}return k},'data':function(){return b(this).data(l)}},E=function(a){var g=b(a.target).closest(a.type=='click'?'[href], input:submit, button:submit':'form');if(g[0]){if(!a[s]()){if(!g.is(':submit')){var c=A['load'].call(this,g);c.isPropagationStopped()&&a[o]();!c[m]&&a.preventDefault()}else if(g.is('[name]')){var d=b(this).data(l);d._0=g;setTimeout(function(){delete d._0},0)}}}},u=b.fn[l]=function(a,g){var c=typeof a=='string';if(c){var d=A[a];d&&this.each(function(){d.apply(this,[].concat(g))})}else{a=b.extend({loadmsgMode:'none'},a||{});g&&(a.url=g);var f=this,h=a.loadmsgElm||'<div class="loading" />',j=(u.i18n[f.closest('*[lang]').attr('lang')]||{}).loading||u.i18n.en.loading;if(h.charAt){h=h.replace(/%\{msg\}/g,j)}h=a.loadmsgElm=b(h);if(!h.text()){h.append(j)}f.data(l,{cfg:a}).bind('click submit',E);a.onLoad&&f.bind(x,a.onLoad);a.onLoaded&&f.bind(y,a.onLoaded);a.onBeforeload&&f.bind(w,a.onBeforeload);a.params=typeof a.params=='string'?a.params:b.param(a.params||{});a.url&&f[l]('load',a.url)}return this};u.i18n={en:{loading:'Loading...'},is:{loading:'Sæki gögn...'}}})(jQuery);
