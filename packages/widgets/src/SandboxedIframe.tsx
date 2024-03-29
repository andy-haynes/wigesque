import {
  initNear,
  initSocial,
  buildEventHandler,
  invokeCallback,
  invokeWidgetCallback,
  buildRequest,
  postMessage,
  postCallbackInvocationMessage,
  postCallbackResponseMessage,
  postWidgetRenderMessage,
  deserializeProps,
  serializeArgs,
  serializeNode,
  serializeProps,
} from '@bos-web-engine-viewer/container';

const NEWLINE_ESCAPE_CHAR = '⁣';

function buildSandboxedWidget({ id, scriptSrc, widgetProps }: { id: string, scriptSrc: string, widgetProps: any }) {
  const widgetPath = id.split('::')[0];
  const jsonWidgetProps = widgetProps ? JSON.stringify(widgetProps).replace(/\\n/g, NEWLINE_ESCAPE_CHAR) : '{}';

  return `
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/near-api-js@2.1.3/dist/near-api-js.min.js"></script>
      </head>
      <body>
        <div id="${id}"></div>
        <script type="module">
          /* BEGIN PREACT FORK */
          !function(){var n,l,u,t,i,o,r,e,f,c,s={},a=[],h=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function v(n,l){for(var u in l)n[u]=l[u];return n}function y(n){var l=n.parentNode;l&&l.removeChild(n)}function d(l,u,t){var i,o,r,e={};for(r in u)"key"==r?i=u[r]:"ref"==r?o=u[r]:e[r]=u[r];if(arguments.length>2&&(e.children=arguments.length>3?n.call(arguments,2):t),"function"==typeof l&&null!=l.defaultProps)for(r in l.defaultProps)void 0===e[r]&&(e[r]=l.defaultProps[r]);return p(l,e,i,o,null)}function p(n,t,i,o,r){var e={type:n,props:t,key:i,ref:o,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==r?++u:r};return null==r&&null!=l.vnode&&l.vnode(e),e}function _(n){return n.children}function m(n,l){this.props=n,this.context=l}function k(n,l){if(null==l)return n.__?k(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return"function"==typeof n.type?k(n):null}function b(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return b(n)}}function g(n){(!n.__d&&(n.__d=!0)&&i.push(n)&&!w.__r++||o!==l.debounceRendering)&&((o=l.debounceRendering)||r)(w)}function w(){var n,l,u,t,o,r,f,c;for(i.sort(e);n=i.shift();)n.__d&&(l=i.length,t=void 0,o=void 0,f=(r=(u=n).__v).__e,(c=u.__P)&&(t=[],(o=v({},r)).__v=r.__v+1,j(c,r,o,u.__n,void 0!==c.ownerSVGElement,null!=r.__h?[f]:null,t,null==f?k(r):f,r.__h),z(t,r),r.__e!=f&&b(r)),i.length>l&&i.sort(e));w.__r=0}function A(n,l,u,t,i,o,r,e,f,c){var h,v,y,d,m,b,g,w=t&&t.__k||a,A=w.length;for(u.__k=[],h=0;h<l.length;h++)if(null!=(d=u.__k[h]=null==(d=l[h])||"boolean"==typeof d||"function"==typeof d?null:"string"==typeof d||"number"==typeof d||"bigint"==typeof d?p(null,d,null,null,d):Array.isArray(d)?p(_,{children:d},null,null,null):d.__b>0?p(d.type,d.props,d.key,d.ref?d.ref:null,d.__v):d)){if(d.__=u,d.__b=u.__b+1,null===(y=w[h])||y&&d.key==y.key&&d.type===y.type)w[h]=void 0;else for(v=0;v<A;v++){if((y=w[v])&&d.key==y.key&&d.type===y.type){w[v]=void 0;break}y=null}j(n,d,y=y||s,i,o,r,e,f,c),m=d.__e,(v=d.ref)&&y.ref!=v&&(g||(g=[]),y.ref&&g.push(y.ref,null,d),g.push(v,d.__c||m,d)),null!=m?(null==b&&(b=m),"function"==typeof d.type&&d.__k===y.__k?d.__d=f=C(d,f,n):f=x(n,d,y,w,m,f),"function"==typeof u.type&&(u.__d=f)):f&&y.__e==f&&f.parentNode!=n&&(f=k(y))}for(u.__e=b,h=A;h--;)null!=w[h]&&("function"==typeof u.type&&null!=w[h].__e&&w[h].__e==u.__d&&(u.__d=P(t).nextSibling),M(w[h],w[h]));if(g)for(h=0;h<g.length;h++)L(g[h],g[++h],g[++h])}function C(n,l,u){for(var t,i=n.__k,o=0;i&&o<i.length;o++)(t=i[o])&&(t.__=n,l="function"==typeof t.type?C(t,l,u):x(u,t,t,i,t.__e,l));return l}function x(n,l,u,t,i,o){var r,e,f;if(void 0!==l.__d)r=l.__d,l.__d=void 0;else if(null==u||i!=o||null==i.parentNode)n:if(null==o||o.parentNode!==n)n.appendChild(i),r=null;else{for(e=o,f=0;(e=e.nextSibling)&&f<t.length;f+=1)if(e==i)break n;n.insertBefore(i,o),r=o}return void 0!==r?r:i.nextSibling}function P(n){var l,u,t;if(null==n.type||"string"==typeof n.type)return n.__e;if(n.__k)for(l=n.__k.length-1;l>=0;l--)if((u=n.__k[l])&&(t=P(u)))return t;return null}function E(n,l,u,t,i){var o;for(o in u)"children"===o||"key"===o||o in l||H(n,o,null,u[o],t);for(o in l)i&&"function"!=typeof l[o]||"children"===o||"key"===o||"value"===o||"checked"===o||u[o]===l[o]||H(n,o,l[o],u[o],t)}function $(n,l,u){"-"===l[0]?n.setProperty(l,null==u?"":u):n[l]=null==u?"":"number"!=typeof u||h.test(l)?u:u+"px"}function H(n,l,u,t,i){var o;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else{if("string"==typeof t&&(n.style.cssText=t=""),t)for(l in t)u&&l in u||$(n.style,l,"");if(u)for(l in u)t&&u[l]===t[l]||$(n.style,l,u[l])}else if("o"===l[0]&&"n"===l[1])o=l!==(l=l.replace(/Capture$/,"")),l=l.toLowerCase()in n?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+o]=u,u?t||n.addEventListener(l,o?T:I,o):n.removeEventListener(l,o?T:I,o);else if("dangerouslySetInnerHTML"!==l){if(i)l=l.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if("width"!==l&&"height"!==l&&"href"!==l&&"list"!==l&&"form"!==l&&"tabIndex"!==l&&"download"!==l&&l in n)try{n[l]=null==u?"":u;break n}catch(n){}"function"==typeof u||(null==u||!1===u&&"-"!==l[4]?n.removeAttribute(l):n.setAttribute(l,u))}}function I(n){return this.l[n.type+!1](l.event?l.event(n):n)}function T(n){return this.l[n.type+!0](l.event?l.event(n):n)}function j(n,u,t,i,o,r,e,f,c){var s,a,h,y,d,p,k,b,g,w,C,x,P,E,$,H=u.type;if(void 0!==u.constructor)return null;null!=t.__h&&(c=t.__h,f=u.__e=t.__e,u.__h=null,r=[f]),(s=l.__b)&&s(u);try{n:if("function"==typeof H){if(b=u.props,g=(s=H.contextType)&&i[s.__c],w=s?g?g.props.value:s.__:i,t.__c?k=(a=u.__c=t.__c).__=a.__E:("prototype"in H&&H.prototype.render?u.__c=a=new H(b,w):(u.__c=a=new m(b,w),a.constructor=H,a.render=N),g&&g.sub(a),a.props=b,a.state||(a.state={}),a.context=w,a.__n=i,h=a.__d=!0,a.__h=[],a._sb=[]),null==a.__s&&(a.__s=a.state),null!=H.getDerivedStateFromProps&&(a.__s==a.state&&(a.__s=v({},a.__s)),v(a.__s,H.getDerivedStateFromProps(b,a.__s))),y=a.props,d=a.state,a.__v=u,h)null==H.getDerivedStateFromProps&&null!=a.componentWillMount&&a.componentWillMount(),null!=a.componentDidMount&&a.__h.push(a.componentDidMount);else{if(null==H.getDerivedStateFromProps&&b!==y&&null!=a.componentWillReceiveProps&&a.componentWillReceiveProps(b,w),!a.__e&&null!=a.shouldComponentUpdate&&!1===a.shouldComponentUpdate(b,a.__s,w)||u.__v===t.__v){for(u.__v!==t.__v&&(a.props=b,a.state=a.__s,a.__d=!1),a.__e=!1,u.__e=t.__e,u.__k=t.__k,u.__k.forEach(function(n){n&&(n.__=u)}),C=0;C<a._sb.length;C++)a.__h.push(a._sb[C]);a._sb=[],a.__h.length&&e.push(a);break n}null!=a.componentWillUpdate&&a.componentWillUpdate(b,a.__s,w),null!=a.componentDidUpdate&&a.__h.push(function(){a.componentDidUpdate(y,d,p)})}if(a.context=w,a.props=b,a.__P=n,x=l.__r,P=0,"prototype"in H&&H.prototype.render){for(a.state=a.__s,a.__d=!1,x&&x(u),s=a.render(a.props,a.state,a.context),E=0;E<a._sb.length;E++)a.__h.push(a._sb[E]);a._sb=[]}else do{a.__d=!1,x&&x(u),s=a.render(a.props,a.state,a.context),a.state=a.__s}while(a.__d&&++P<25);a.state=a.__s,null!=a.getChildContext&&(i=v(v({},i),a.getChildContext())),h||null==a.getSnapshotBeforeUpdate||(p=a.getSnapshotBeforeUpdate(y,d)),$=null!=s&&s.type===_&&null==s.key?s.props.children:s,A(n,Array.isArray($)?$:[$],u,t,i,o,r,e,f,c),a.base=u.__e,u.__h=null,a.__h.length&&e.push(a),k&&(a.__E=a.__=null),a.__e=!1}else null==r&&u.__v===t.__v?(u.__k=t.__k,u.__e=t.__e):u.__e=F(t.__e,u,t,i,o,r,e,c);(s=l.diffed)&&s(u)}catch(n){u.__v=null,(c||null!=r)&&(u.__e=f,u.__h=!!c,r[r.indexOf(f)]=null),l.__e(n,u,t)}}function z(n,u){l.__c&&l.__c(u,n),n.some(function(u){try{n=u.__h,u.__h=[],n.some(function(n){n.call(u)})}catch(n){l.__e(n,u.__v)}})}function F(l,u,t,i,o,r,e,f){var c,a,h,v=t.props,d=u.props,p=u.type,_=0;if("svg"===p&&(o=!0),null!=r)for(;_<r.length;_++)if((c=r[_])&&"setAttribute"in c==!!p&&(p?c.localName===p:3===c.nodeType)){l=c,r[_]=null;break}if(null==l){if(null===p)return document.createTextNode(d);l=o?document.createElementNS("http://www.w3.org/2000/svg",p):document.createElement(p,d.is&&d),r=null,f=!1}if(null===p)v===d||f&&l.data===d||(l.data=d);else{if(r=r&&n.call(l.childNodes),a=(v=t.props||s).dangerouslySetInnerHTML,h=d.dangerouslySetInnerHTML,!f){if(null!=r)for(v={},_=0;_<l.attributes.length;_++)v[l.attributes[_].name]=l.attributes[_].value;(h||a)&&(h&&(a&&h.__html==a.__html||h.__html===l.innerHTML)||(l.innerHTML=h&&h.__html||""))}if(E(l,d,v,o,f),h)u.__k=[];else if(_=u.props.children,A(l,Array.isArray(_)?_:[_],u,t,i,o&&"foreignObject"!==p,r,e,r?r[0]:t.__k&&k(t,0),f),null!=r)for(_=r.length;_--;)null!=r[_]&&y(r[_]);f||("value"in d&&void 0!==(_=d.value)&&(_!==l.value||"progress"===p&&!_||"option"===p&&_!==v.value)&&H(l,"value",_,v.value,!1),"checked"in d&&void 0!==(_=d.checked)&&_!==l.checked&&H(l,"checked",_,v.checked,!1))}return l}function L(n,u,t){try{"function"==typeof n?n(u):n.current=u}catch(n){l.__e(n,t)}}function M(n,u,t){var i,o;if(l.unmount&&l.unmount(n),(i=n.ref)&&(i.current&&i.current!==n.__e||L(i,null,u)),null!=(i=n.__c)){if(i.componentWillUnmount)try{i.componentWillUnmount()}catch(n){l.__e(n,u)}i.base=i.__P=null,n.__c=void 0}if(i=n.__k)for(o=0;o<i.length;o++)i[o]&&M(i[o],u,t||"function"!=typeof n.type);t||null==n.__e||y(n.__e),n.__=n.__e=n.__d=void 0}function N(n,l,u){return this.constructor(n,u)}function O(u,t,i){var o,r,e;l.__&&l.__(u,t),r=(o="function"==typeof i)?null:i&&i.__k||t.__k,e=[],j(t,u=(!o&&i||t).__k=d(_,null,[u]),r||s,s,void 0!==t.ownerSVGElement,!o&&i?[i]:r?null:t.firstChild?n.call(t.childNodes):null,e,!o&&i?i:r?r.__e:t.firstChild,o),dispatchRenderEvent(u),z(e,u)}n=a.slice,l={__e:function(n,l,u,t){for(var i,o,r;l=l.__;)if((i=l.__c)&&!i.__)try{if((o=i.constructor)&&null!=o.getDerivedStateFromError&&(i.setState(o.getDerivedStateFromError(n)),r=i.__d),null!=i.componentDidCatch&&(i.componentDidCatch(n,t||{}),r=i.__d),r)return i.__E=i}catch(l){n=l}throw n}},u=0,t=function(n){return null!=n&&void 0===n.constructor},m.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=v({},this.state),"function"==typeof n&&(n=n(v({},u),this.props)),n&&v(u,n),null!=n&&this.__v&&(l&&this._sb.push(l),g(this))},m.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),g(this))},m.prototype.render=_,i=[],r="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,e=function(n,l){return n.__v.__b-l.__v.__b},w.__r=0,f=0,c={__proto__:null,render:O,hydrate:function n(l,u){O(l,u,n)},createElement:d,h:d,Fragment:_,createRef:function(){return{current:null}},isValidElement:t,Component:m,cloneElement:function(l,u,t){var i,o,r,e=v({},l.props);for(r in u)"key"==r?i=u[r]:"ref"==r?o=u[r]:e[r]=u[r];return arguments.length>2&&(e.children=arguments.length>3?n.call(arguments,2):t),p(l.type,e,i||l.key,o||l.ref,null)},createContext:function(n,l){var u={__c:l="__cC"+f++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var u,t;return this.getChildContext||(u=[],(t={})[l]=this,this.getChildContext=function(){return t},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&u.some(function(n){n.__e=!0,g(n)})},this.sub=function(n){u.push(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){u.splice(u.indexOf(n),1),l&&l.call(n)}}),n.children}};return u.Provider.__=u.Consumer.contextType=u},toChildArray:function n(l,u){return u=u||[],null==l||"boolean"==typeof l||(Array.isArray(l)?l.some(function(l){n(l,u)}):u.push(l)),u},options:l},typeof module<"u"?module.exports=c:self.preact=c}();
          /* END PREACT FORK */

          const { h, render } = window.preact;

          /* generated code for ${widgetPath} */
          const callbacks = {};
          const requests = {};

          ${buildRequest.toString()}
          ${postMessage.toString()}
          ${postWidgetRenderMessage.toString()}
          ${postCallbackInvocationMessage.toString()}
          ${postCallbackResponseMessage.toString()}

          ${deserializeProps.toString()}
          ${serializeArgs.toString()}
          ${serializeNode.toString()}
          ${serializeProps.toString()}

          let lastRenderedNode;
          // FIXME circular dependency between [dispatchRenderEvent] (referenced in Preact fork) and [h] (used to render builtin components) 
          const dispatchRenderEvent = (node) => {
            const serializedNode = serializeNode({
              node,
              h,
              index: -1,
              childWidgets: [],
              callbacks,
              parentId: '${id}',
            });

            // TODO is this a band-aid for cascading renders?
            // TODO compare non-serializable properties
            const stringifiedNode = JSON.stringify(serializedNode);
            if (lastRenderedNode === stringifiedNode) {
              return;
            }
            lastRenderedNode = stringifiedNode;

            const { childWidgets, ...serialized } = serializedNode;

            try {
              postWidgetRenderMessage({
                childWidgets,
                node: serialized,
                widgetId: '${id}',
              });
            } catch (error) {
              console.warn('failed to dispatch render for ${id}', { error, serialized });
            }
          }

          // builtin components must have references defined in order for the Widget to render
          // builtin components are resolved during serialization 
          function Checkbox() {}
          function CommitButton() {}
          function Fragment() {}
          function IpfsImageUpload() {}
          function Dialog() {}
          function DropdownMenu() {}
          function Files() {}
          function InfiniteScroll() {}
          function Markdown() {}
          function OverlayTrigger() {}
          function Tooltip() {}
          function Typeahead() {}
          function Widget() {}

          let isStateInitialized = false;

          /* NS shims */
          function buildSafeProxy(p) {
            return new Proxy(p, {
              get(target, key) {
                try {
                  return target[key];                
                } catch {
                  return undefined;
                }
              }
            });
          }

          let state = buildSafeProxy({});
          let props = buildSafeProxy(deserializeProps({
            buildRequest,
            callbacks,
            postCallbackInvocationMessage,
            props: JSON.parse('${jsonWidgetProps.replace(/'/g, '\\\'').replace(/\\n/g, NEWLINE_ESCAPE_CHAR).replace(/\\"/g, '\\\\"')}'),
            requests,
            widgetId: '${id}',
          }));

          function asyncFetch(url, options) {
            return fetch(url, options)
              .catch(console.error);
          }

          const Near = (${initNear.toString()})({
            renderWidget,
            rpcUrl: 'https://rpc.near.org',
          });

          const Social = (${initSocial.toString()})({
            endpointBaseUrl: 'https://api.near.social',
            renderWidget,
            widgetId: '${id}',
          });

          const React = {
            Fragment: 'div',
          };
          function fadeIn() {}
          function slideIn() {}
          let minWidth;

          const styled = new Proxy({}, {
            get(target, property, receiver) {
              return (css) => {
                return property;
              };
            }
          });

          async function WidgetWrapper() {
            try {
              return await (
                /* BEGIN EXTERNAL SOURCE */
                ${scriptSrc}
                /* END EXTERNAL SOURCE */
              )();
            } catch (e) {
              console.error(e, { widgetId: '${id.split('##')[0]}' });
              return h('div', {}, 'failed to load ${widgetPath.split('##')[0]}: ' + e.toString() + '\\n\\n' + e.stack);
            }
          }
      
          async function renderWidget() {
            try {
              render(await WidgetWrapper(), document.getElementById('${id}'));              
            } catch (e) {
              console.error(e, { widgetId: '${id}' });
            }
          }

          const context = buildSafeProxy({ accountId: props.accountId || 'andyh.near' });
          const State = {
            init(obj) {
              if (!isStateInitialized) {
                state = buildSafeProxy(obj);
                isStateInitialized = true;
              }
            },
            update(newState, initialState) {
              // TODO real implementation
              state = buildSafeProxy({
                ...state,
                ...newState,
              });
            },
          };
          
          renderWidget();

          function preactify(node) {
            if (!node || typeof node !== 'object') {
              return node;
            }

            const { props, type } = node;
            // TODO handle other builtins
            const isWidget = !!props.src?.match(/[0-9a-z._-]{5,}\\/widget\\/[0-9a-z._-]+/ig);
            const { children } = props;

            return h(
              isWidget ? Widget : type,
              { ...props, key: node.key || props.key },
              Array.isArray(children) ? children.map(preactify) : preactify(children)
            );
          }

          function isMatchingProps(props, compareProps) {
            const getComparable = (p) => Object.keys(p)
              .sort()
              .map((propKey) => propKey + '::' + p[propKey])
              .join(',');

            return getComparable(props) === getComparable(compareProps);
          }

          ${invokeCallback.toString()}
          ${invokeWidgetCallback.toString()}
          const processEvent = (${buildEventHandler.toString()})({
            buildRequest,
            callbacks,
            deserializeProps,
            postCallbackInvocationMessage,
            postCallbackResponseMessage,
            renderDom: (node) => preactify(node),
            renderWidget,
            requests,
            serializeArgs,
            setProps: (newProps) => {
              if (isMatchingProps({ ...props }, newProps)) {
                return false;
              }

              props = buildSafeProxy({ ...props, ...newProps });
              return true;
            },
            widgetId: '${id}'
          });

          window.addEventListener('message', processEvent);
        </script>
      </body>
    </html>
  `;
}

export function SandboxedIframe({ id, scriptSrc, widgetProps }: { id: string, scriptSrc: string, widgetProps?: any }) {
  return (
    <iframe
      id={id}
      className='sandboxed-iframe'
      // @ts-expect-error: you're wrong about this one, TypeScript
      csp={[
        'default-src \'self\'',
        'connect-src *',
        'img-src * data:',
        'script-src \'unsafe-inline\' \'unsafe-eval\'',
        'script-src-elem https://cdnjs.cloudflare.com https://cdn.jsdelivr.net http://localhost http://localhost:3001 \'unsafe-inline\'',
        '',
      ].join('; ')}
      height={0}
      sandbox='allow-scripts'
      srcDoc={buildSandboxedWidget({ id: id.replace('iframe-', ''), scriptSrc, widgetProps })}
      title='code-container'
      width={0}
      style={{ border: 'none' }}
    />
  );
}
