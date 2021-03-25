!function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function l(t){return"function"==typeof t}function a(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function r(t,e){t.appendChild(e)}function c(t,e,n){t.insertBefore(e,n||null)}function u(t){t.parentNode.removeChild(t)}function i(t){return document.createElement(t)}function s(){return t=" ",document.createTextNode(t);var t}function f(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function d(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function m(t,e){t.value=null==e?"":e}let g;function h(t){g=t}const p=[],v=[],y=[],$=[],x=Promise.resolve();let b=!1;function k(t){y.push(t)}let _=!1;const E=new Set;function w(){if(!_){_=!0;do{for(let t=0;t<p.length;t+=1){const e=p[t];h(e),O(e.$$)}for(h(null),p.length=0;v.length;)v.pop()();for(let t=0;t<y.length;t+=1){const e=y[t];E.has(e)||(E.add(e),e())}y.length=0}while(p.length);for(;$.length;)$.pop()();b=!1,_=!1,E.clear()}}function O(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(k)}}const j=new Set;function A(t,e){-1===t.$$.dirty[0]&&(p.push(t),b||(b=!0,x.then(w)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function D(a,r,c,i,s,f,d=[-1]){const m=g;h(a);const p=a.$$={fragment:null,ctx:null,props:f,update:t,not_equal:s,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(m?m.$$.context:[]),callbacks:n(),dirty:d,skip_bound:!1};let v=!1;if(p.ctx=c?c(a,r.props||{},((t,e,...n)=>{const o=n.length?n[0]:e;return p.ctx&&s(p.ctx[t],p.ctx[t]=o)&&(!p.skip_bound&&p.bound[t]&&p.bound[t](o),v&&A(a,t)),e})):[],p.update(),v=!0,o(p.before_update),p.fragment=!!i&&i(p.ctx),r.target){if(r.hydrate){const t=function(t){return Array.from(t.childNodes)}(r.target);p.fragment&&p.fragment.l(t),t.forEach(u)}else p.fragment&&p.fragment.c();r.intro&&((y=a.$$.fragment)&&y.i&&(j.delete(y),y.i($))),function(t,n,a,r){const{fragment:c,on_mount:u,on_destroy:i,after_update:s}=t.$$;c&&c.m(n,a),r||k((()=>{const n=u.map(e).filter(l);i?i.push(...n):o(n),t.$$.on_mount=[]})),s.forEach(k)}(a,r.target,r.anchor,r.customElement),w()}var y,$;h(m)}function C(t,e,n){const o=t.slice();return o[5]=e[n],o[6]=e,o[7]=n,o}function L(t){let e,n,l,a,g,h,p;function v(){t[2].call(l,t[6],t[7])}function y(){t[3].call(g,t[6],t[7])}return{c(){e=i("fieldset"),n=i("legend"),l=i("input"),a=s(),g=i("textarea"),d(l,"type","text"),d(l,"class","svelte-kyx2gf"),d(n,"class","svelte-kyx2gf"),d(g,"class","svelte-kyx2gf"),d(e,"class","svelte-kyx2gf")},m(o,u){c(o,e,u),r(e,n),r(n,l),m(l,t[5].name),r(e,a),r(e,g),m(g,t[5].value),h||(p=[f(l,"input",v),f(g,"input",y)],h=!0)},p(e,n){t=e,1&n&&l.value!==t[5].name&&m(l,t[5].name),1&n&&m(g,t[5].value)},d(t){t&&u(e),h=!1,o(p)}}}function N(e){let n,o,l,a,g,h,p,v,y,$,x,b,k,_=e[0],E=[];for(let t=0;t<_.length;t+=1)E[t]=L(C(e,_,t));return{c(){n=i("main"),o=i("div"),l=i("div");for(let t=0;t<E.length;t+=1)E[t].c();a=s(),g=i("p"),g.innerHTML='<input type="button" value="追加"/>',h=s(),p=i("div"),v=i("textarea"),y=s(),$=i("div"),x=i("textarea"),d(g,"class","add-button svelte-kyx2gf"),d(l,"class","input-variables-area svelte-kyx2gf"),d(v,"class","svelte-kyx2gf"),d(p,"class","input-template-area svelte-kyx2gf"),d(o,"class","input-area svelte-kyx2gf"),x.readOnly=!0,x.value=e[1],d(x,"class","svelte-kyx2gf"),d($,"class","output-area svelte-kyx2gf"),d(n,"class","svelte-kyx2gf")},m(t,u){c(t,n,u),r(n,o),r(o,l);for(let t=0;t<E.length;t+=1)E[t].m(l,null);r(l,a),r(l,g),r(o,h),r(o,p),r(p,v),m(v,e[1]),r(n,y),r(n,$),r($,x),b||(k=f(v,"input",e[4]),b=!0)},p(t,[e]){if(1&e){let n;for(_=t[0],n=0;n<_.length;n+=1){const o=C(t,_,n);E[n]?E[n].p(o,e):(E[n]=L(o),E[n].c(),E[n].m(l,a))}for(;n<E.length;n+=1)E[n].d(1);E.length=_.length}2&e&&m(v,t[1]),2&e&&(x.value=t[1])},i:t,o:t,d(t){t&&u(n),function(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}(E,t),b=!1,k()}}}function T(t,e,n){const o=[{name:"title",value:"ゲト博士"},{name:"せつめい",value:"ドフェチいモフモフキャラだよ♥"}];let l='<!DOCTYPE html>\n<html lang="ja">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width,initial-scale=1">\n    <title>{{ title }}</title>\n  </head>\n  <body>\n    <main>{{ せつめい }}</main>\n  </body>\n</html>';return[o,l,function(t,e){t[e].name=this.value,n(0,o)},function(t,e){t[e].value=this.value,n(0,o)},function(){l=this.value,n(1,l)}]}class B extends class{$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}{constructor(t){super(),D(this,t,T,N,a,{})}}const M=document.getElementById("main");M&&function(t,e){var n;const{target:o}=e,l=(null!==(n=o.ownerDocument)&&void 0!==n?n:o instanceof Document?o:document).createDocumentFragment(),a=new t(Object.assign(e,{target:l}));o.replaceWith(l)}(B,{target:M})}();
//# sourceMappingURL=main.js.map
