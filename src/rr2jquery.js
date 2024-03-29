﻿/*!
 * Copyright 2010, Vopilovsky Constantin  vflash@ro.ru
 * Date: Fri Sep 09 2011 13:50:27 GMT+0400
 * v1.0.5
 */


(function(z){
	var d = document, w = window, nv = navigator, ua = nv.userAgent, v, i, f;

	v = (ua.match(/.+(rv|WebKit|era|MSIE|Safari)[\/: ](\d+(\.\d)?)/)||[])[2] - 0;
	z.Kqn = z.Opera = z.Gecko = z.IE = z.WebKit = z.SWF = z.Chrome = z.Safari = z.Firefox = NaN;

	if (w.opera && opera.buildNumber) {
		z.Opera = (opera.version&&opera.version()||v)-0;
	}
	else if (/Konqueror/.test(ua)) {
		z.Kqn = (+(ua.match(/Konqueror\/(\d+)/)||false)[1])||3;
	}
	else if (/WebKit/.test(ua)) {
		z.WebKit = (+(ua.match(/AppleWebKit\/(\d+)/)||false)[1])||533;

		if (i = ua.match(/Chrome\/(\d+(\.\d)?)/) ) {
			z.Chrome = +i[1];
		}
		else if (i = /Safari/.test(ua) && ua.match(/Version\/(\d+(\.\d)?)/) )
			z.Safari = +i[1];
	}
	else if (/Gecko/.test(ua)) {
		if (i = ua.match(/rv:\d+\.\d+\.(\d)/)) if (i = i[1]/100) v+=i;
		z.Gecko = (v < 1.9 && d.getElementsByClassName ? 1.9 : v) || 1.9;
		if (i = ua.match(/Firefox\/(\d+(\.\d)?)/) ) z.Firefox = +i[1];
	}
	else if (/xplorer/.test(nv.appName)) {
		z.IE = d.documentMode || v || 8;
		z.qIE = d.compatMode != 'CSS1Compat';
	}
	else z.Gecko = 1.9;

	// test flash
	try {f = !z.Kqn && (/(\d+(\.\d+)?)/).exec(nv.mimeTypes['application/x-shockwave-flash'].enabledPlugin.description)[1]||false
	} catch (e) {f = false};

	if (!f && z.IE && w.ActiveXObject) {
		try {f = (/WIN\s+(\d+)/).exec(new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version'))[1]
			} catch (e) {};
	};

	if (f) z.SWF = +f || NaN;

	z.is_mobile = /Mobile/.test(ua);
	z.is_j2me = /J2ME[\/]/.test(nv.appVersion);

	z.osWin = /Windows/.test(ua);
	z.osMac = /Mac OS/.test(ua);
	z.osLnx = /Linux/.test(ua);
})(this.rr||this.jQuery);


jQuery.extend({
	/*
	pr.src - url flash application
	pr.parent - parent node // parent.appendChild(new_swf)
	pr.ieFSCommand - flag true|false, for FSCommand
	*/
	createSWF: function(pr, d) {
		if (!pr || !pr.src) return;
		d = (pr.parent && pr.parent.ownerDocument) || d || pr.document || document;

		function apIE(n, nm, v) {
			var x = d.createElement('param');
			x.name = nm;
			x.value = v;
			n.appendChild(x);
		}

		var sd, x, i, tv
		, n = d.createElement(this.IE < 9 
			? '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" name="' + (pr.name || '~z ' + d.createElement('span').uniqueID) + '">' 
			: this.IE  ? 'object' : 'embed' //object
			)
		;

		if (!this.IE) n.type = 'application/x-shockwave-flash';

		if (this.IE && pr.ieFSCommand) {
			i = d.createElement('script');
			i.event = 'FSCommand(command,args)';
			i.htmlFor = n.name;
			i.text = 'eval(args)'; // type='text/javascript'
			//d.documentElement.firstChild.appendChild(i);
			d.getElementsByTagName('head')[0].appendChild(i);
		}

		for (i in pr) {
			x = pr[i];
			switch (i = i.toLocaleLowerCase()) {
				case 'vars':
					if (pr.flashvars) break;
					i = 'flashvars';
				case 'flashvars': case 'menu': case 'quality': case 'scale': case 'wmode': case 'bgcolor': case 'swliveconnect': case 'allowscriptaccess': case 'allowfullscreen': case 'seamlesstabbing': case 'allownetworking':
					if ((tv = typeof x) == 'string' || tv == 'number' || tv == 'boolean') {
						this.IE ? apIE(n, i, x) : n.setAttribute(i, x);
					};
					break;

				case 'id': case 'className': case 'width': case 'height':
					if (x || x === 0) n[i] = x;
					break;

				case 'style':
					if (typeof x === 'string') nn.style.cssText = x;
					break;
			}
		}


		if (x = this.Gecko && pr.parent && n.style) {
			sd = x.display;
			x.display = 'none';
		}

		if (x = pr.src) this.IE < 9 ? apIE(n, 'movie', x) : this.IE ? n.data = x : n.src = x;
		

		if (x = pr.parent) {
			x.appendChild(n);
			if (x = this.Gecko) n.style.display = sd || '';
			if (x || this.Opera) n.offsetParent;
		}

		return n;
	},

	/*
	cfg {function|object|false}
	cfg.event {function(src, true|false)}
	cfg.defer {false|default true}
	cfg.rm {boolean} removing tag
	cfg.document {document}
	cfg.charset {string|fasle} , def utf-8
	*/
	appendScript: function(src, cfg) {
		cfg = cfg ? typeof cfg === 'function' ? {
			event: cfg
		} : this.newPrototype(cfg) : false;
		

		var d = cfg.document || document, h = d.getElementsByTagName('head')[0], s = d.createElement('script'), ok;
		s.charset = cfg.charset || 'utf-8';
		s.type = 'text/javascript';
		if (cfg.defer !== false) s.defer = 'defer';

		function q() {
			if (!ok) {
				ok = true;
				s.onreadystatechange = s.onload = s.onerror = null;
				if (cfg.event) cfg.event(src, true);
				if (cfg.rm || cfg.remove) h.removeChild(s);
			}
		};

		if (cfg.event) {

			if (rr.IE) s.onreadystatechange = function () {
				switch (s.readyState) {
					case 'complete': case 'loaded':
						q()
				}
			}
			else s.onload = q;

			s.onerror = function () {
				s.onreadystatechange = s.onload = s.onerror = null;
				ok = true;
				if (cfg.event) cfg.event(src, false);
				if (cfg.rm || cfg.remove) h.removeChild(s);
			};
		};

		s.src = src;
		s = h.insertBefore(s, h.firstChild);
	}
});




(function (rr) {
	'use strict';

	var u, badIE = '\v'=='v' && document.createElement('span').style.opacity === u; // badIE = IE<9

	// по умолчанию все параметры вставляются через nn.setAttribute(x, v);
	// за исключением приведенного списка и параметров начинаюшиеся с символа "_" пример {_xxxx: 333}
	var attr_to_param = { constructor: null
		, 'name': badIE ? null : 'name'
		, 'type': badIE ? null : 'type'
		, 'title': 'title'
		, 'value': 'value'
		, 'width': 'width'
		, 'height': 'height'
		, 'src': 'src'
		, 'href': 'href'
		, 'rel': 'rel'
		, 'cellPadding': 'cellPadding'
		, 'cellpadding': 'cellPadding'
		, 'cellSpacing': 'cellSpacing'
		, 'cellspacing': 'cellSpacing'
		, 'colSpan': 'colSpan'
		, 'colspan': 'colSpan'
		, 'rowSpan': 'rowSpan'
		, 'rowspan': 'rowSpan'
		, 'border': 'border'
		, 'content': 'content'
		, 'bgColor': 'bgColor'
		, 'bgcolor': 'bgColor'
		, 'valign': 'vAlign'
		, 'vAlign': 'vAlign'
		, 'color': 'color'
		, 'abbr': 'abbr'
		, 'align': 'align'
		, 'httpEquiv': 'httpEquiv'
		, 'http-equiv': 'httpEquiv'
		, 'tabIndex': 'tabIndex'
		, 'tabindex': 'tabIndex'
		, 'zIndex': 'zIndex'
		, 'zindex': 'zIndex'
	};


	rr.new_master = function (d, ns) {

		function master(nn, q) {
			if (nn === 'text') return d.createTextNode(q); // в ж. этот функционал . нужно использовать _.text("eeeeee")
			if (!nn) return;

			var tag, a, u, l = arguments.length
			, params = false
			, arg_length = arguments.length
			, append_index = 1 // с какого аргумента наченаются потомки
			, is_group // флаг что это группа (nodeType < 0)
			, i, x, id, css, pn, sx, v
			;

			if (q && !q.nodeType && typeof q == 'object') {
				if (q.length === u || !isArray(q)) {
					params = q;
					append_index = 2; // потомки с 3-го аргумента
				};
			};


			// create element
			switch (nn) {
				case 'body':
					nn = d.body;
					break;

				case 'DocumentFragment':
					nn = d.createDocumentFragment();
					params = false;
					break;

				case 'div': case 'li': case 'br': case 'span': case 'a': case 'td': case 'abbr':
					nn = d.createElement(tag = nn);
					break;

				default:
					i = typeof nn;
					if (i !== 'string') {
						if (i === 'function') {
							if (!nn.prototype.nodeType) nn.prototype.nodeType = -1;
							nn = new nn(master, params, false);

							i = nn.nodeType;
							is_group = i < 0;
							if (!is_group) params = false;
						} else {
							i = nn.nodeType;
							is_group = i < 0;
						};
						
						if (!i) return nn;
						break;
					} ;

					
					if (nn.indexOf(':') !== -1) {
						i = nn.indexOf(':');
						nn = create_group(nn.substring(0, i), nn.substring(++i), params || false, d, ns, master);
						if (!nn || !(i=nn.nodeType)) return nn;

						is_group = i < 0;
						if (!is_group) params = false; // выставлять параметры нет нужды за это отвечает конструктор
						break;
					};

					// tag.className className#idNode
					if (nn.indexOf('#') > 0) {
						x = nn.indexOf('#');
						id = nn.substring(x + 1);
					} else {
						x = u;
					};

					i = nn.indexOf('.');
					if (i > 0) {
						css = x ? nn.substring(i + 1, x) : nn.substring(i + 1);
						x = i;
					};

					if (x) {
						nn = nn.substring(0, x);
					};

					nn = (tag = nn) !== 'body' ? d.createElement(nn) : d.body;
			};

			
			// set params
			if (params) {
				if (is_group) {
					// nn._set_parameters - дает право мастеру изменянять значения через функцию set({key: value, ...})
					if (nn._set_parameters === true && typeof nn.set == 'function') {
						nn.set(params);
					};
				} 
				else {
					for (x in params) {
						v = params[x];

						if (v === u || v === null) continue;

						if (i = attr_to_param[x]) {
							nn[i] = v;
							continue;
						};

						switch (x) {
							case 'text': 
								if (v || v === '' || v === 0) {
									nn.appendChild(d.createTextNode(v));
								};
								break;

							case 'id':
								if (v) id = v;
								break;

							case 'class': case 'css':
								if (v) css = css ? css + ' ' + v : v;
								break;

							case 'style':
								typeof v === 'string' ? nn.style.cssText = v : v && style_set(nn, v);
								break;

							case 'parent': case 'before': case 'after':
								break;

							case 'onclick': case 'onmousedown': case 'onmouseup': case 'onmousemove': case 'onchange': case 'onsubmit': case 'onresize': case 'onscroll':
								if (typeof v === 'function') {
									nn[x] = v;
								} else {
									nn.setAttribute(x, v);
								};
								break;

							default:
								if (x.indexOf('_') === 0) {
									nn[x] = v; 
								} else {
									nn.setAttribute(x, v);
								};
						};
					};
				};
			};

			if (!is_group) { // params
				if (css) nn.className = css;
				if (id) nn.id = id;
			};
			

			if (is_group) {
				sx = typeof nn.appendChild === 'function';
				if (!sx) {
					pn = nn.box || nn.node || false;
					if (pn.nodeType > 0) {
						append_nativ(d, pn, arguments, append_index);
					};
				} else {
					append_other(d, nn, arguments, append_index);
				};
			} else {
				append_nativ(d, nn, arguments, append_index);
			};

			return params ? params.parent || params.after || params.before ? insert(nn, params, is_group) : nn : nn;
		};

		d = d ? d.ownerDocument || d : document;

		master.global = ns || (ns = {});
		master.document = d;

		master.text = text;
		master.html = html;
		master.map = map;
		master.set = set;

		master.clone = clone; // отказ от контекста делает ее почти ненужным. Позволяет сделать клон мастера для другого докумета.
		master.tmpl = tmpl; // позволяет создать обьект "группы" с явным указанием параметра вторым ургументом. // нужно доработать идиологию

		master.forEach = map; // для совместимости. будет удален

		return master;
	};


	var isArray = Array.isArray || new function (o) {
		var x = Object.prototype.toString, s = x.call([]);
		return function (o) {
			return x.call(o) === s
		}
	};


	function text(x) {
		return this.document.createTextNode(x || (x === 0 ? 0 : ''))
	}

	var N2A;
	try {
		N2A = Array.prototype.slice.call(document.documentElement.childNodes) instanceof Array
	} catch (e) { }

	function html(x) {
		var n = this.nullNode || (this.nullNode = this.document.createElement('div')), a, i;
		n.innerHTML = x;
		n = n.childNodes;

		if (i = n.length) {
			if (N2A) return Array.prototype.slice.call(n);

			for (a = []; i--; ) a[i] = n[i];
			return a
		}
	}

	function insert(nn, p, is_group) {
		var x, a, ip, ib, pn, i;

		if (is_group) {
			if (x = p.parent) {
				if (i = x.nodeType) {
					if (i < 0 && x.appendChild) {
						x.appendChild(nn)
					}
					else {
						x = i < 0 ? x.box || x.node : x;
						pn = nn.nodeType < 0 ? nn.node : nn
						if (x && pn) x.appendChild(pn);
					}
				}
			}
			return nn;
		}

		// insert
		if (a = p.after) {
			ib = a.nextSibling;
			if (!ib) ip = a.parentNode;
		};

		if (a = p.parent || ip)
			return a.appendChild(nn);

		if (a = p.before || ib)
			return a.parentNode.insertBefore(nn, a);

		return nn;
	};

	function append_nativ(d, pn, m, si) {
		var i = si, l = m.length, a, x;

		while(i < l) {
			a = m[i++];
			
			if (a) {
				x = a.nodeType;
				if (x > 0) {
					//try {
					pn.appendChild(a);
					//} catch(e) {
						//alert(pn === a)
						//alert(e)
						//alert(a)
						
					//}					
					continue;
				}
				else if (x < 0) {
					if (a = a.node) {
						pn.appendChild(a);
					};
					continue
				};
			}
			else if (a !== 0) {
				continue;
			};
			
			
			switch (typeof a) {
				case 'number': if (a !== a) break;
				case 'string':
					pn.appendChild(d.createTextNode(a));
					break;

				case 'object':
					if (isArray(a)) append_nativ(d, pn, a, 0);
			};
		};
	};

	// у обьекта свой способ добавления потомков
	function append_other(d, nn, m, si) {
		var i = si, l = m.length, a, x;
		
		while(i < l) {
			a = m[i++];
			if (a) {
				if (a.nodeType) {
					nn.appendChild(a);
				};
			} 
			else if (a !== 0) {
				continue;
			};

			switch (typeof a) {
				case 'number': if (a !== a) break;
				case 'string':
					nn.appendChild(d.createTextNode(a));
					break;

				case 'object':
					if (isArray(a)) append_other(nn, a);
			};

		};
	};


	// так как отказался от контекста этот функционал считаю устаревшим
	function clone(doc) {
		var c = rr.new_master(doc||this.document, this.global);
		return c;
	};

	
	/*
	ui - name ui || ui element
	pr - set parament
	doc - document
	ns - local name space
	master - constructor element
	*/


	function create_group(type, ui, p, d, gs, master) {
		var ns = gs[type]||false, c, u;

		if (c = ns[ui]) {
			if (typeof c === 'function') {
				if (!c.prototype.nodeType) c.prototype.nodeType = -1;
				ui = new c(master, p ); //, {name: ui, type: tp, document: d, uiclass: c}
				return ui;
			};
		};
	};

	// установка атрибутов у элемента. без ограничений
	function set(nn, p) {
		if (!nn || nn.nodeType !== 1) return; // 
		var u, x, v, i;

		for (x in params) {
			v = params[x];

			if (v === u || v === null) continue;

			if (i = attr_to_param[x]) {
				nn[i] = v;
				continue;
			};

			switch (x) {
				case 'id':
					nn.id = String(v);
					break;

				case 'class': case 'css':
					nn.className = String(v);
					break;

				case 'style':
					if (i = nn.style) i.cssText = String(v);
					break;

				case 'onclick': case 'onmousedown': case 'onmouseup': case 'onmousemove': case 'onchange': case 'onsubmit': case 'onresize': case 'onscroll':
					if (typeof v === 'function') {
						nn[x] = v;
					} else {
						nn.setAttribute(x, v);
					};
					break;

				default:
					if (x.indexOf('_') === 0) {
						nn[x] = v; 
					} else {
						nn.setAttribute(x, v);
					};
			};
		};
		
	};

	// эксперементальный функционал. 
	function tmpl(nn, p) {
		switch (typeof nn) {
			case 'function':
				if (!nn.prototype.nodeType) nn.prototype.nodeType = -1;
				return new nn(this, p);

			case 'string': break;
			default: return;
		};

		var x = nn.indexOf(':'), ns = this.global[nn.substring(0, x)], c;
		if (!ns) return;

		c = ns[nn.substring(x+1)];

		if (typeof c === 'function') {
			if (!c.prototype.nodeType) c.prototype.nodeType = -1;
			if (nn = new c(this, p)) {
				return nn;
			};
		};
	};


	function map(a, func) {
		if (!a || typeof func !== 'function') {
			return;
		};

		if (typeof a === 'number') {
			a = {length: a};
		};

		var l = a.length
		, i = 1
		, iend = l - 1
		, m = []
		, e = {first: true, last: false, list: a, index: 0} //, master: this
		, v, u
		;


		if (0 < l) {
			v = func(a[0], e, this);
			if (v || v === 0 || v === '') {
				m.push(v)
			};

			e.first = false;
		};

		for (; i < l; i++) {
			if (i === iend) e.last = true;
			e.index = i;

			v = func(a[i], e, this);
			if (v || v === 0 || v === '') {
				m.push(v)
			};
		};

		return m;
	};

	// думаю оставить или нет. ну удаляю из за совместимости
	function style_set(n, pr) {
		var st = n.style, x, a, und;

		x = pr.cssText;
		if (x || x === '') st.cssText = x;

		if (badIE) {
			x = pr.opacity;

			if (x || x === 0 || x === '') {
				if (a = typeof n.filters !== 'object' ? null : n.filters['DXImageTransform.Microsoft.alpha'] || n.filters.alpha) {
					if (a.enabled = x !== '') a.opacity = Math.round(x * 100);
				}
				else if (x !== '') {
					st.filter += 'alpha(opacity=' + Math.round(x * 100) + ')';
				};
			};
		};

		for (x in pr) {
			if (x !== 'cssText') {
				st[x] = pr[x];
			};
		};
	};

})(this.jQuery);

