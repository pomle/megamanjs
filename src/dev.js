$(function() {
    $.get('script-manifest.json', function inject(res) {
        res.push('main.js');
        $.each(res, function(i, src) {
            var s = document.createElement('script');
            s.type = "text/javascript";
            s.defer = true;
            s.src = src;
            document.body.appendChild(s);
        });
    }, 'json');
});
