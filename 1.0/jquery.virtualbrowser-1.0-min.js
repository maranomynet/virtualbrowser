// encoding: utf-8
(function(d,r){d.fn.detach=d.fn.detach||function(){return this.each(function(){var a=this.parentNode;a&&a.nodeType==1&&a.removeChild(this)})};var k='virtualBrowser',s='VBbeforeload',t='VBload',u='VBloaded',c='replace',v=/^(https?:)?\/\//,w={'load':function(l){var e=typeof l!='string'?d(l):r,h=d(this),m=h.data(k).cfg,j=jQuery.Event(s),x=m.loadmsgMode,f={elm:e};l=f.url=e?(e.attr('href')||e.attr('action')||''):l;if(l){h.trigger(j,f);if(!j.passThrough&&((j.passThrough===r&&e&&e[0].target&&e[0].target!=window.name)||(/^([a-z]{3,12}:|\/\/)/i.test(l)&&!l.toLowerCase()[c](v,'').indexOf(location.href.toLowerCase()[c](v,'').split('/')[0])==0))){j.passThrough=true}j.passThrough&&j.preventDefault();if(!j.isDefaultPrevented()){if(x&&x!='none'){m.loadmsgMode=='replace'&&h.empty();h.append(m.loadmsgElm)}var q=m.params,y;if(e&&e.is('form')){q=e.serialize()+'&'+q;y=e.attr('method')||'GET'}d.ajax({url:f.url,data:q,type:y,complete:function(a){var g=f.url.split('#')[0],n=g[c](/([^?]*\/)?(.*)/,'$2'),p=g.split('?')[0][c](/(.*\/)?.*/,'$1'),i=/\?/.test(g),b=a.responseText;i&&(b=b[c](/(['"])\?/gi,'$1¨<<`>>'));b=b[c](/(<[^>]+ (href|src|action)=["'])(["'#¨])/gi,'$1'+n+'$3');i&&(b=b[c](/(['"])¨<<`>>/gi,'$1?')[c](/¨<<`>>/gi,'&amp;'));b=b[c](/http:\/\//gi,'^<<`>>')[c](/https:\/\//gi,'`<<`>>')[c](/(<[^>]+ (href|src|action)=["'])([^\/`\^])/gi,'$1'+p+'$3')[c](/\^<<`>>/g,'http://')[c](/\^<<`>>/g,'http://')[c](/`<<`>>/g,'https://');f.result=b;var o=jQuery.Event(t);h.trigger(o,f);if(!o.isDefaultPrevented()){m.loadmsgElm.detach();h.empty().append(f.resultDOM||d.getResultBody(f.result)[0].childNodes).find('[href]').data(k+'Elm',h).bind('click',z).end().find('form').data(k+'Elm',h).bind('submit',z);h.trigger(u,{url:f.url,elm:f.elm})}}})}}return j}},z=function(a){if(!a.isDefaultPrevented()){var g=this,n=d(g).data(k+'Elm')||this;bfloadEv=w['load'].call(n,g);bfloadEv.isPropagationStopped()&&a.stopPropagation();!bfloadEv.passThrough&&a.preventDefault()}};fnVB=d.fn[k]=function(a,g){var n=typeof a=='string';if(n){var p=w[a];p&&this.each(function(){p.apply(this,[].concat(g))})}else{a=d.extend({loadmsgMode:'none'},a||{});g&&(a.url=g);var i=d(this),b=a.loadmsgElm||'<div class="loading" />',o=(fnVB.i18n[i.closest('[lang]').attr('lang')]||{}).loading||fnVB.i18n.en.loading;if(b.charAt){b=b.replace(/%\{msg\}/g,o)}b=a.loadmsgElm=d(b);if(!b.text()){b.append(o)}i.data(k,{cfg:a});a.onLoad&&i.bind(t,a.onLoad);a.onLoaded&&i.bind(u,a.onLoaded);a.onBeforeload&&i.bind(s,a.onBeforeload);a.params=typeof a.params=='string'?a.params:d.param(a.params||{});a.url&&i[k]('load',a.url)}return this};fnVB.i18n={en:{loading:'Loading...'},is:{loading:'Sæki gögn...'}}})(jQuery);
