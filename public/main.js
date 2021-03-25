!function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function l(t){t.forEach(e)}function o(t){return"function"==typeof t}function a(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function r(t,e){t.appendChild(e)}function u(t,e,n){t.insertBefore(e,n||null)}function c(t){t.parentNode.removeChild(t)}function i(t){return document.createElement(t)}function s(){return t=" ",document.createTextNode(t);var t}function f(t,e,n,l){return t.addEventListener(e,n,l),()=>t.removeEventListener(e,n,l)}function d(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function m(t,e){t.value=null==e?"":e}let p;function h(t){p=t}const v=[],g=[],$=[],b=[],y=Promise.resolve();let _=!1;function j(t){$.push(t)}let x=!1;const z=new Set;function E(){if(!x){x=!0;do{for(let t=0;t<v.length;t+=1){const e=v[t];h(e),w(e.$$)}for(h(null),v.length=0;g.length;)g.pop()();for(let t=0;t<$.length;t+=1){const e=$[t];z.has(e)||(z.add(e),e())}$.length=0}while(v.length);for(;b.length;)b.pop()();_=!1,x=!1,z.clear()}}function w(t){if(null!==t.fragment){t.update(),l(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(j)}}const k=new Set;function O(t,e){-1===t.$$.dirty[0]&&(v.push(t),_||(_=!0,y.then(E)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function A(a,r,u,i,s,f,d=[-1]){const m=p;h(a);const v=a.$$={fragment:null,ctx:null,props:f,update:t,not_equal:s,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(m?m.$$.context:[]),callbacks:n(),dirty:d,skip_bound:!1};let g=!1;if(v.ctx=u?u(a,r.props||{},((t,e,...n)=>{const l=n.length?n[0]:e;return v.ctx&&s(v.ctx[t],v.ctx[t]=l)&&(!v.skip_bound&&v.bound[t]&&v.bound[t](l),g&&O(a,t)),e})):[],v.update(),g=!0,l(v.before_update),v.fragment=!!i&&i(v.ctx),r.target){if(r.hydrate){const t=function(t){return Array.from(t.childNodes)}(r.target);v.fragment&&v.fragment.l(t),t.forEach(c)}else v.fragment&&v.fragment.c();r.intro&&(($=a.$$.fragment)&&$.i&&(k.delete($),$.i(b))),function(t,n,a,r){const{fragment:u,on_mount:c,on_destroy:i,after_update:s}=t.$$;u&&u.m(n,a),r||j((()=>{const n=c.map(e).filter(o);i?i.push(...n):l(n),t.$$.on_mount=[]})),s.forEach(j)}(a,r.target,r.anchor,r.customElement),E()}var $,b;h(m)}function D(t,e,n){const l=t.slice();return l[5]=e[n],l[6]=e,l[7]=n,l}function C(t){let e,n,o,a,p,h,v;function g(){t[2].call(o,t[6],t[7])}function $(){t[3].call(p,t[6],t[7])}return{c(){e=i("fieldset"),n=i("legend"),o=i("input"),a=s(),p=i("input"),d(o,"type","text"),d(o,"class","svelte-5jlzt5"),d(n,"class","svelte-5jlzt5"),d(p,"type","text"),d(p,"class","svelte-5jlzt5"),d(e,"class","svelte-5jlzt5")},m(l,c){u(l,e,c),r(e,n),r(n,o),m(o,t[5].name),r(e,a),r(e,p),m(p,t[5].value),h||(v=[f(o,"input",g),f(p,"input",$)],h=!0)},p(e,n){t=e,1&n&&o.value!==t[5].name&&m(o,t[5].name),1&n&&p.value!==t[5].value&&m(p,t[5].value)},d(t){t&&c(e),h=!1,l(v)}}}function L(e){let n,l,o,a,p,h,v,g,$,b,y,_,j,x=[...e[0]],z=[];for(let t=0;t<x.length;t+=1)z[t]=C(D(e,x,t));return{c(){n=i("main"),l=i("div"),o=i("div");for(let t=0;t<z.length;t+=1)z[t].c();a=s(),p=i("p"),p.innerHTML='<input type="button" value="追加"/>',h=s(),v=i("div"),g=i("textarea"),$=s(),b=i("div"),y=i("textarea"),d(p,"class","add-button svelte-5jlzt5"),d(o,"class","input-variables-area svelte-5jlzt5"),d(g,"class","svelte-5jlzt5"),d(v,"class","input-template-area svelte-5jlzt5"),d(l,"class","input-area svelte-5jlzt5"),y.readOnly=!0,y.value=e[1],d(y,"class","svelte-5jlzt5"),d(b,"class","output-area svelte-5jlzt5"),d(n,"class","svelte-5jlzt5")},m(t,c){u(t,n,c),r(n,l),r(l,o);for(let t=0;t<z.length;t+=1)z[t].m(o,null);r(o,a),r(o,p),r(l,h),r(l,v),r(v,g),m(g,e[1]),r(n,$),r(n,b),r(b,y),_||(j=f(g,"input",e[4]),_=!0)},p(t,[e]){if(1&e){let n;for(x=[...t[0]],n=0;n<x.length;n+=1){const l=D(t,x,n);z[n]?z[n].p(l,e):(z[n]=C(l),z[n].c(),z[n].m(o,a))}for(;n<z.length;n+=1)z[n].d(1);z.length=x.length}2&e&&m(g,t[1]),2&e&&(y.value=t[1])},i:t,o:t,d(t){t&&c(n),function(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}(z,t),_=!1,j()}}}function N(t,e,n){const l=[{name:"title",value:"ゲト博士"},{name:"せつめい",value:"ドフェチいモフモフキャラだよ♥"}];let o='<!DOCTYPE html>\n<html lang="ja">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width,initial-scale=1">\n    <title>{{ title }}</title>\n  </head>\n  <body>\n    <main>{{ せつめい }}</main>\n  </body>\n</html>';return[l,o,function(t,e){t[e].name=this.value,n(0,l)},function(t,e){t[e].value=this.value,n(0,l)},function(){o=this.value,n(1,o)}]}!function(t,e){var n;const{target:l}=e,o=(null!==(n=l.ownerDocument)&&void 0!==n?n:l instanceof Document?l:document).createDocumentFragment(),a=new t(Object.assign(e,{target:o}));l.replaceWith(o)}(class extends class{$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(l(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}{constructor(t){super(),A(this,t,N,L,a,{})}},{target:document.getElementById("main")})}();
//# sourceMappingURL=main.js.map
