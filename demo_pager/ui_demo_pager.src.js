// extend tmpl pager
tmpl_js.mailbox_pager = function(pr, _) {
	var max = pr.max, num = pr.num, pages=[], A = 1, B, i;

	max  = pr.max > 1 ? pr.max : 1;
	num = num > 1 ? (num > max ? max : num) : 1;


	if (num > 7) {
		pages = [{num:1}, {num:2}, {num:2 + ((num - 5)>>1), is_skip: true}];
		A = num - 3;
		};

	//B = max - num > 6 ? (A+6) : max;
	if (max - num <= 6) {
		B = max;
		A = max - 6;
		} else B = A+6;


	for (i = A; i <= B; i++) {
		pages.push({num: i, is_selected: i == num});
		};

	if (max - num > 6) {
		pages = pages.concat([{num: 1+num+((max-num)>>1), is_skip: true}, {num: max-1}, {num: max}])
		};

	pr.pages = pages;
	pr.next_page = num !== B;
	pr.prev_page = num !== 1;
	pr.num = num;
	pr.max = max;

	return _.tmpl(tmpl.mailbox_pager, pr);
	};



// extend ui pager
elems.mailbox_pager = rr.new_class({
	interface: true,
	constructor: function(pr, _) {
		this.master = _.clone();// клонируем чтобы сохранить контекст (_.namespace и _.global)

		if (pr.num > 0) this.num = pr.num;
		if (pr.max > 0) this.max = pr.max;
		if (pr.css) this.css = pr.css;

		if (pr.url_mask) this.url_mask = pr.url_mask;
		if (pr.url_first) this.url_first = pr.url_first;


		this.interface.res(this);
		},

	prototype: {
		nodeType: -1, // флаг для мастера

		max: 1,
		num: 1,

		set: function(p, v) {
			var ch;
			if (typeof p === 'object') {
				if (p.max > 0 && p.max !== this.max) {
					ch = true;
					this.max = p.max;
					};

				if (p.num > 0 && p.num !== this.num) {
					ch = true;
					this.num = p.num;
					};
				};

			if (ch) this.interface.res(this);
			}
		},

	res: function(ui) {
		var pr = {}, num = ui.num, max, pages=[], A = 1, B, i;

		max  = ui.max > 1 ? ui.max : 1;
		num = num > 1 ? (num > max ? max : num) : 1;


		if (num > 7) {
			pages = [{num:1}, {num:2}, {num:2 + ((num - 5)>>1), is_skip: true}];
			A = num - 3;
			};

		//B = max - num > 6 ? (A+6) : max;
		if (max - num <= 6) {
			B = max;
			A = max - 6;
			} else B = A+6;


		for (i = A; i <= B; i++) {
			pages.push({num: i, is_selected: i == num});
			};

		if (max - num > 6) {
			pages = pages.concat([{num: 1+num+((max-num)>>1), is_skip: true}, {num: max-1}, {num: max}])
			};



		var nn = ui.master.tmpl(tmpl.mailbox_pager, {
			css: ui.css,
			url_mask: ui.url_mask, //'#/page/'

			pages: pages,
			next_page: num !== B,
			prev_page: num !== 1,
			num: num,
			max: max
			});

		if (ui.node)
		if (i = ui.node.parentNode) {
			i.replaceChild(nn.node, ui.node)
			};

		ui.node = nn.node;
		ui.nodes = nn;
		}
	});

