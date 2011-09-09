/*!
 * Copyright 2010, Vopilovsky Constantin  vflash@ro.ru
 * Date: Fri Aug 19 2011 13:02:37 GMT+0400
 * v1.0.4
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
			d.documentElement.firstChild.appendChild(i);
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
	//'use strict';

	var u, badIE = '\v'=='v' && document.createElement('span').style.opacity === u; // badIE = IE<9

	rr.new_master = function (d, ns) {
		d = d ? d.ownerDocument || d : document;
		if (!ns) ns = {};

		function c_(nn, q) {
			if (nn === 'text') return d.createTextNode(q);
			if (!nn) return;

			var tg, p, a, u, l = arguments.length
			, rn // флаг что это компонент (nodeType < 0)
			, i, x, id, cl, pn, sx, v
			;

			if (q) {
				a = true;
				if (!q.nodeType && typeof q == 'object') {
					if (q.length === u || !isArray(q)) {
						p = q;
						arguments[1] = p.add; //q = p.add;
						if (q === u) a = u;
					};
				};
			} 
			else {
				a = q === 0 || q === '';
			};


			// create element
			switch (nn) {
				case 'body':
					nn = d.body;
					break;

				case 'DocumentFragment':
					nn = d.createDocumentFragment();
					p = false;
					break;

				case 'div': case 'li': case 'br': case 'span': case 'a': case 'td': case 'abbr':
					nn = d.createElement(nn);
					break;

				default:
					i = typeof nn;
					if (i !== 'string') {
						if (i === 'function') {
							if (!nn.prototype.nodeType) nn.prototype.nodeType = -1;
							nn = new nn(this, pr, false);
						};

						if (i = nn.nodeType) rn = i < 0; // кешируем флажок что это обьект не HTMLElement
							else return; // подсунили чтота нето

						break;
					} ;

					i = nn.indexOf(':');
					if (rn = i !== -1) {
						nn = cr(i ? nn.substring(0, i) : 'default', nn.substring(++i), p || false, d, ns, c_);
						if (!nn) return;
						break;
					};

					// tag.className#idNode
					i = nn.indexOf('#');
					if (i > 0) {
						id = nn.substring(i + 1);
						x = i;
					};

					i = nn.indexOf('.');
					if (i > 0) {
						cl = x ? nn.substring(i + 1, x) : nn.substring(i + 1);
						x = i;
					};

					if (x) nn = nn.substring(0, x);

					switch (tg = nn) {
						case 'body':
							nn = d.body;
							break;

						
						case 'input': case 'button':
							if (badIE && p) {
								nn = d.createElement('<' + nn + ' ' + (p.name ? ' name="' + p.name + '"' : '') + (p.type ? ' type="' + p.type + '"' : '') + ' />');
								break;
							};
						default:
							nn = d.createElement(nn);
					};
			};

			
			// set params
			if (p) {
				if (rn) {
					// nn._set_parameters - дает право мастеру изменянять значения через функцию set({key: value, ...})
					if (nn._set_parameters === true && typeof nn.set == 'function') {
						nn.set(p);
					};
				} 
				else {
					for (x in p) {
						v = p[x];
						if (v === u) continue;

						switch (x) {
							//case 'text': if (v || v === '' || v === 0) nn.appendChild(d.createTextNode(v));   
							case 'text':
								if (v || v === '' || v === 0) {
									if (tg !== 'option' || badIE) {
										nn.appendChild(d.createTextNode(v));
									} else nn.text = v;
								};
								break;

							case 'id':
								if (v) id = v;  
								break;

							case 'class': case 'css': case 'className':
								if (v && typeof v === 'string') cl = cl ? cl + ' ' + v : v;
								break;

							case 'style':
								typeof v === 'string' ? nn.style.cssText = v : v && style_set(nn, v);
								break;

							case 'href':
								if (badIE && v && v.indexOf('@') !== -1) {
									// иногда всплывает ошибка. это несовсем удачное решение  
									// проблему нужно сново пересмотреть, как только она вcплывет снова
									v = v.replace(/@/g, '%40');
								};

								nn.href = v;
								break;

							case 'add': case 'parent': case 'before': case 'after':
								break;

							case 'for': case 'colspan': case 'rowspan': case 'cellpadding': case 'cellspacing':
								nn.setAttribute(x, i);
								break;

							default:
								if (badIE)  {
									if ((tg === 'button' || tg === 'input') && (x === 'name' || x === 'type') )
										continue; // bug
								}; 

								if (x.indexOf('~/') === 0) {
									if (x = x.substr(2)) nn.setAttribute(x, i);
								} else {
									nn[x] = v; 
								};
						};
					};
				};
			};

			if (!rn) { // params
				if (cl) nn.className = cl;
				if (id) nn.id = id;
			};



			// append child
			i = a ? 1 : 2;
			if (i < l) {
				pn = nn;
				if (rn && !nn.appendChild) {
					pn = nn.box || nn.node;
					if (!pn) l = u;
				} else sx = rn;

				while (i < l) {
					if (a = arguments[i++]) {
						x = a.nodeType;
						if (x > 0) {
							pn.appendChild(a);
							continue;
						}
						if (x < 0) {
							if (sx) {
								pn.appendChild(a)
							} else if (a = a.node) pn.appendChild(a);
							continue;
						}
					}

					switch (typeof a) {
						case 'number':
							if (a !== a) break;
						case 'string':
							//try {
							pn.appendChild(d.createTextNode(a));
							//} catch (e) {alert(pn);throw e};
							break;

						case 'object':
							if (isArray(a)) {
								append(pn, a, d, sx);
							};
					};
				};
			};


			return p ? p.parent || p.after || p.before ? insert(nn, p, rn) : nn : nn;
		};

		c_.global = ns;
		c_.document = d;

		c_.text = text;
		c_.html = html;

		c_.clone = clone;
		c_.tmpl = tmpl;
		c_.map = c_.forEach = map;

		return c_;
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

	function insert(nn, p, rn) {
		var x, a, ip, ib, pn, i;

		if (rn) {
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
	}


	function append(nn, m, d, s) {
		var i = 0, l = m.length, a, x;

		while (i < l) {

			if (a = m[i++]) {
				x = a.nodeType;

				if (x > 0) {
					nn.appendChild(a);
					continue;
				}

				if (x < 0) {
					if (s) {
						nn.appendChild(a)
					} else if (a = a.node) nn.appendChild(a);
					continue;
				}
			}

			switch (typeof a) {
				case 'number':
					if (a !== a) break;
				case 'string':
					nn.appendChild(d.createTextNode(a));
					break;

				case 'object':
					if (isArray(a)) append(nn, a, d, s);
			}
		}
	}

	function clone(doc) {
		var c = rr.new_master(doc||this.document, this.global);
		c.namespace = this.namespace;
		return c;

		//var ns = this.namespace, c;
		// if (this.clone_namespace === ns && doc === this.document) return this;

		//c = rr.new_master(doc||this.document, this.global);
		//c.namespace = c.clone_namespace = this.namespace;
		//return c;
	}

	/*
	ui - name ui || ui element
	pr - set parament
	doc - document
	ns - local name space
	_cr - constructor element
	*/

	//var _nullprm = {};
	function cr(tp, ui, pr, d, gs, _cr) {
		if (!ui) return;

		var ns = tp === 'default' ? _cr.namespace : gs[tp], x = _cr.namespace, s, c;
		if (!ns) return false;

		if (c = ns[ui]) {
			s = {
				name: ui,
				type: tp,
				document: d,
				namespace: ns,
				varclass: c
			};

			if (typeof c === 'function') {
				_cr.namespace = ns;

				if (!c.prototype.nodeType) c.prototype.nodeType = -1;
				ui = new c(_cr, pr, s);

				_cr.namespace = x;
			}
			else {
				return false;
			};

			return ui;
		};
	};

	function tmpl(nn, pr) {
		switch (typeof nn) {
			case 'function':
				if (!nn.prototype.nodeType) nn.prototype.nodeType = -1;
				return new nn(this, pr, false);

			case 'string':
				break;
			default:
				return;
		}

		var x = nn.indexOf(':'), nx = this.namespace, ns = x > 0 ? this.global[nn.substring(0, x)] : nx;
		if (x === -1 || !ns) return;
		nn = ns[x = nn.substring(++x)];

		if (typeof nn === 'function') {
			this.namespace = ns;

			if (!nn.prototype.nodeType) nn.prototype.nodeType = -1;
			nn = new nn(this, pr, false);

			this.namespace = nx;
			if (nn) return nn;
		};
	};


	// 
	function map(a, func) {
		if (typeof a === 'number' && a === a) {
			a = {
				length: a
			};
		};
		
		if (typeof func !== 'function') return;

		if (!a || !a.length) {
			if (typeof a !== 'number' || !(x > 0)) {
				return
			};

			a = {length: a};
		};
		


		var l = a.length
		, i = 0
		, iend = l - 1
		, m = []
		, e = {
			first: true,
			last: false,
			list: a
		}
		, v, u
		;


		for (; i < l; i++) {
			if (i === iend) e.last = true;
			e.index = i;

			v = func(this, a[i], e);

			if (v || v === 0 || v === '') {
				m.push(v)
			};

			if (!i) e.first = false;
		}

		return m;
	};


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

