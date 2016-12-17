"use strict";function _classCallCheck(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function t(t,n){for(var e=0;e<n.length;e++){var r=n[e];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(n,e,r){return e&&t(n.prototype,e),r&&t(n,r),n}}();!function(){function t(){return localforage.getItem("stats").then(function(t){return t=null===t?new h:h.fromObject(t)})}function n(){return localforage.setItem("stats",new h)}function e(){var n=arguments.length>0&&void 0!==arguments[0]&&arguments[0];return t().then(function(t){return t.addAttempt(n),t}).then(function(t){return localforage.setItem("stats",t)})}function r(t){var n=document.querySelector("#stats"),e='\n      <span class="attempts">'+t.attempts+'</span> tries   /\n      <span class="correct" >'+t.correct+'</span> correct /\n      <span class="streak"  >'+t.streak+"</span> streak\n      ";return n.innerHTML=e,t}function a(t){var n=t();return n.then(function(){return a(t)})}function o(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return new Promise(function(e,r){window.setTimeout(function(){return e(n)},t)})}function c(t){return Math.round(Math.random()*t)}function s(t,n){var e=t;if(n<t.length){var r=new Set;for(e=[];e.length<n;){var a=c(t.length);r.has(a)||(r.add(a),e.push(t[a]))}}return e}function i(t,n){var e=document.querySelector("#name");e.innerText=n.name,e.dataset.n=t}function u(t){var n=document.querySelector("#gallery div"),e="";t.forEach(function(t,n){e+='\n        <div class="photo">\n          <div data-n="'+n+'" class="shade"></div>\n          <div class="name">'+t.name+'</div>\n          <img src="'+t.url+'">\n        </div>\n        '}),n.innerHTML=e}function l(t){var n=document.querySelectorAll("#gallery .photo");n.forEach(function(n){n.addEventListener("click",function(n){var a=document.querySelector("#name");a.dataset.n===n.target.dataset.n?(n.target.parentElement.classList.add("correct"),e(!0).then(r),o(3500).then(t)):(n.target.parentElement.classList.add("wrong"),e(!1).then(r))},{once:!0})})}function f(t){var n=s(t,m),e=c(m-1),r=n[e];return new Promise(function(t,a){i(e,r),u(n),l(t)})}function d(){t().then(r),$.getJSON("http://api.namegame.willowtreemobile.com/").done(function(t){return a(function(){return f(t)})})}var m=5,h=function(){function t(){_classCallCheck(this,t),this.attempts=0,this.correct=0,this.streak=0}return _createClass(t,[{key:"addAttempt",value:function(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];this.attempts+=1,t?(this.correct+=1,this.streak+=1):this.streak=0}}],[{key:"fromObject",value:function(n){var e=new t;return e.attempts=n.attempts,e.correct=n.correct,e.streak=n.streak,e}}]),t}();window.Stats=h,window.getStats=t,window.clearStats=n,window.addAttempt=e,window.main=d}();