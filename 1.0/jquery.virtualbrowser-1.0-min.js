// encoding: utf-8
(function(c,t){c.fn.detach=c.fn.detach||function(){return this.each(function(){var a=this.parentNode;a&&a.nodeType==1&&a.removeChild(this)})};var h='virtualBrowser',n='VBbeforeload',o='VBload',p={'load':function(e){var b=typeof e!='string'?c(e):t,d=c(this),i=d.data(h).cfg,j=jQuery.Event(n),q=i.loadmsgMode,f={elm:b};f.url=b?(b.attr('href')||b.attr('action')||''):e;if(f.url){d.trigger(j,f);j.passThrough&&j.preventDefault();if(!j.isDefaultPrevented()){if(q&&q!='none'){i.loadmsgMode=='replace'&&d.empty();d.append(i.loadmsgElm)}var m=i.params,r;if(b&&b.is('form')){m=b.serialize()+'&'+m;r=b.attr('method')||'GET'}c.ajax({url:f.url,data:m,type:r,complete:function(a){var g=f.url.split('#')[0],k=g.split('?')[0].replace(/(.*\/).*/,'$1');f.result=a.responseText.replace(/(<[^>]+ (href|src|action)=["'])(["'\?#])/gi,'$1'+g+'$3').replace(/http:\/\//gi,'^').replace(/https:\/\//gi,'`').replace(/(<[^>]+ (href|src|action)=["'])([^\/`\^])/gi,'$1'+k+'$3').replace(/\^/g,'http://').replace(/`/g,'https://');var l=jQuery.Event(o);d.trigger(l,f);if(!l.isDefaultPrevented()){i.loadmsgElm.detach();d.empty().append(f.resultDOM||c(f.result.replace(/<script[ >][\s\S]*?<\/script>/gi,''))).find('form').data(h+'Elm',d).bind('submit',s)}}})}}return j}},s=function(a){var g=a.type=='submit'?a.target:c(a.target).closest('[href]')[0];if(g){var k=c(this).data(h+'Elm')||this;bfloadEv=p['load'].call(k,g);bfloadEv.isPropagationStopped()&&a.stopPropagation();!bfloadEv.passThrough&&a.preventDefault()}};fnVB=c.fn[h]=function(a,g){var k=typeof a=='string';if(k){var l=p[a];l&&this.each(function(){l.apply(this,[].concat(g))})}else{a=c.extend({loadmsgMode:'none'},a||{});g&&(a.url=g);var e=c(this),b=a.loadmsgElm||'<div class="loading" />',d=(fnVB.i18n[e.closest('[lang]').attr('lang')]||{}).loading||fnVB.i18n.en.loading;if(b.charAt){b=b.replace(/%\{msg\}/g,d)}b=a.loadmsgElm=c(b);if(!b.text()){b.append(d)}e.data(h,{cfg:a}).bind('click',s);a.onLoad&&e.bind(o,a.onLoad);a.onBeforeload&&e.bind(n,a.onBeforeload);a.params=typeof a.params=='string'?a.params:c.param(a.params||{});a.url&&e[h]('load',a.url)}return this};fnVB.i18n={en:{loading:'Loading...'},is:{loading:'Sæki gögn...'}}})(jQuery);
