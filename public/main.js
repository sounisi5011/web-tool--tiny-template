!function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function r(t){t.forEach(e)}function o(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function a(e){return e&&o(e.destroy)?e.destroy:t}function u(t,e){t.appendChild(e)}function l(t,e,n){t.insertBefore(e,n||null)}function c(t){t.parentNode.removeChild(t)}function s(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function f(){return d(" ")}function p(t,e,n,r){return t.addEventListener(e,n,r),()=>t.removeEventListener(e,n,r)}function h(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function g(t,e){t.value=null==e?"":e}let v;function m(t){v=t}function y(){const t=function(){if(!v)throw new Error("Function called outside component initialization");return v}();return(e,n)=>{const r=t.$$.callbacks[e];if(r){const o=function(t,e){const n=document.createEvent("CustomEvent");return n.initCustomEvent(t,!1,!1,e),n}(e,n);r.slice().forEach((e=>{e.call(t,o)}))}}}const b=[],w=[],$=[],x=[],E=Promise.resolve();let k=!1;function S(t){$.push(t)}function C(t){x.push(t)}let _=!1;const j=new Set;function T(){if(!_){_=!0;do{for(let t=0;t<b.length;t+=1){const e=b[t];m(e),z(e.$$)}for(m(null),b.length=0;w.length;)w.pop()();for(let t=0;t<$.length;t+=1){const e=$[t];j.has(e)||(j.add(e),e())}$.length=0}while(b.length);for(;x.length;)x.pop()();k=!1,_=!1,j.clear()}}function z(t){if(null!==t.fragment){t.update(),r(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(S)}}const V=new Set;let O;function A(t,e){t&&t.i&&(V.delete(t),t.i(e))}function W(t,e,n,r){if(t&&t.o){if(V.has(t))return;V.add(t),O.c.push((()=>{V.delete(t),r&&(n&&t.d(1),r())})),t.o(e)}}const P="undefined"!=typeof window?window:"undefined"!=typeof globalThis?globalThis:global;function U(t,e,n){const r=t.$$.props[e];void 0!==r&&(t.$$.bound[r]=n,n(t.$$.ctx[r]))}function R(t,n,i,a){const{fragment:u,on_mount:l,on_destroy:c,after_update:s}=t.$$;u&&u.m(n,i),a||S((()=>{const n=l.map(e).filter(o);c?c.push(...n):r(n),t.$$.on_mount=[]})),s.forEach(S)}function B(t,e){const n=t.$$;null!==n.fragment&&(r(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function L(t,e){-1===t.$$.dirty[0]&&(b.push(t),k||(k=!0,E.then(T)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function D(e,o,i,a,u,l,s=[-1]){const d=v;m(e);const f=e.$$={fragment:null,ctx:null,props:l,update:t,not_equal:u,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(d?d.$$.context:[]),callbacks:n(),dirty:s,skip_bound:!1};let p=!1;if(f.ctx=i?i(e,o.props||{},((t,n,...r)=>{const o=r.length?r[0]:n;return f.ctx&&u(f.ctx[t],f.ctx[t]=o)&&(!f.skip_bound&&f.bound[t]&&f.bound[t](o),p&&L(e,t)),n})):[],f.update(),p=!0,r(f.before_update),f.fragment=!!a&&a(f.ctx),o.target){if(o.hydrate){const t=function(t){return Array.from(t.childNodes)}(o.target);f.fragment&&f.fragment.l(t),t.forEach(c)}else f.fragment&&f.fragment.c();o.intro&&A(e.$$.fragment),R(e,o.target,o.anchor,o.customElement),T()}m(d)}class I{$destroy(){B(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;var q,F=(function(t,e){t.exports=function(){
/*!
       * mustache.js - Logic-less {{mustache}} templates with JavaScript
       * http://github.com/janl/mustache.js
       */
var t=Object.prototype.toString,e=Array.isArray||function(e){return"[object Array]"===t.call(e)};function n(t){return"function"==typeof t}function r(t){return e(t)?"array":typeof t}function o(t){return t.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function i(t,e){return null!=t&&"object"==typeof t&&e in t}function a(t,e){return null!=t&&"object"!=typeof t&&t.hasOwnProperty&&t.hasOwnProperty(e)}var u=RegExp.prototype.test;function l(t,e){return u.call(t,e)}var c=/\S/;function s(t){return!l(c,t)}var d={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};function f(t){return String(t).replace(/[&<>"'`=\/]/g,(function(t){return d[t]}))}var p=/\s*/,h=/\s+/,g=/\s*=/,v=/\s*\}/,m=/#|\^|\/|>|\{|&|=|!/;function y(t,n){if(!t)return[];var r,i,a,u=!1,l=[],c=[],d=[],f=!1,y=!1,x="",E=0;function S(){if(f&&!y)for(;d.length;)delete c[d.pop()];else d=[];f=!1,y=!1}function C(t){if("string"==typeof t&&(t=t.split(h,2)),!e(t)||2!==t.length)throw new Error("Invalid tags: "+t);r=new RegExp(o(t[0])+"\\s*"),i=new RegExp("\\s*"+o(t[1])),a=new RegExp("\\s*"+o("}"+t[1]))}C(n||k.tags);for(var _,j,T,z,V,O,A=new $(t);!A.eos();){if(_=A.pos,T=A.scanUntil(r))for(var W=0,P=T.length;W<P;++W)s(z=T.charAt(W))?(d.push(c.length),x+=z):(y=!0,u=!0,x+=" "),c.push(["text",z,_,_+1]),_+=1,"\n"===z&&(S(),x="",E=0,u=!1);if(!A.scan(r))break;if(f=!0,j=A.scan(m)||"name",A.scan(p),"="===j?(T=A.scanUntil(g),A.scan(g),A.scanUntil(i)):"{"===j?(T=A.scanUntil(a),A.scan(v),A.scanUntil(i),j="&"):T=A.scanUntil(i),!A.scan(i))throw new Error("Unclosed tag at "+A.pos);if(V=">"==j?[j,T,_,A.pos,x,E,u]:[j,T,_,A.pos],E++,c.push(V),"#"===j||"^"===j)l.push(V);else if("/"===j){if(!(O=l.pop()))throw new Error('Unopened section "'+T+'" at '+_);if(O[1]!==T)throw new Error('Unclosed section "'+O[1]+'" at '+_)}else"name"===j||"{"===j||"&"===j?y=!0:"="===j&&C(T)}if(S(),O=l.pop())throw new Error('Unclosed section "'+O[1]+'" at '+A.pos);return w(b(c))}function b(t){for(var e,n,r=[],o=0,i=t.length;o<i;++o)(e=t[o])&&("text"===e[0]&&n&&"text"===n[0]?(n[1]+=e[1],n[3]=e[3]):(r.push(e),n=e));return r}function w(t){for(var e,n=[],r=n,o=[],i=0,a=t.length;i<a;++i)switch((e=t[i])[0]){case"#":case"^":r.push(e),o.push(e),r=e[4]=[];break;case"/":o.pop()[5]=e[2],r=o.length>0?o[o.length-1][4]:n;break;default:r.push(e)}return n}function $(t){this.string=t,this.tail=t,this.pos=0}function x(t,e){this.view=t,this.cache={".":this.view},this.parent=e}function E(){this.templateCache={_cache:{},set:function(t,e){this._cache[t]=e},get:function(t){return this._cache[t]},clear:function(){this._cache={}}}}$.prototype.eos=function(){return""===this.tail},$.prototype.scan=function(t){var e=this.tail.match(t);if(!e||0!==e.index)return"";var n=e[0];return this.tail=this.tail.substring(n.length),this.pos+=n.length,n},$.prototype.scanUntil=function(t){var e,n=this.tail.search(t);switch(n){case-1:e=this.tail,this.tail="";break;case 0:e="";break;default:e=this.tail.substring(0,n),this.tail=this.tail.substring(n)}return this.pos+=e.length,e},x.prototype.push=function(t){return new x(t,this)},x.prototype.lookup=function(t){var e,r=this.cache;if(r.hasOwnProperty(t))e=r[t];else{for(var o,u,l,c=this,s=!1;c;){if(t.indexOf(".")>0)for(o=c.view,u=t.split("."),l=0;null!=o&&l<u.length;)l===u.length-1&&(s=i(o,u[l])||a(o,u[l])),o=o[u[l++]];else o=c.view[t],s=i(c.view,t);if(s){e=o;break}c=c.parent}r[t]=e}return n(e)&&(e=e.call(this.view)),e},E.prototype.clearCache=function(){void 0!==this.templateCache&&this.templateCache.clear()},E.prototype.parse=function(t,e){var n=this.templateCache,r=t+":"+(e||k.tags).join(":"),o=void 0!==n,i=o?n.get(r):void 0;return null==i&&(i=y(t,e),o&&n.set(r,i)),i},E.prototype.render=function(t,e,n,r){var o=this.getConfigTags(r),i=this.parse(t,o),a=e instanceof x?e:new x(e,void 0);return this.renderTokens(i,a,n,t,r)},E.prototype.renderTokens=function(t,e,n,r,o){for(var i,a,u,l="",c=0,s=t.length;c<s;++c)u=void 0,"#"===(a=(i=t[c])[0])?u=this.renderSection(i,e,n,r,o):"^"===a?u=this.renderInverted(i,e,n,r,o):">"===a?u=this.renderPartial(i,e,n,o):"&"===a?u=this.unescapedValue(i,e):"name"===a?u=this.escapedValue(i,e,o):"text"===a&&(u=this.rawValue(i)),void 0!==u&&(l+=u);return l},E.prototype.renderSection=function(t,r,o,i,a){var u=this,l="",c=r.lookup(t[1]);function s(t){return u.render(t,r,o,a)}if(c){if(e(c))for(var d=0,f=c.length;d<f;++d)l+=this.renderTokens(t[4],r.push(c[d]),o,i,a);else if("object"==typeof c||"string"==typeof c||"number"==typeof c)l+=this.renderTokens(t[4],r.push(c),o,i,a);else if(n(c)){if("string"!=typeof i)throw new Error("Cannot use higher-order sections without the original template");null!=(c=c.call(r.view,i.slice(t[3],t[5]),s))&&(l+=c)}else l+=this.renderTokens(t[4],r,o,i,a);return l}},E.prototype.renderInverted=function(t,n,r,o,i){var a=n.lookup(t[1]);if(!a||e(a)&&0===a.length)return this.renderTokens(t[4],n,r,o,i)},E.prototype.indentPartial=function(t,e,n){for(var r=e.replace(/[^ \t]/g,""),o=t.split("\n"),i=0;i<o.length;i++)o[i].length&&(i>0||!n)&&(o[i]=r+o[i]);return o.join("\n")},E.prototype.renderPartial=function(t,e,r,o){if(r){var i=this.getConfigTags(o),a=n(r)?r(t[1]):r[t[1]];if(null!=a){var u=t[6],l=t[5],c=t[4],s=a;0==l&&c&&(s=this.indentPartial(a,c,u));var d=this.parse(s,i);return this.renderTokens(d,e,r,s,o)}}},E.prototype.unescapedValue=function(t,e){var n=e.lookup(t[1]);if(null!=n)return n},E.prototype.escapedValue=function(t,e,n){var r=this.getConfigEscape(n)||k.escape,o=e.lookup(t[1]);if(null!=o)return"number"==typeof o&&r===k.escape?String(o):r(o)},E.prototype.rawValue=function(t){return t[1]},E.prototype.getConfigTags=function(t){return e(t)?t:t&&"object"==typeof t?t.tags:void 0},E.prototype.getConfigEscape=function(t){return t&&"object"==typeof t&&!e(t)?t.escape:void 0};var k={name:"mustache.js",version:"4.1.0",tags:["{{","}}"],clearCache:void 0,escape:void 0,parse:void 0,render:void 0,Scanner:void 0,Context:void 0,Writer:void 0,set templateCache(t){S.templateCache=t},get templateCache(){return S.templateCache}},S=new E;return k.clearCache=function(){return S.clearCache()},k.parse=function(t,e){return S.parse(t,e)},k.render=function(t,e,n,o){if("string"!=typeof t)throw new TypeError('Invalid template! Template should be a "string" but "'+r(t)+'" was given as the first argument for mustache#render(template, view, partials)');return S.render(t,e,n,o)},k.escape=f,k.Scanner=$,k.Context=x,k.Writer=E,k}()}(q={exports:{}},q.exports),q.exports);function N(t){return t.reduce(((t,[e,n,r,o,i])=>("name"!==e&&"&"!==e&&"#"!==e&&"^"!==e||t.push(n.replace(/\s*\..+$/,"")),Array.isArray(i)&&t.push(...N(i)),t)),[])}function H(t){return N(F.parse(t))}function M(t){return e=>{"Enter"!==e.key||e.isComposing||t(e)}}const Y=(...t)=>t.map(parseFloat).reduce(((t,e)=>t+e),0),G="undefined"!=typeof document&&!!document.documentElement.currentStyle,J=["borderBottomWidth","borderLeftWidth","borderRightWidth","borderTopWidth","boxSizing","fontFamily","fontSize","fontStyle","fontWeight","letterSpacing","lineHeight","paddingBottom","paddingLeft","paddingRight","paddingTop","tabSize","textIndent","textRendering","textTransform","width"];const K={"min-height":"0","max-height":"none",visibility:"hidden",overflow:"hidden",position:"absolute","z-index":"-1000",top:"0",right:"0"};function Q(t){return Object.entries(K).forEach((([e,n])=>t.style.setProperty(e,n,"important")))}let X;function Z(t){const e=()=>{const e=function(t){const e=window.getComputedStyle(t);if(null===e)return null;let n=(r=e,J.reduce(((t,e)=>(t[e]=r[e],t)),{}));var r;const{boxSizing:o}=n;return""===o?null:(G&&"border-box"===o&&(n.width=Y(n.width,n.borderRightWidth,n.borderLeftWidth,n.paddingRight,n.paddingLeft)+"px"),{sizingStyle:n,paddingSize:Y(n.paddingBottom,n.paddingTop),borderSize:Y(n.borderBottomWidth,n.borderTopWidth)})}(t);if(!e)return;const n=function(t,e){X||(X=document.createElement("textarea"),X.setAttribute("tab-index","-1"),X.setAttribute("aria-hidden","true"),X.setAttribute("rows","1"),Q(X)),null===X.parentNode&&document.body.appendChild(X);const{paddingSize:n,borderSize:r,sizingStyle:o}=t,{boxSizing:i}=o;Object.entries(o).forEach((([t,e])=>X.style[t]=e)),Q(X),X.value=e;let a=((t,e)=>{const n=t.scrollHeight;return"border-box"===e.sizingStyle.boxSizing?n+e.borderSize:n-e.paddingSize})(X,t);X.value="x";let u=X.scrollHeight-n;return"border-box"===i&&(u=u+n+r),Math.max(u,a)}(e,t.value||t.placeholder||"x");t.style.setProperty("height",`${n}px`,"important")};t.addEventListener("input",e),window.addEventListener("resize",e),e()}function tt(t,e){const[n,r]=Array.isArray(e)?e:[e];n&&(t.focus(),r&&r())}function et(t){let e,n,r,o,i;function a(t,e){return t[4]?rt:t[3]?void 0:nt}let u=a(t),d=u&&u(t);return{c(){e=s("strong"),d&&d.c(),n=f(),r=s("input"),h(e,"class","error svelte-5tvj07"),h(r,"type","button"),r.value="削除"},m(a,u){l(a,e,u),d&&d.m(e,null),l(a,n,u),l(a,r,u),o||(i=p(r,"click",t[9]),o=!0)},p(t,n){u!==(u=a(t))&&(d&&d.d(1),d=u&&u(t),d&&(d.c(),d.m(e,null)))},d(t){t&&c(e),d&&d.d(),t&&c(n),t&&c(r),o=!1,i()}}}function nt(t){let e;return{c(){e=d("テンプレート内に変数が存在しません")},m(t,n){l(t,e,n)},d(t){t&&c(e)}}}function rt(t){let e;return{c(){e=d("同じ名前の変数が定義されています")},m(t,n){l(t,e,n)},d(t){t&&c(e)}}}function ot(t){let e;return{c(){e=s("em"),e.textContent="変数を検知したため、自動で追加されました",h(e,"class","info svelte-5tvj07")},m(t,n){l(t,e,n)},d(t){t&&c(e)}}}function it(e){let n,i,d,v,m,y,b,w,$,x,E=(!e[3]||e[4])&&et(e),k=void 0===e[1]&&ot();return{c(){n=s("fieldset"),i=s("legend"),d=s("input"),v=f(),E&&E.c(),m=f(),k&&k.c(),y=f(),b=s("textarea"),h(d,"type","text"),h(d,"class","variable-name"),h(b,"class","svelte-5tvj07"),h(n,"class","svelte-5tvj07")},m(t,r){l(t,n,r),u(n,i),u(i,d),g(d,e[0]),u(i,v),E&&E.m(i,null),u(i,m),k&&k.m(i,null),u(n,y),u(n,b),g(b,e[1]),e[11](b),$||(x=[p(d,"input",e[8]),p(d,"keydown",M(e[6])),a(Z.call(null,b)),p(b,"input",e[10]),a(w=tt.call(null,b,[e[2],e[12]]))],$=!0)},p(t,[e]){1&e&&d.value!==t[0]&&g(d,t[0]),!t[3]||t[4]?E?E.p(t,e):(E=et(t),E.c(),E.m(i,m)):E&&(E.d(1),E=null),void 0===t[1]?k||(k=ot(),k.c(),k.m(i,null)):k&&(k.d(1),k=null),2&e&&g(b,t[1]),w&&o(w.update)&&4&e&&w.update.call(null,[t[2],t[12]])},i:t,o:t,d(t){t&&c(n),E&&E.d(),k&&k.d(),e[11](null),$=!1,r(x)}}}function at(t,e,n){let r;let{name:o}=e,{value:i}=e,{defined:a}=e,{duplicate:u=!1}=e,{autofocusValue:l=!1}=e;const c=y();return t.$$set=t=>{"name"in t&&n(0,o=t.name),"value"in t&&n(1,i=t.value),"defined"in t&&n(3,a=t.defined),"duplicate"in t&&n(4,u=t.duplicate),"autofocusValue"in t&&n(2,l=t.autofocusValue)},[o,i,l,a,u,r,function(t){t.preventDefault(),r.focus()},c,function(){o=this.value,n(0,o)},()=>c("remove"),function(){i=this.value,n(1,i)},function(t){w[t?"unshift":"push"]((()=>{r=t,n(5,r)}))},()=>n(2,l=!1)]}class ut extends I{constructor(t){super(),D(this,t,at,it,i,{name:0,value:1,defined:3,duplicate:4,autofocusValue:2})}}const{Boolean:lt}=P;function ct(t,e,n){const r=t.slice();return r[15]=e[n],r[16]=e,r[17]=n,r}function st(t){let e,n,r,i,a,u;function d(e){t[8](e,t[15])}function f(e){t[9](e,t[15])}function p(e){t[10](e,t[15])}let g={defined:t[2].has(t[15].name),duplicate:t[15].duplicate};return void 0!==t[15].name&&(g.name=t[15].name),void 0!==t[15].value&&(g.value=t[15].value),void 0!==t[15].focusValue&&(g.autofocusValue=t[15].focusValue),n=new ut({props:g}),w.push((()=>U(n,"name",d))),w.push((()=>U(n,"value",f))),w.push((()=>U(n,"autofocusValue",p))),n.$on("remove",(function(){o(t[6](t[15]))&&t[6](t[15]).apply(this,arguments)})),{c(){var t;e=s("div"),(t=n.$$.fragment)&&t.c(),h(e,"class","variable-input svelte-cddgnw")},m(t,r){l(t,e,r),R(n,e,null),u=!0},p(e,o){t=e;const u={};5&o&&(u.defined=t[2].has(t[15].name)),1&o&&(u.duplicate=t[15].duplicate),!r&&1&o&&(r=!0,u.name=t[15].name,C((()=>r=!1))),!i&&1&o&&(i=!0,u.value=t[15].value,C((()=>i=!1))),!a&&1&o&&(a=!0,u.autofocusValue=t[15].focusValue,C((()=>a=!1))),n.$set(u)},i(t){u||(A(n.$$.fragment,t),u=!0)},o(t){W(n.$$.fragment,t),u=!1},d(t){t&&c(e),B(n)}}}function dt(e){let n;return{c(){n=s("strong"),n.textContent="テンプレートの変換が失敗しました。",h(n,"class","error svelte-cddgnw")},m(t,e){l(t,n,e)},p:t,d(t){t&&c(n)}}}function ft(t){let e;return{c(){e=s("textarea"),e.readOnly=!0,e.value=t[4],h(e,"class","svelte-cddgnw")},m(t,n){l(t,e,n)},p(t,n){16&n&&(e.value=t[4])},d(t){t&&c(e)}}}function pt(t){let e,n,o,i,a,d,v,m,y,b,w,$,x,E,k,S,C,_=t[0],j=[];for(let e=0;e<_.length;e+=1)j[e]=st(ct(t,_,e));const T=t=>W(j[t],1,1,(()=>{j[t]=null}));function z(t,e){return"string"==typeof t[4]?ft:dt}let V=z(t),P=V(t);return{c(){e=s("main"),n=s("div"),o=s("div");for(let t=0;t<j.length;t+=1)j[t].c();i=f(),a=s("p"),d=s("input"),v=f(),m=s("input"),b=f(),w=s("div"),$=s("textarea"),x=f(),E=s("div"),P.c(),h(d,"type","text"),h(d,"class","variable-name"),h(d,"placeholder","新しい変数の名前"),h(m,"type","button"),m.value="追加",m.disabled=y=""===t[3]||t[5](t[3]),h(a,"class","add-variables-area svelte-cddgnw"),h(o,"class","input-variables-area svelte-cddgnw"),h($,"class","svelte-cddgnw"),h(w,"class","input-template-area svelte-cddgnw"),h(n,"class","input-area svelte-cddgnw"),h(E,"class","output-area svelte-cddgnw"),h(e,"class","svelte-cddgnw")},m(r,c){l(r,e,c),u(e,n),u(n,o);for(let t=0;t<j.length;t+=1)j[t].m(o,null);u(o,i),u(o,a),u(a,d),g(d,t[3]),u(a,v),u(a,m),u(n,b),u(n,w),u(w,$),g($,t[1]),u(e,x),u(e,E),P.m(E,null),k=!0,S||(C=[p(d,"input",t[11]),p(d,"keydown",M(t[7])),p(m,"click",t[7]),p($,"input",t[12])],S=!0)},p(t,[e]){if(69&e){let n;for(_=t[0],n=0;n<_.length;n+=1){const r=ct(t,_,n);j[n]?(j[n].p(r,e),A(j[n],1)):(j[n]=st(r),j[n].c(),A(j[n],1),j[n].m(o,i))}for(O={r:0,c:[],p:O},n=_.length;n<j.length;n+=1)T(n);O.r||r(O.c),O=O.p}8&e&&d.value!==t[3]&&g(d,t[3]),(!k||8&e&&y!==(y=""===t[3]||t[5](t[3])))&&(m.disabled=y),2&e&&g($,t[1]),V===(V=z(t))&&P?P.p(t,e):(P.d(1),P=V(t),P&&(P.c(),P.m(E,null)))},i(t){if(!k){for(let t=0;t<_.length;t+=1)A(j[t]);k=!0}},o(t){j=j.filter(lt);for(let t=0;t<j.length;t+=1)W(j[t]);k=!1},d(t){t&&c(e),function(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}(j,t),P.d(),S=!1,r(C)}}}function ht(t){var e;const n=new Map;for(const r of t){const t=null!==(e=n.get(r.name))&&void 0!==e?e:new Set;t.add(r),n.set(r.name,t)}return t.map((t=>{var e,r;const o=null!==(r=null===(e=n.get(t.name))||void 0===e?void 0:e.size)&&void 0!==r?r:1;return Object.assign(Object.assign({},t),{duplicate:1<o})}))}function gt(t,e,n){let r;function o(t,e=a){return Boolean(e.find((({name:e})=>e===t)))}let i,a=ht([{name:"title",value:"ゲト博士"},{name:"せつめい",value:"ドフェチいモフモフキャラだよ♥"}]),u='<!DOCTYPE html>\n<html lang="ja">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width,initial-scale=1">\n    <title>{{ title }}</title>\n  </head>\n  <body>\n    <main>{{ せつめい }}</main>\n  </body>\n</html>',l="";return t.$$.update=()=>{if(6&t.$$.dirty)try{n(2,i=new Set(H(u)));const t=a.filter((t=>void 0!==t.value));n(0,a=ht([...t,...[...i].filter((e=>!o(e,t))).map((t=>({name:t})))]))}catch(t){console.error(t)}3&t.$$.dirty&&n(4,r=function(t,e){const n=Object.fromEntries(e.map((({name:t,value:e})=>[t,e])));try{return F.render(t,n)}catch(t){return console.error(t),null}}(u,a))},[a,u,i,l,r,o,t=>()=>{n(0,a=ht(a.filter((e=>e!==t))))},t=>{t.preventDefault(),""===l||o(l)||(n(0,a=a.concat({name:l,value:"",duplicate:!1,focusValue:!0})),n(3,l=""))},function(e,r){t.$$.not_equal(r.name,e)&&(r.name=e,n(0,a),n(1,u),n(2,i))},function(e,r){t.$$.not_equal(r.value,e)&&(r.value=e,n(0,a),n(1,u),n(2,i))},function(e,r){t.$$.not_equal(r.focusValue,e)&&(r.focusValue=e,n(0,a),n(1,u),n(2,i))},function(){l=this.value,n(3,l)},function(){u=this.value,n(1,u)}]}class vt extends I{constructor(t){super(),D(this,t,gt,pt,i,{})}}const mt=document.getElementById("main");mt&&function(t,e){var n;const{target:r}=e,o=(null!==(n=r.ownerDocument)&&void 0!==n?n:r instanceof Document?r:document).createDocumentFragment(),i=new t(Object.assign(e,{target:o}));r.replaceWith(o)}(vt,{target:mt})}();
//# sourceMappingURL=main.js.map
