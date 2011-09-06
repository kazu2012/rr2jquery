
/*!
  Copyright 2011, Vopilovsky Constantin  vflash@ro.ru
 */

new function () {

	// http://fmarcia.info/jsmin/jsmin.js
	String.prototype.has=function(c){return this.indexOf(c)>-1;};
	function jsmin(comment,input,level){if(input===undefined){input=comment;comment='';level=2;}else if(level===undefined||level<1||level>3){level=2;}if(comment.length>0){comment+='\n';}var a='',b='',EOF=-1,LETTERS='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',DIGITS='0123456789',ALNUM=LETTERS+DIGITS+'_$\\',theLookahead=EOF;function isAlphanum(c){return c!=EOF&&(ALNUM.has(c)||c.charCodeAt(0)>126);}var iChar=0,lInput=input.length;function getc(){var c=theLookahead;if(iChar==lInput){return EOF;}theLookahead=EOF;if(c==EOF){c=input.charAt(iChar);++iChar;}if(c>=' '||c=='\n'){return c;}if(c=='\r'){return'\n';}return' ';}function getcIC(){var c=theLookahead;if(iChar==lInput){return EOF;}theLookahead=EOF;if(c==EOF){c=input.charAt(iChar);++iChar;}if(c>=' '||c=='\n'||c=='\r'){return c;}return' ';}function peek(){theLookahead=getc();return theLookahead;}function next(){var c=getc();if(c=='/'){switch(peek()){case'/':for(;;){c=getc();if(c<='\n'){return c;}}break;case'*':getc();if(peek()=='!'){getc();var d='/*!';for(;;){c=getcIC();switch(c){case'*':if(peek()=='/'){getc();return d+'*/';}break;case EOF:throw'Error: Unterminated comment.';default:d+=c;}}}else{for(;;){switch(getc()){case'*':if(peek()=='/'){getc();return' ';}break;case EOF:throw'Error: Unterminated comment.';}}}break;default:return c;}}return c;}function action(d){var r=[];if(d==1){r.push(a);}if(d<3){a=b;if(a=='\''||a=='"'){for(;;){r.push(a);a=getc();if(a==b){break;}if(a<='\n'){throw'Error: unterminated string literal: '+a;}if(a=='\\'){r.push(a);a=getc();}}}}b=next();if(b=='/'&&'(,=:[!&|'.has(a)){r.push(a);r.push(b);for(;;){a=getc();if(a=='/'){break;}else if(a=='\\'){r.push(a);a=getc();}else if(a<='\n'){throw'Error: unterminated Regular Expression literal';}r.push(a);}b=next();}return r.join('');}function m(){var r=[];a='\n';r.push(action(3));while(a!=EOF){switch(a){case' ':if(isAlphanum(b)){r.push(action(1));}else{r.push(action(2));}break;case'\n':switch(b){case'{':case'[':case'(':case'+':case'-':r.push(action(1));break;case' ':r.push(action(3));break;default:if(isAlphanum(b)){r.push(action(1));}else{if(level==1&&b!='\n'){r.push(action(1));}else{r.push(action(2));}}}break;default:switch(b){case' ':if(isAlphanum(a)){r.push(action(1));break;}r.push(action(3));break;case'\n':if(level==1&&a!='\n'){r.push(action(1));}else{switch(a){case'}':case']':case')':case'+':case'-':case'"':case'\'':if(level==3){r.push(action(3));}else{r.push(action(1));}break;default:if(isAlphanum(a)){r.push(action(1));}else{r.push(action(3));}}}break;default:r.push(action(1));break;}}}return r.join('');}jsmin.oldSize=input.length;ret=m(input);jsmin.newSize=ret.length;return comment+ret;}



	var HL = {};

	function load_use(src, host) {
		var path = src.substr(0, src.split('?')[0].lastIndexOf('/') );


		var u
		, xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP")
		, path = src.substr(0, src.split('?')[0].lastIndexOf('/') )
		, list = []
		, stop
		;


		xhr.open("GET", src, false);
		xhr.send(null);

		if (xhr.status != 200) {
			return {error: 'not load'};
		};

		var func;
		try {
			func = new Function("use", xhr.responseText)
		} catch (e) { }

		if (!func) return {error: 'error code'};


		x = {
			use: function (src, is_list) {
				var r;

				src = src.indexOf('./') === 0 ? (path||host||'') + src.substr(1)
					: src.indexOf('http://') === 0 || src.indexOf('https://') === 0 ? src
					: src.indexOf('/') !== 0 ? (path||host||'') + '/'+src
						: (host||'') + src;

				if (!HL[src]) HL[src]=true; else return;

				if (is_list) {
					r = load_use(src, host);

					if (r.error) {
						list.push({src: src, is_list: true, error: r.error});
					} else {
						list.push({src: src, is_list: true});
						list.push.apply(list, r.list);
					};
				} else
				if (is_list !== false) {
					list.push({src: src, script: true});
				};
			}
		};

		func.call(x, x.use);
		return {list:list};
	};


	// start
	new function() {

		function attr(n, nm) {
			if (n) return n.getAttributeNode ? (n.getAttributeNode(nm) || false).value : n.getAttribute(nm, 2)
			};

		var s = document.currentScript, a, x, i;
		if (!s) {
			a = document.getElementsByTagName('script')||false;
			for(i=0; s = a[i++];) {
				if (!s.us && attr(s, 'data-src') ){
					s.us = true;
					break;
					}
				};
			};

		if (!s) return;

		var host = attr(s, 'data-host') || '';
		var src = attr(s, 'data-src');

		var r = load_use(src, host), m=[], i, x;

		if (!r || r.error) {
			alert('error load ' + src)
			return;
		};

		switch(attr(s, 'data-mode') ) {
			case 'html':
				mode_html(r.list);
				break;

			case 'pack':
				x = (attr(s, 'data-debug')||'').toLocaleLowerCase();
				var use_debug = x == 'true' ? 1 : parseInt(+x, 10) || false;

				x = (attr(s, 'data-debug')||'').toLocaleLowerCase();
				var use_escape = x == 'true' || x == '1';

				mode_pack(r.list, use_debug,  use_escape);
				break;

			case 'script':
			default:
				mode_script(r.list);
		};
	};

	function mode_script(a) {
		var m, x, i;

		for(m = [], i = 0; x = a[i++];) {
			if (x.script) m.push(x.src);
		};

		if (m.length) {
			document.write('<script src="' + m.join('"></script>\n<script src="') + '"></script>');
			//console.log('<script src="' + m.join('"></script>\n<script src="') + '"></script>')
		};
	};

	function getTextarea() {
		var d = document, n = d.createElement('textarea'), ns = {};
		n.setAttribute("spellcheck", "false");
		n.setAttribute("autocomplete", "off");


		n.style.cssText = "border:3px solid #000000;height:36em;width:100%;min-width: 100%;max-width: 100%;z-index:10000;";
		n.id = "textarea";
		n.value = "";
		d.body.appendChild(n);

		ns.textarea = n;

		n = d.createElement('h1')
		n.id = "info";
		d.body.appendChild(n);

		ns.info = n;

		return ns;
	};


	function mode_html(a) {
		window.onload = function () {
			var ns = getTextarea(), m, x, i;



			for(m = [], i = 0; x = a[i++];) {
				if (x.script) m.push(x.src);
			};

			if (m.length) {
				ns.textarea.value = '<script src="' + m.join('"></script>\n<script src="') + '"></script>';
			};
		};

	};

	function mode_pack(a, use_debug, use_escape) {

		function load(x) {
			var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
			xhr.open("GET", x.src, true);

			xhr.onreadystatechange = function () {
				var status = xhr.readyState === 4 ? xhr.status : null;
				if (!status) return;

				if (status != 200) {
					x.complite = true;
					x.error = true;
					return end();
				};

				x.LM = typeof xhr.getAllResponseHeaders !== 'function' ? null : ((xhr.getAllResponseHeaders() + '').match(/Last-Modified: ([^\n]+)/) || false)[1];

				x.text = xhr.responseText;
				x.complite = true;

				end();
			};

			xhr.send(null);
		};

		var complite = false;
		function end() {
			var ns, m, x, i;

			if (complite) return;
			for(i = 0; x = a[i++];) if (x.script && !x.complite) return;

			complite = true;


			var E = [], C = [];

			for(i = 0; x = a[i++];) {
				if (x.error) {
					E.push('/* ERROR: ' + x.src + '  */')
					continue;
				};

				if (x.script) {
					C.push('\n/* URL: ' + x.src + ' */\n' + jsmin("", x.text, 1))
				};
			};

			var code = C.join('\n');


			if (use_escape) {
				code = code.replace(/[\u0080-\uFFFF]/g, function (x) {
					x = x.charCodeAt(0).toString(16).toUpperCase();
					switch (x.length) {
						case 1:
							return "\\x0" + x;
						case 2:
							return "\\x" + x;
						case 3:
							return "\\u0" + x;
						default:
							return "\\u" + x;
					}
				});
			}

			code = code.replace(/};(?=\n[})])/g, "}")
				.replace(/\);(?=\n})/g, ")")
				.replace(/\)\n(?=[\)\}])/g, ")")
				.replace(/\}\n(?=[\)\}])/g, "}")
				;

			if (use_debug) {
				code = "var dg1,dg2; //debug var\n\n"
				+ code.replace(/fu[n]ction\s*[\w]*\([^\(\)]*\)\s*{(?!t[h]row)(?!})/g, function (x) {
					return x + "if(dg1!==" + use_debug + ")dg2=dg1,dg1=" + (use_debug++) + ";"
				})
			}

			x = ('/* BUILD DATE: ' + (new Date()).toUTCString() + '*/\n\n')
				+ (E[0] ? E.join('\n') + '\n\n\n\n\n\n\n\n\n' : '')
				+ code
				;

			var ns = getTextarea();

			ns.textarea.value = x;
			ns.info.innerHTML = x.length + "b";
		};

		window.onload = function () {
			var m = [], i = 0, x;

			for(; x = a[i++];) if (x.script) {
				load(x);
				};
		};
	}

};



