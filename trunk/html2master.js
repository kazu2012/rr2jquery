if (/Gecko\/201/.test(navigator.userAgent) ) {
	document.open();
	document.close();
	};

document.body.innerHTML = "";

(function() {
	var tp = window.typeMaster, nt = window.nullTextNode, root=true;
	var numb = 0, numbShow=0, numbText=0;

	var rgEscape = new RegExp('\\\\|[\"\'\\n\\r]', 'g'), chEscape={'\\':'\\\\', '"':'\\"', "'":"\\'", '\n':'\\n', '\r':'\\r'};

	function rE(A) {return chEscape[A]};
	function pEscape(v){
		return v.replace ? v.replace(rgEscape, rE) : v;
		};

	var rgTrim = /^[\s|\xA0]+|[\s|\xA0]+$/g;
	function trim(v) {
		return v && v.replace ? v.replace(rgTrim, '') : v;
		};

	function trimClassName(v) {
		if (v && v.replace) {
			v = v.replace(rgTrim, '').replace(/[\s\n\r\t]+/g, ' ');
			};
		return v;
		};

	function convert(n, sp, dNone) {
		if (!n) return;
		var tx, tag = (n.nodeName||'').toLocaleLowerCase(), fp, px, v, x, a, i, u;
		if (!sp) sp = '';
		numb++;


		if (!dNone)
		if (x = n.currentStyle || (n.ownerDocument||{}).defaultView.getComputedStyle(n, null)) {
			if (x.display != 'none') {
				numbShow++;
				}
			else dNone = true;
			};

		//'id','className',
		a = ['href','title','src','cellPadding','cellSpacing','border', 'colSpan', 'rowSpan', 'scope','width','height','type', 'name', 'value', 'method', 'action', ''];
		i = 0;
		while(x = a[i++]) {
			if (tag == 'li' && x=='value') continue;
			if (x == 'type' && (tag === 'select' || tag=='textarea' || tag==='button')) continue;


			//if (x==='id' || x==='className') continue;

			v = n[x];
			if ((x == 'colSpan' || x == 'rowSpan') && v == 1) continue;

			if (v || v===0) {
				if (!tx) {tx = "{"} else tx += ", ";

				if (typeof v == 'number') {
					tx += x+': '+v;
					}
				else if (x == 'title' || x === 'value') {
					tx += x+': "'+pEscape(v)+'"'
					}
				else {
					tx += x+": '"+pEscape(v)+"'"
					};
				};
			};

		if (v = n.style && n.style.cssText) {
			if (!tx) {tx = "{"} else tx += ", ";
			tx += "style: '"+pEscape(v)+"'";
			};

		if (v = trimClassName(n.className)) {
			tag+='.'+v;
			};
		if (v = trim(n.id)) {
			tag+='#'+v;
			};


		tx = sp+(root?'':', ')+(tp==2?"['":"_('")+(tag)+"'"+(tx ? ', '+tx+'}' : '');
		sp = sp+'\t';
		root = false;

		if (!window.xx) window.xx=0;


		a = '';
		if (tag !== 'iframe')
		for(x = n.firstChild; x; x = x.nextSibling) {
			v = u;


			switch(x.nodeType) {
				case 3:

					if (v = trim(x.data)||nt) { //||' '
						numb++; numbText++;
						if (!dNone) numbShow++;
						v = sp+', "'+pEscape(v)+'"'
						};
				break;

				case 1:
					switch(x.nodeName) {
						case 'STYLE':case 'SCRIPT':case 'NOSCRIPT':case 'PARAM':break;
						default:

						if (!x.__html2master__) {
							v = convert(x, sp, dNone);
							};
						}
				break;
				};

			if (!v) continue;
			if (!a) {a = '\n'} else a+='\n';
			a += v;
			};

		tx += a ? a + '\n' + sp.substr(1) + (tp==2?']':')') : (tp==2?']':')');
		return tx;
		};

	(function() {
		var d = document, cd = d.createElement('textarea'), x;
		cd.style.cssText="border:3px solid #000000;height:100%;width:100%;z-index:10000;";
		cd.spellcheck = false;

		if (x = window.elementScan) {
			window.elementScan = null;
			var tx = convert(x, '\t');


			cd.value = 'tmpl.xxx = function(_, pr){\n\t// elements: '+numb+', show: '+numbShow+', text:'+numbText+'\n\t// href: '+(window.scan_href||"")+'\n\n'+tx+'\n};';
			d.body.appendChild(cd);
			};
		})();
	})()



if (false) {
	void(function(tp, nt, w) {
		if (w = window.open('', null, 'width=600, height=500, resizable=yes')) {
			var d = w.document, s = d.createElement('script');
			s = d.createElement('script');
			s.charset = 'utf-8';
			s.type = 'text/javascript';
			s.defer = 'defer';

			var hs = location.hash;
			if (hs) {
				hs = hs.indexOf('id:') == 0 ? hs.substring(3) : hs.indexOf('#id:') == 0 ? hs.substring(4) : false;

				hs = hs && document.getElementById(hs);
				if (hs && hs.nodeName =='IFRAME') {
					hs = hs.contentDocument;
					if (hs) hs = hs.body;
					};
				};

			w.elementScan = hs||document.body;
			w.typeMaster = tp;
			w.nullTextNode = nt ? ' ':null;
			w.scan_href = location.href;

			s.src = 'http://vflash.ru/rr2jquery/html2master.js';

			d.body.appendChild(s);
			}

		})(1); // mode 1(js-type) or 2(json-type)
	};


/* bookmarklet url*/
//javascript:void(function(tp,nt){var w=window.open('',null,'width=600,height=500,resizable=yes');if(!w)return;var d=w.document,s=d.createElement('script');s=d.createElement('script');s.charset='utf-8';s.type='text/javascript';s.defer='defer';var hs=location.hash;if(hs){hs=hs.indexOf('id:')==0?hs.substring(3):hs.indexOf('#id:')==0?hs.substring(4):false;hs=hs&&document.getElementById(hs);if(hs&&hs.nodeName=='IFRAME'){hs=hs.contentDocument;if(hs)hs=hs.body;}};w.elementScan=hs||document.body;w.typeMaster=tp;w.nullTextNode=nt?' ':null;w.scan_href=location.href;s.src='http://vflash.ru/html2master.js';d.body.appendChild(s)})(1)


