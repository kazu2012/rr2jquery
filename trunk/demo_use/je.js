window.onload = function() {
	if (!text.length) text.push('is not')
        		
	text.push('<br/><br/>')
	var a = document.getElementsByTagName('script');
	for(i=0;s = a[i++];) if (s.src) text.push(s.src+':  async='+s.async+'<br/>')

	document.body.innerHTML = text.join(',')
};

