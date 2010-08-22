/*!
 * Copyright 2010, Vopilovsky Constantine  vflash@ro.ru
 * Date: Wed Jul 14 2010 12:11:56 GMT+0400
 * v1.0.2
 */


new function(){
	var z = jQuery, d = document, w = window, nv = navigator, ua = nv.userAgent, v, i, f;

	v = (ua.match(/.+(rv|WebKit|era|MSIE|Safari)[\/: ](\d+(\.\d)?)/)||[])[2] - 0;
	z.Kqn = z.Opera = z.Gecko = z.IE = z.WebKit = z.SWF = z.Chrome = z.Safari = z.Firefox = NaN;

	if (w.opera && opera.buildNumber) {
		z.Opera = (opera.version&&opera.version()||v)-0;
		}
	else if (/Konqueror/.test(ua)) {
		z.Kqn = 3;
		}
	else if (/WebKit/.test(ua)) {
		z.WebKit = parseInt(v, 10);
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
		z.qIE = d.compatMode != "CSS1Compat";
		}
	else z.Gecko = 1.9;

	// test flash
	try {f = !z.Kqn && (/(\d+(\.\d+)?)/).exec(nv.mimeTypes["application/x-shockwave-flash"].enabledPlugin.description)[1]||false
		} catch (e) {f = false};

	if (!f && z.IE && w.ActiveXObject) {
		try {f = (/WIN\s+(\d+)/).exec(new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version"))[1]
			} catch (e) {};
		};

	if (f) z.SWF = +f || NaN;

	z.is_mobile = /Mobile/.test(ua);
	z.is_j2me = /J2ME[\/]/.test(nv.appVersion);

	z.osWin = /Windows/.test(ua);
	z.osMac = /Mac OS/.test(ua);
	z.osLnx = /Linux/.test(ua);
	};


jQuery.extend({
	document: document, // for nado

	setStyle: function(n, pr) {
		if (!n) return;
		var st = n.style, x, v, u;

		switch(typeof pr) {
			case 'object':
				x = pr.cssText;
				if (x || x==="") {
					this.Opera<9 ? n.setAttribute('style', x) : st.cssText = x;
					};

				if (this.IE < 8) {
					if ((x = pr.opacity)  !== u) {
						st.filter = x!=='' ? 'alpha(opacity='+Math.round(x*100)+')' : '';
						};
					};

				for (x in pr) {
					v = pr[x];
					if (x !== 'cssText' && v !== u) {
						st[x] = pr[x];
						};
					};
				return;

			case 'string':
				this.Opera<9 ? n.setAttribute('style', pr) : st.cssText = pr;
			};
		},

	/*
	pr.src - url flash application
	pr.parent - parent node // parent.appendChild(new_swf)
	pr.ieFSCommand - flag true|false, for FSCommand
	*/
	createSWF: function(pr, d) {
		if (!pr || !pr.src) return;
		d = (pr.parent&&pr.parent.ownerDocument)||d||pr.document||this.document;

		function apIE(n, nm, v) {
			var x = d.createElement('param');
			x.name = nm;
			x.value = v;
			n.appendChild(x);
			};

		var sd, x, i, tv, n = d.createElement(this.IE<9 ? '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" name="'+(pr.name||'~z '+d.createElement('span').uniqueID)+'">' : 'embed');
		if (!(this.IE<9)) n.type = 'application/x-shockwave-flash';

		if (this.IE && pr.ieFSCommand) {
			i = d.createElement('script');i.event="FSCommand(command,args)";i.htmlFor=n.name;i.text="eval(args)";// type="text/javascript"
			d.documentElement.firstChild.appendChild(i);
			};

		for(i in pr) {
			x = pr[i];
			switch(i = i.toLocaleLowerCase()) {
				case 'vars': if (pr.flashvars) break; i = 'flashvars';
				case'flashvars':case'menu':case'quality':case'scale':case'wmode':case'bgcolor':case'swliveconnect':case'allowscriptaccess':case'allowfullscreen':case'seamlesstabbing':case'allownetworking':
				if ((tv = typeof x) == 'string' || tv == 'number' || tv == 'boolean') {
					this.IE<9 ? apIE(n, i, x) : n.setAttribute(i, x) ;
					};
				break;
				case 'id': case 'className': case 'width': case 'height': if (x || x===0) n[i] = x;break;
				case 'style': this.setStyle(n, x); break;
				};
			};


		if (x = this.Gecko && pr.parent && n.style) {
			sd = x.display;
			x.display = 'none';
			};

		if (x = pr.src) this.IE<9 ? apIE(n, 'movie', x) : n.src = x;

		if (x = pr.parent) {
			x.appendChild(n);
			if (x = this.Gecko) n.style.display = sd||'';
			if (x || this.Opera) n.offsetParent;
			};

		return n;
		},

	/*
	cfg.defer - flag defer
	cfg.document - ..
	cfg.charset - default "utf-8"
	cfg.rm - flag, auto remove script node
	cfg.event - function event onload script. cfg.event(src, true|false);
	*/
	appendScript: function(src, cfg) {
		cfg = cfg||false;
		var d = cfg.document||this.document, h = d.documentElement.firstChild, s = d.createElement('script'), ok;
		s.charset = cfg.charset||"utf-8";
		s.type = 'text/javascript';
		if (cfg.defer) s.defer = 'defer';

		if (cfg.event) {
			function q() {
				if (!ok) {
					ok = true;
					s.onreadystatechange = s.onload = s.onerror = null;
					if (cfg.event) cfg.event(src, true);
					if (cfg.rm) h.removeChild(s);
					}
				};

			if (this.IE) s.onreadystatechange = function() {
				switch(s.readyState){
					case'complete':case'loaded':q()
					}
				}
			else s.onload = q;

			s.onerror = function() {
				s.onreadystatechange = s.onload = s.onerror = null; ok = true;
				if (cfg.event) cfg.event(src, false);
				if (cfg.rm) h.removeChild(s);
				};
			};

		s.src = src;
		s = h.insertBefore(s, h.firstChild);
		}
	});





(function() {
	var rr = jQuery;

	rr.new_master = function(d, ns) {
		d = d&&d.ownerDocument||d||rr.document;
		if (!ns) ns = {};

		function c_(nn, q) {
			if (nn === 'text') return d.createTextNode(q);
			if (!nn) return;

			var tg, p, a, u, l = arguments.length, i, x, id, cl, rn, pn, sx;

			if (q) {
				a = true;

				if (!q.nodeType && typeof q == 'object') {
					if (q.length === u || !(q instanceof Array)) {
						p = q;
						q = p.add;
						if (q === u) a = u;
						};
					};

				} else a = q===0 || q==='';



			// create element
			switch (nn) {
				case 'span':case 'a':case 'div':case 'td': //case 'SPAN':case 'A':case 'DIV':case 'TD':case 'input':
				//case 'tr':case 'br':case 'dd':case 'ul':case 'script':case 'style':
				x = true;
				break;

				default:

				if (typeof nn !== 'string') {
					if (rn = nn.nodeType < 0) {
						if (p && typeof nn.set == 'function') {
							ui.set(p);
							};
						};
					break;
					};

				i = nn.indexOf(":");
				if (rn = i !== -1)  {
					nn = cr(i ? nn.substring(0, i) : 'default', nn.substring(++i), p||false, d, ns, c_);
					if (!nn) return;
					break;
					};


				// tag.className#idNode
				i = nn.indexOf("#");
				if (i > 0)  {
					id = nn.substring(i+1);
					x = i;
					};

				i = nn.indexOf(".");
				if (i > 0)  {
					cl = x ? nn.substring(i+1, x) : nn.substring(i+1);
					x = i;
					};

				if (x) {nn = nn.substring(0, x)} else x = true;
				};

			if (x)
			switch (nn) {
				case 'BODY':
				case 'body':
				nn = d.body;
				break;
				case 'BUTTON':
				case 'button': nn = tg = 'button';
				case 'INPUT':
				case 'input':
				if (rr.IE<9 && p) {
					nn = d.createElement('<'+nn+' '+(p.name?' name="'+p.name+'"':'')+(p.type?' type="'+p.type+'"':'')+' />');
					break;
					};

				default:
				nn = d.createElement(nn);
				};

			// set param
			if (!rn) {
				if (p) {
					for(x in p) {
						i = p[x];
						if (i === u) continue;

						switch (x) {
							case 'text': if (i || i === '' || i === 0) nn.appendChild(d.createTextNode(i));
							case 'parent':
							//case 'before':
							case 'add':
							case 'appendChild':
							case 'insertAfter':
							case 'insertBefore':
							break;

							case 'id': if (i) id = i; break; // || i===0
							case 'className':case 'css': if (i) cl = cl ? cl+" "+i: i; break; // || i===0
							case 'style': if (typeof i === 'string') {nn.style.cssText = i} else if (i) rr.setStyle(nn, i); break;
							case 'href': if(rr.IE && i && i.indexOf('@')!==-1) i = i.replace('@', '%40'); nn.href = i; break;

							default: if (rr.IE < 9 && tg==='button') continue;
							//try {
							nn[x] = i;
							//} catch (e) {alert(nn+"  "+x+": "+i)};
							};
						};

					};

				if (cl) nn.className = cl;
				if (id) nn.id = id;
				};

			i = a ? 1 : 2;
			if (i<l) {
				pn = nn;
				if (rn && !nn.appendChild) {
					pn = nn.box||nn.node;
					if (!pn) l = u;
					} else sx = rn;

				while(i<l) {
					if (a = arguments[i++]) {
						x = a.nodeType;
						if (x>0) {
							pn.appendChild(a);
							continue;
							};

						if (x<0) {
							if (sx) {pn.appendChild(a)} else if (a = a.node) pn.appendChild(a);
							continue;
							};
						};

					switch (typeof a) {
						case 'number':
						if (!a && a !== 0) break;
						case 'string':
						//try {
						pn.appendChild(d.createTextNode(a));
						//} catch (e) {alert(pn);throw e};
						break;

						case 'object':
						if (a.length !== u && a instanceof Array) {
							append(pn, a, d, sx);
							};
						};
					};
				};


			return p ? p.parent || p.insertBefore || p.insertAfter ? insert(nn, p, rn) : nn : nn;
			};

		c_.global = ns;
		c_.document = d;

		//c_.e = d.masterElement||rr.cr_(d);
		c_.text = text;

		c_.clone = clone;
		c_.tmpl = tmpl;
		c_.forEach = forEach;

		return c_;
		};



	function text(x) {
		return this.document.createTextNode(x || (x===0 ? 0 : ''))
		};

	function insert(nn, p, rn) {
		var x, a, ip, ib;

		if (rn) {
			if (x = p.parent) {
				if (i = x.nodeType) {
					if (i<0 && x.appendChild) {
						x.appendChild(nn)
						}
					else {
						x = i < 0 ? x.box||x.node : x;
						pn = nn.nodeType < 0 ? nn.node : nn
						if (x && pn) x.appendChild(pn);
						};
					};
				};
			return nn;
			};

		// insert
		if (p.insertAfter) {
			a = p.insertAfter;
			ib = a.nextSibling;
			if (!ib) ip = a.parentNode;
			};

		if (a = p.parent||p.appendChild||ip)
			return a.appendChild(nn);

		if (a = p.insertBefore||ib)
			return a.parentNode.insertBefore(nn, a);

		return nn;
		};


	function append(nn, m, d, s) {
		var i = 0, l = m.length, a, x;

		while(i<l) {
			a = m[i++];
			x = a && a.nodeType;

			if (x>0) {
				nn.appendChild(a);
				continue;
				};

			if (x<0) {
				if (s) {nn.appendChild(a)} else if (a = a.node) nn.appendChild(a);
				continue;
				};

			switch (typeof a) {
				case 'number': if (!a && a !== 0) break;
				case 'string':
				nn.appendChild(d.createTextNode(a));
				break;

				case 'object':
				if (a instanceof Array) append(nn, a, d, s);
				};
			};
		};

	function clone() {
		var ns = this.namespace, c;
		if (this.clone_namespace === ns) return this;

		c = rr.cr_master(this.document, this.global);
		c.namespace = c.clone_namespace = this.namespace;
		return c;
		};




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
		if (!ns) return false; //tp = 'rui', ns = rr.ui_library;

		if (c = ns[ui]) {
			s = {name: ui, type: tp, document: d, namespace: ns, interface: c};

			if (typeof c === 'function') {
				_cr.namespace = ns;
				if (!c.prototype.nodeType) c.prototype.nodeType = -1;
				ui = new c(pr, _cr, s);
				} else return false;
			_cr.namespace = x;


			if (ui) {
				if (pr && ui.nodeType<0 && typeof ui.set == 'function') {
					ui.set(pr); // rezer case "add": case "parent": case "before":break;
					};

				return ui;
				};

			};
		};


	function tmpl(nn, pr) {
		var x = nn.indexOf(":"), nx = this.namespace, ns = x>0 ? this.global[nn.substring(0, x)] : nx;
		if (x === -1 || !ns) return;
		nn = ns[x = nn.substring(++x)];

		this.namespace = ns;
		switch(typeof nn) {
			case 'function':
				if (!nn.prototype.nodeType) nn.prototype.nodeType = -1;
				nn = new nn(pr, this, false);
				break;

			case 'object':
			default: this.namespace = nx; return;
			};
		this.namespace = nx;
		if (nn) return nn;
		/*
		if (nn) {
			if (pr && nn.nodeType < 0 && typeof nn.set == 'function') nn.set(pr);
			return nn;
			};
		*/
		};

	function nnFn() {};
	function forEach(a, ct) {
		if (!a || !a.length) return
		var l = a.length, i = 0, i2=0, iend = l-1, m = [], pt=nnFn.prototype, x, e, v, u;

		if (!ct.prototype.nodeType) ct.prototype.nodeType = -1;
		e = {first: true, last: false};

		nnFn.prototype = ct.prototype;
		for(; i < l; i++) {
			if (!i) e.first = false;
			if (i === iend) e.last = true;
			e.index = i;

			x = new nnFn;
			v = ct.call(x, a[i], this, e);

			if (v === u) v = x;
			if (v || v === 0 || v === '') {
				m[i2++] = new ct(a[i], this, e);
				};

			//m[i] = new ct(a[i], this, e);
			};
		nnFn.prototype = pt;

		return m;
		}
	})();


