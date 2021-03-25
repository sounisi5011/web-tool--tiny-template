!function(){"use strict";function e(){}function t(e){return e()}function n(){return Object.create(null)}function r(e){e.forEach(t)}function o(e){return"function"==typeof e}function i(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function a(t){return t&&o(t.destroy)?t.destroy:e}function l(e,t){e.appendChild(t)}function u(e,t,n){e.insertBefore(t,n||null)}function s(e){e.parentNode.removeChild(e)}function c(e){return document.createElement(e)}function f(e){return document.createTextNode(e)}function d(){return f(" ")}function p(e,t,n,r){return e.addEventListener(t,n,r),()=>e.removeEventListener(t,n,r)}function h(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function v(e,t){e.value=null==t?"":t}let m;function g(e){m=e}function y(){const e=function(){if(!m)throw new Error("Function called outside component initialization");return m}();return(t,n)=>{const r=e.$$.callbacks[t];if(r){const o=function(e,t){const n=document.createEvent("CustomEvent");return n.initCustomEvent(e,!1,!1,t),n}(t,n);r.slice().forEach((t=>{t.call(e,o)}))}}}const b=[],w=[],$=[],x=[],E=Promise.resolve();let k=!1;function S(e){$.push(e)}function j(e){x.push(e)}let C=!1;const _=new Set;function T(){if(!C){C=!0;do{for(let e=0;e<b.length;e+=1){const t=b[e];g(t),O(t.$$)}for(g(null),b.length=0;w.length;)w.pop()();for(let e=0;e<$.length;e+=1){const t=$[e];_.has(t)||(_.add(t),t())}$.length=0}while(b.length);for(;x.length;)x.pop()();k=!1,C=!1,_.clear()}}function O(e){if(null!==e.fragment){e.update(),r(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(S)}}const z=new Set;let A;function V(e,t){e&&e.i&&(z.delete(e),e.i(t))}function L(e,t,n,r){if(e&&e.o){if(z.has(e))return;z.add(e),A.c.push((()=>{z.delete(e),r&&(n&&e.d(1),r())})),e.o(t)}}const R="undefined"!=typeof window?window:"undefined"!=typeof globalThis?globalThis:global;function U(e,t,n){const r=e.$$.props[t];void 0!==r&&(e.$$.bound[r]=n,n(e.$$.ctx[r]))}function W(e,n,i,a){const{fragment:l,on_mount:u,on_destroy:s,after_update:c}=e.$$;l&&l.m(n,i),a||S((()=>{const n=u.map(t).filter(o);s?s.push(...n):r(n),e.$$.on_mount=[]})),c.forEach(S)}function P(e,t){const n=e.$$;null!==n.fragment&&(r(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function B(e,t){-1===e.$$.dirty[0]&&(b.push(e),k||(k=!0,E.then(T)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function F(t,o,i,a,l,u,c=[-1]){const f=m;g(t);const d=t.$$={fragment:null,ctx:null,props:u,update:e,not_equal:l,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(f?f.$$.context:[]),callbacks:n(),dirty:c,skip_bound:!1};let p=!1;if(d.ctx=i?i(t,o.props||{},((e,n,...r)=>{const o=r.length?r[0]:n;return d.ctx&&l(d.ctx[e],d.ctx[e]=o)&&(!d.skip_bound&&d.bound[e]&&d.bound[e](o),p&&B(t,e)),n})):[],d.update(),p=!0,r(d.before_update),d.fragment=!!a&&a(d.ctx),o.target){if(o.hydrate){const e=function(e){return Array.from(e.childNodes)}(o.target);d.fragment&&d.fragment.l(e),e.forEach(s)}else d.fragment&&d.fragment.c();o.intro&&V(t.$$.fragment),W(t,o.target,o.anchor,o.customElement),T()}g(f)}class N{$destroy(){P(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;var D,q=(function(e,t){e.exports=function(){
/*!
       * mustache.js - Logic-less {{mustache}} templates with JavaScript
       * http://github.com/janl/mustache.js
       */
var e=Object.prototype.toString,t=Array.isArray||function(t){return"[object Array]"===e.call(t)};function n(e){return"function"==typeof e}function r(e){return t(e)?"array":typeof e}function o(e){return e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function i(e,t){return null!=e&&"object"==typeof e&&t in e}function a(e,t){return null!=e&&"object"!=typeof e&&e.hasOwnProperty&&e.hasOwnProperty(t)}var l=RegExp.prototype.test;function u(e,t){return l.call(e,t)}var s=/\S/;function c(e){return!u(s,e)}var f={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};function d(e){return String(e).replace(/[&<>"'`=\/]/g,(function(e){return f[e]}))}var p=/\s*/,h=/\s+/,v=/\s*=/,m=/\s*\}/,g=/#|\^|\/|>|\{|&|=|!/;function y(e,n){if(!e)return[];var r,i,a,l=!1,u=[],s=[],f=[],d=!1,y=!1,x="",E=0;function S(){if(d&&!y)for(;f.length;)delete s[f.pop()];else f=[];d=!1,y=!1}function j(e){if("string"==typeof e&&(e=e.split(h,2)),!t(e)||2!==e.length)throw new Error("Invalid tags: "+e);r=new RegExp(o(e[0])+"\\s*"),i=new RegExp("\\s*"+o(e[1])),a=new RegExp("\\s*"+o("}"+e[1]))}j(n||k.tags);for(var C,_,T,O,z,A,V=new $(e);!V.eos();){if(C=V.pos,T=V.scanUntil(r))for(var L=0,R=T.length;L<R;++L)c(O=T.charAt(L))?(f.push(s.length),x+=O):(y=!0,l=!0,x+=" "),s.push(["text",O,C,C+1]),C+=1,"\n"===O&&(S(),x="",E=0,l=!1);if(!V.scan(r))break;if(d=!0,_=V.scan(g)||"name",V.scan(p),"="===_?(T=V.scanUntil(v),V.scan(v),V.scanUntil(i)):"{"===_?(T=V.scanUntil(a),V.scan(m),V.scanUntil(i),_="&"):T=V.scanUntil(i),!V.scan(i))throw new Error("Unclosed tag at "+V.pos);if(z=">"==_?[_,T,C,V.pos,x,E,l]:[_,T,C,V.pos],E++,s.push(z),"#"===_||"^"===_)u.push(z);else if("/"===_){if(!(A=u.pop()))throw new Error('Unopened section "'+T+'" at '+C);if(A[1]!==T)throw new Error('Unclosed section "'+A[1]+'" at '+C)}else"name"===_||"{"===_||"&"===_?y=!0:"="===_&&j(T)}if(S(),A=u.pop())throw new Error('Unclosed section "'+A[1]+'" at '+V.pos);return w(b(s))}function b(e){for(var t,n,r=[],o=0,i=e.length;o<i;++o)(t=e[o])&&("text"===t[0]&&n&&"text"===n[0]?(n[1]+=t[1],n[3]=t[3]):(r.push(t),n=t));return r}function w(e){for(var t,n=[],r=n,o=[],i=0,a=e.length;i<a;++i)switch((t=e[i])[0]){case"#":case"^":r.push(t),o.push(t),r=t[4]=[];break;case"/":o.pop()[5]=t[2],r=o.length>0?o[o.length-1][4]:n;break;default:r.push(t)}return n}function $(e){this.string=e,this.tail=e,this.pos=0}function x(e,t){this.view=e,this.cache={".":this.view},this.parent=t}function E(){this.templateCache={_cache:{},set:function(e,t){this._cache[e]=t},get:function(e){return this._cache[e]},clear:function(){this._cache={}}}}$.prototype.eos=function(){return""===this.tail},$.prototype.scan=function(e){var t=this.tail.match(e);if(!t||0!==t.index)return"";var n=t[0];return this.tail=this.tail.substring(n.length),this.pos+=n.length,n},$.prototype.scanUntil=function(e){var t,n=this.tail.search(e);switch(n){case-1:t=this.tail,this.tail="";break;case 0:t="";break;default:t=this.tail.substring(0,n),this.tail=this.tail.substring(n)}return this.pos+=t.length,t},x.prototype.push=function(e){return new x(e,this)},x.prototype.lookup=function(e){var t,r=this.cache;if(r.hasOwnProperty(e))t=r[e];else{for(var o,l,u,s=this,c=!1;s;){if(e.indexOf(".")>0)for(o=s.view,l=e.split("."),u=0;null!=o&&u<l.length;)u===l.length-1&&(c=i(o,l[u])||a(o,l[u])),o=o[l[u++]];else o=s.view[e],c=i(s.view,e);if(c){t=o;break}s=s.parent}r[e]=t}return n(t)&&(t=t.call(this.view)),t},E.prototype.clearCache=function(){void 0!==this.templateCache&&this.templateCache.clear()},E.prototype.parse=function(e,t){var n=this.templateCache,r=e+":"+(t||k.tags).join(":"),o=void 0!==n,i=o?n.get(r):void 0;return null==i&&(i=y(e,t),o&&n.set(r,i)),i},E.prototype.render=function(e,t,n,r){var o=this.getConfigTags(r),i=this.parse(e,o),a=t instanceof x?t:new x(t,void 0);return this.renderTokens(i,a,n,e,r)},E.prototype.renderTokens=function(e,t,n,r,o){for(var i,a,l,u="",s=0,c=e.length;s<c;++s)l=void 0,"#"===(a=(i=e[s])[0])?l=this.renderSection(i,t,n,r,o):"^"===a?l=this.renderInverted(i,t,n,r,o):">"===a?l=this.renderPartial(i,t,n,o):"&"===a?l=this.unescapedValue(i,t):"name"===a?l=this.escapedValue(i,t,o):"text"===a&&(l=this.rawValue(i)),void 0!==l&&(u+=l);return u},E.prototype.renderSection=function(e,r,o,i,a){var l=this,u="",s=r.lookup(e[1]);function c(e){return l.render(e,r,o,a)}if(s){if(t(s))for(var f=0,d=s.length;f<d;++f)u+=this.renderTokens(e[4],r.push(s[f]),o,i,a);else if("object"==typeof s||"string"==typeof s||"number"==typeof s)u+=this.renderTokens(e[4],r.push(s),o,i,a);else if(n(s)){if("string"!=typeof i)throw new Error("Cannot use higher-order sections without the original template");null!=(s=s.call(r.view,i.slice(e[3],e[5]),c))&&(u+=s)}else u+=this.renderTokens(e[4],r,o,i,a);return u}},E.prototype.renderInverted=function(e,n,r,o,i){var a=n.lookup(e[1]);if(!a||t(a)&&0===a.length)return this.renderTokens(e[4],n,r,o,i)},E.prototype.indentPartial=function(e,t,n){for(var r=t.replace(/[^ \t]/g,""),o=e.split("\n"),i=0;i<o.length;i++)o[i].length&&(i>0||!n)&&(o[i]=r+o[i]);return o.join("\n")},E.prototype.renderPartial=function(e,t,r,o){if(r){var i=this.getConfigTags(o),a=n(r)?r(e[1]):r[e[1]];if(null!=a){var l=e[6],u=e[5],s=e[4],c=a;0==u&&s&&(c=this.indentPartial(a,s,l));var f=this.parse(c,i);return this.renderTokens(f,t,r,c,o)}}},E.prototype.unescapedValue=function(e,t){var n=t.lookup(e[1]);if(null!=n)return n},E.prototype.escapedValue=function(e,t,n){var r=this.getConfigEscape(n)||k.escape,o=t.lookup(e[1]);if(null!=o)return"number"==typeof o&&r===k.escape?String(o):r(o)},E.prototype.rawValue=function(e){return e[1]},E.prototype.getConfigTags=function(e){return t(e)?e:e&&"object"==typeof e?e.tags:void 0},E.prototype.getConfigEscape=function(e){return e&&"object"==typeof e&&!t(e)?e.escape:void 0};var k={name:"mustache.js",version:"4.1.0",tags:["{{","}}"],clearCache:void 0,escape:void 0,parse:void 0,render:void 0,Scanner:void 0,Context:void 0,Writer:void 0,set templateCache(e){S.templateCache=e},get templateCache(){return S.templateCache}},S=new E;return k.clearCache=function(){return S.clearCache()},k.parse=function(e,t){return S.parse(e,t)},k.render=function(e,t,n,o){if("string"!=typeof e)throw new TypeError('Invalid template! Template should be a "string" but "'+r(e)+'" was given as the first argument for mustache#render(template, view, partials)');return S.render(e,t,n,o)},k.escape=d,k.Scanner=$,k.Context=x,k.Writer=E,k}()}(D={exports:{}},D.exports),D.exports);function I(e){return e.reduce(((e,[t,n,r,o,i])=>("name"!==t&&"&"!==t&&"#"!==t&&"^"!==t||e.push(n.replace(/\s*\..+$/,"")),Array.isArray(i)&&e.push(...I(i)),e)),[])}function M(e){return I(q.parse(e))}function H(e){return t=>{"Enter"!==t.key||t.isComposing||e(t)}}const J=(...e)=>e.map(parseFloat).reduce(((e,t)=>e+t),0),Y="undefined"!=typeof document&&!!document.documentElement.currentStyle,G=["borderBottomWidth","borderLeftWidth","borderRightWidth","borderTopWidth","boxSizing","fontFamily","fontSize","fontStyle","fontWeight","letterSpacing","lineHeight","paddingBottom","paddingLeft","paddingRight","paddingTop","tabSize","textIndent","textRendering","textTransform","width"];const K={"min-height":"0","max-height":"none",visibility:"hidden",overflow:"hidden",position:"absolute","z-index":"-1000",top:"0",right:"0"};function Q(e){return Object.entries(K).forEach((([t,n])=>e.style.setProperty(t,n,"important")))}let X;function Z(e){const t=()=>{const t=function(e){const t=window.getComputedStyle(e);if(null===t)return null;let n=(r=t,G.reduce(((e,t)=>(e[t]=r[t],e)),{}));var r;const{boxSizing:o}=n;return""===o?null:(Y&&"border-box"===o&&(n.width=J(n.width,n.borderRightWidth,n.borderLeftWidth,n.paddingRight,n.paddingLeft)+"px"),{sizingStyle:n,paddingSize:J(n.paddingBottom,n.paddingTop),borderSize:J(n.borderBottomWidth,n.borderTopWidth)})}(e);if(!t)return;const n=function(e,t){X||(X=document.createElement("textarea"),X.setAttribute("tab-index","-1"),X.setAttribute("aria-hidden","true"),X.setAttribute("rows","1"),Q(X)),null===X.parentNode&&document.body.appendChild(X);const{paddingSize:n,borderSize:r,sizingStyle:o}=e,{boxSizing:i}=o;Object.entries(o).forEach((([e,t])=>X.style[e]=t)),Q(X),X.value=t;let a=((e,t)=>{const n=e.scrollHeight;return"border-box"===t.sizingStyle.boxSizing?n+t.borderSize:n-t.paddingSize})(X,e);X.value="x";let l=X.scrollHeight-n;return"border-box"===i&&(l=l+n+r),Math.max(l,a)}(t,e.value||e.placeholder||"x");e.style.setProperty("height",`${n}px`,"important")};e.addEventListener("input",t),window.addEventListener("resize",t),t()}function ee(e,t){const[n,r]=Array.isArray(t)?t:[t];n&&(e.focus(),r&&r())}function te(e){let t,n,r,o,i;function a(e,t){return""===e[0]?oe:e[4]?re:e[3]?void 0:ne}let l=a(e),f=l&&l(e);return{c(){t=c("strong"),f&&f.c(),n=d(),r=c("input"),h(t,"class","error svelte-5tvj07"),h(r,"type","button"),r.value="削除"},m(a,l){u(a,t,l),f&&f.m(t,null),u(a,n,l),u(a,r,l),o||(i=p(r,"click",e[9]),o=!0)},p(e,n){l!==(l=a(e))&&(f&&f.d(1),f=l&&l(e),f&&(f.c(),f.m(t,null)))},d(e){e&&s(t),f&&f.d(),e&&s(n),e&&s(r),o=!1,i()}}}function ne(e){let t;return{c(){t=f("テンプレート内に変数が存在しません")},m(e,n){u(e,t,n)},d(e){e&&s(t)}}}function re(e){let t;return{c(){t=f("同じ名前の変数が定義されています")},m(e,n){u(e,t,n)},d(e){e&&s(t)}}}function oe(e){let t;return{c(){t=f("変数名が入力されていません")},m(e,n){u(e,t,n)},d(e){e&&s(t)}}}function ie(e){let t;return{c(){t=c("em"),t.textContent="変数を検知したため、自動で追加されました",h(t,"class","info svelte-5tvj07")},m(e,n){u(e,t,n)},d(e){e&&s(t)}}}function ae(t){let n,i,f,m,g,y,b,w,$,x,E=(""===t[0]||!t[3]||t[4])&&te(t),k=void 0===t[1]&&ie();return{c(){n=c("fieldset"),i=c("legend"),f=c("input"),m=d(),E&&E.c(),g=d(),k&&k.c(),y=d(),b=c("textarea"),h(f,"type","text"),h(f,"class","variable-name"),h(f,"placeholder","変数名を入力"),h(b,"placeholder","変数の値を入力"),h(b,"class","svelte-5tvj07"),h(n,"class","svelte-5tvj07")},m(e,r){u(e,n,r),l(n,i),l(i,f),v(f,t[0]),l(i,m),E&&E.m(i,null),l(i,g),k&&k.m(i,null),l(n,y),l(n,b),v(b,t[1]),t[11](b),$||(x=[p(f,"input",t[8]),p(f,"keydown",H(t[6])),a(Z.call(null,b)),p(b,"input",t[10]),a(w=ee.call(null,b,[t[2],t[12]]))],$=!0)},p(e,[t]){1&t&&f.value!==e[0]&&v(f,e[0]),""===e[0]||!e[3]||e[4]?E?E.p(e,t):(E=te(e),E.c(),E.m(i,g)):E&&(E.d(1),E=null),void 0===e[1]?k||(k=ie(),k.c(),k.m(i,null)):k&&(k.d(1),k=null),2&t&&v(b,e[1]),w&&o(w.update)&&4&t&&w.update.call(null,[e[2],e[12]])},i:e,o:e,d(e){e&&s(n),E&&E.d(),k&&k.d(),t[11](null),$=!1,r(x)}}}function le(e,t,n){let r;let{name:o}=t,{value:i}=t,{defined:a}=t,{duplicate:l=!1}=t,{autofocusValue:u=!1}=t;const s=y();return e.$$set=e=>{"name"in e&&n(0,o=e.name),"value"in e&&n(1,i=e.value),"defined"in e&&n(3,a=e.defined),"duplicate"in e&&n(4,l=e.duplicate),"autofocusValue"in e&&n(2,u=e.autofocusValue)},[o,i,u,a,l,r,function(e){e.preventDefault(),r.focus()},s,function(){o=this.value,n(0,o)},()=>s("remove"),function(){i=this.value,n(1,i)},function(e){w[e?"unshift":"push"]((()=>{r=e,n(5,r)}))},()=>n(2,u=!1)]}class ue extends N{constructor(e){super(),F(this,e,le,ae,i,{name:0,value:1,defined:3,duplicate:4,autofocusValue:2})}}const{Boolean:se}=R;function ce(e,t,n){const r=e.slice();return r[17]=t[n],r[18]=t,r[19]=n,r}function fe(e){let t,n,r,i,a,l;function f(t){e[10](t,e[17])}function d(t){e[11](t,e[17])}function p(t){e[12](t,e[17])}let v={defined:e[2].has(e[17].name),duplicate:e[17].duplicate};return void 0!==e[17].name&&(v.name=e[17].name),void 0!==e[17].value&&(v.value=e[17].value),void 0!==e[17].focusValue&&(v.autofocusValue=e[17].focusValue),n=new ue({props:v}),w.push((()=>U(n,"name",f))),w.push((()=>U(n,"value",d))),w.push((()=>U(n,"autofocusValue",p))),n.$on("remove",(function(){o(e[8](e[17]))&&e[8](e[17]).apply(this,arguments)})),{c(){var e;t=c("div"),(e=n.$$.fragment)&&e.c(),h(t,"class","variable-input svelte-1osh6wv")},m(e,r){u(e,t,r),W(n,t,null),l=!0},p(t,o){e=t;const l={};5&o&&(l.defined=e[2].has(e[17].name)),1&o&&(l.duplicate=e[17].duplicate),!r&&1&o&&(r=!0,l.name=e[17].name,j((()=>r=!1))),!i&&1&o&&(i=!0,l.value=e[17].value,j((()=>i=!1))),!a&&1&o&&(a=!0,l.autofocusValue=e[17].focusValue,j((()=>a=!1))),n.$set(l)},i(e){l||(V(n.$$.fragment,e),l=!0)},o(e){L(n.$$.fragment,e),l=!1},d(e){e&&s(t),P(n)}}}function de(t){let n;return{c(){n=c("strong"),n.textContent="テンプレートの変換が失敗しました。",h(n,"class","error svelte-1osh6wv")},m(e,t){u(e,n,t)},p:e,d(e){e&&s(n)}}}function pe(e){let t;return{c(){t=c("textarea"),t.readOnly=!0,t.value=e[4],h(t,"class","svelte-1osh6wv")},m(e,n){u(e,t,n)},p(e,n){16&n&&(t.value=e[4])},d(e){e&&s(t)}}}function he(e){let t,n,o,i,a,f,m,g,y,b,w,$,x,E,k,S,j,C,_,T,O,z,R,U,W=e[0],P=[];for(let t=0;t<W.length;t+=1)P[t]=fe(ce(e,W,t));const B=e=>L(P[e],1,1,(()=>{P[e]=null}));function F(e,t){return"string"==typeof e[4]?pe:de}let N=F(e),D=N(e);return{c(){t=c("main"),n=c("div"),o=c("div");for(let e=0;e<P.length;e+=1)P[e].c();i=d(),a=c("p"),f=c("input"),m=d(),g=c("input"),b=d(),w=c("p"),$=c("input"),x=d(),E=c("input"),k=d(),S=c("div"),j=c("textarea"),C=d(),_=c("p"),_.innerHTML='テンプレートの言語は\n      <a href="http://mustache.github.io/" target="_blank">Mustache</a>\n      です。',T=d(),O=c("div"),D.c(),h(f,"type","text"),h(f,"class","variable-name"),h(f,"placeholder","新しい変数の名前"),h(g,"type","button"),g.value="追加",g.disabled=y=""===e[3]||e[5](e[3]),h(a,"class","add-variables-area svelte-1osh6wv"),h($,"type","button"),$.value="インポート",h($,"class","svelte-1osh6wv"),h(E,"type","button"),E.value="エクスポート",h(E,"class","svelte-1osh6wv"),h(w,"class","variables-import-export-area svelte-1osh6wv"),h(o,"class","input-variables-area svelte-1osh6wv"),h(j,"placeholder","テンプレートを入力"),h(j,"class","svelte-1osh6wv"),h(S,"class","input-template-area svelte-1osh6wv"),h(_,"class","input-template-help svelte-1osh6wv"),h(n,"class","input-area svelte-1osh6wv"),h(O,"class","output-area svelte-1osh6wv"),h(t,"class","svelte-1osh6wv")},m(r,s){u(r,t,s),l(t,n),l(n,o);for(let e=0;e<P.length;e+=1)P[e].m(o,null);l(o,i),l(o,a),l(a,f),v(f,e[3]),l(a,m),l(a,g),l(o,b),l(o,w),l(w,$),l(w,x),l(w,E),l(n,k),l(n,S),l(S,j),v(j,e[1]),l(n,C),l(n,_),l(t,T),l(t,O),D.m(O,null),z=!0,R||(U=[p(f,"input",e[13]),p(f,"keydown",H(e[9])),p(g,"click",e[9]),p($,"click",e[6]),p(E,"click",e[7]),p(j,"input",e[14])],R=!0)},p(e,[t]){if(261&t){let n;for(W=e[0],n=0;n<W.length;n+=1){const r=ce(e,W,n);P[n]?(P[n].p(r,t),V(P[n],1)):(P[n]=fe(r),P[n].c(),V(P[n],1),P[n].m(o,i))}for(A={r:0,c:[],p:A},n=W.length;n<P.length;n+=1)B(n);A.r||r(A.c),A=A.p}8&t&&f.value!==e[3]&&v(f,e[3]),(!z||8&t&&y!==(y=""===e[3]||e[5](e[3])))&&(g.disabled=y),2&t&&v(j,e[1]),N===(N=F(e))&&D?D.p(e,t):(D.d(1),D=N(e),D&&(D.c(),D.m(O,null)))},i(e){if(!z){for(let e=0;e<W.length;e+=1)V(P[e]);z=!0}},o(e){P=P.filter(se);for(let e=0;e<P.length;e+=1)L(P[e]);z=!1},d(e){e&&s(t),function(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}(P,e),D.d(),R=!1,r(U)}}}function ve(e){return Object.fromEntries(e.map((({name:e,value:t})=>[e,null!=t?t:""])))}function me(e){var t;const n=new Map;for(const r of e){const e=null!==(t=n.get(r.name))&&void 0!==t?t:new Set;e.add(r),n.set(r.name,e)}return e.map((e=>{var t,r;const o=null!==(r=null===(t=n.get(e.name))||void 0===t?void 0:t.size)&&void 0!==r?r:1;return Object.assign(Object.assign({},e),{duplicate:1<o})}))}function ge(e,t,n){let r;function o(e,t=a){return Boolean(t.find((({name:t})=>t===e)))}let i,a=me([{name:"title",value:"ゲト博士"},{name:"せつめい",value:"ドフェチいモフモフキャラだよ♥"}]),l='<!DOCTYPE html>\n<html lang="ja">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width,initial-scale=1">\n    <title>{{ title }}</title>\n  </head>\n  <body>\n    <main>{{ せつめい }}</main>\n  </body>\n</html>',u="";return e.$$.update=()=>{if(6&e.$$.dirty)try{n(2,i=new Set(M(l)));const e=a.filter((e=>void 0!==e.value));n(0,a=me([...e,...[...i].filter((t=>!o(t,e))).map((e=>({name:e})))]))}catch(e){console.error(e)}3&e.$$.dirty&&n(4,r=function(e,t){const n=ve(t);try{return q.render(e,n)}catch(e){return console.error(e),null}}(l,a))},[a,l,i,u,r,o,()=>{!function({accept:e=""},t){const n=document.createElement("input");n.type="file",n.accept=e,n.addEventListener("change",(()=>{var e;const r=(null!==(e=n.files)&&void 0!==e?e:[])[0];r&&t(r)})),n.click()}({accept:".json"},(e=>{const t=new FileReader;t.addEventListener("load",(()=>{const{result:e}=t;if("string"!=typeof e)return void alert("ファイルの読み込みが失敗しました。FileReaderオブジェクトが、文字列ではない結果を返しました");let r;try{r=JSON.parse(e)}catch(e){return void alert(`ファイルの読み込みが失敗しました。指定されたファイルは適切なJSONではありません:\n  ${e}`)}!function(e){if(!function(e){return"object"==typeof e&&null!==e}(e))return!1;for(const t of Object.keys(e)){const n=e[t];if(null!==n&&"string"!=typeof n&&"number"!=typeof n&&"boolean"!=typeof n)return!1}return!0}(r)?alert('ファイルの読み込みが失敗しました。指定されたファイルは適切なデータ形式ではありません。以下のような形式のJSONデータを指定してください:\n  {\n    "変数名1": "値",\n    "変数名2": 42,\n    "変数名3": true,\n    "変数名4": null\n  }'):confirm("現在の変数の入力を消去し、ファイルで指定された変数で上書きします。よろしいですか？")&&n(0,a=me(Object.entries(r).map((([e,t])=>({name:e,value:String(t)})))))})),t.addEventListener("error",(()=>{alert(`ファイルの読み込みが失敗しました:\n  ${t.error}`)})),t.addEventListener("abort",(()=>{alert("ファイルの読み込みが中断されました")})),t.readAsText(e)}))},()=>{const e=ve(a);!function({filename:e,contents:t,mime:n}){const r=new Blob(Array.isArray(t)?t:[t],{type:n}),o=URL.createObjectURL(r),i=document.createElement("a");i.download=e,i.href=o,i.addEventListener("click",(()=>requestAnimationFrame((()=>{document.body.removeChild(i),URL.revokeObjectURL(o)})))),document.body.appendChild(i),i.click()}({filename:"variables.json",contents:JSON.stringify(e,null,2),mime:"application/json"})},e=>()=>{n(0,a=me(a.filter((t=>t!==e))))},e=>{e.preventDefault(),""===u||o(u)||(n(0,a=a.concat({name:u,value:"",duplicate:!1,focusValue:!0})),n(3,u=""))},function(t,r){e.$$.not_equal(r.name,t)&&(r.name=t,n(0,a),n(1,l),n(2,i))},function(t,r){e.$$.not_equal(r.value,t)&&(r.value=t,n(0,a),n(1,l),n(2,i))},function(t,r){e.$$.not_equal(r.focusValue,t)&&(r.focusValue=t,n(0,a),n(1,l),n(2,i))},function(){u=this.value,n(3,u)},function(){l=this.value,n(1,l)}]}class ye extends N{constructor(e){super(),F(this,e,ge,he,i,{})}}const be=document.getElementById("main");be&&function(e,t){var n;const{target:r}=t,o=(null!==(n=r.ownerDocument)&&void 0!==n?n:r instanceof Document?r:document).createDocumentFragment(),i=new e(Object.assign(t,{target:o}));r.replaceWith(o)}(ye,{target:be})}();
//# sourceMappingURL=main.js.map
