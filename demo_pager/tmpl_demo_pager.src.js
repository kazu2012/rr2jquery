
tmpl.mailbox_pager = function(_, pr) {
	var ns = this;

	ns.node = _('div.b-mbox_pager', {css: pr.css}
		, _((pr.next_page ? 'a' : 'span')
			, {
				css: 'b-mbox_pager-next',
				title: (pr.next_page ? "Перейти на следующую страницу":''),
				href: (pr.url_mask ? rr.printx(pr.url_mask, pr.num+1) : '#/p'+(pr.num+1))
				}

			, _('span.b-mbox_pager-text', "Следующая")
			, _('span.b-mbox_pager-key'
				, ' Ctrl '
				, _('span.b-mbox_pager-arr'
					, '\u2192' //'→'
					)
				)

			)


		, _((pr.prev_page ? 'a' : 'span')
			, {
				css: 'b-mbox_pager-prev',
				title: (pr.prev_page ? "Перейти на предыдущую страницу":''),
				href: (pr.url_mask ? rr.printx(pr.url_mask, pr.num-1) : '#/p'+(pr.num-1))
				}

			, _('span.b-mbox_pager-key'
				, _('span.b-mbox_pager-arr'
					, '\u2190' //'←'
					)
				, ' Ctrl '
				)
			, _('span.b-mbox_pager-text', "Следующая")
			)


		, _('span.b-mbox_pager-box'
			, rr.map(pr.pages, function(v) {
				if (v.is_selected) {
					return _('span.b-mbox_pager-page b-mbox_pager-page--selected', {title: "Текущая страница", text: v.num})
					};

				return _('a.b-mbox_pager-page'
					, {
						href: pr.url_mask ? rr.printx(pr.url_mask, v.num) : '#/p'+v.num,
						title: rr.printx("Перейти на страницу %s", v.num),
						text: (v.is_skip?'...':v.num)
						}
					);
				})
			)
		)
	};

