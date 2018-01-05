/*
	Created By Max 2016-11-23
	method：BASE64.encode(str);BASE64.decode(str);
 */
function Base64() {
	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="; 
	this.encode = function(r) {
		var e, t, o, n, c, a, d, f = "",
			h = 0;
		for (r = _utf8_encode(r); h < r.length;) e = r.charCodeAt(h++), t = r.charCodeAt(h++), o = r.charCodeAt(h++), n = e >> 2, c = (3 & e) << 4 | t >> 4, a = (15 & t) << 2 | o >> 6, d = 63 & o, isNaN(t) ? a = d = 64 : isNaN(o) && (d = 64), f = f + _keyStr.charAt(n) + _keyStr.charAt(c) + _keyStr.charAt(a) + _keyStr.charAt(d);
		return f
	}, this.decode = function(r) {
		var e, t, o, n, c, a, d, f = "",
			h = 0;
		for (r = r.replace(/[^A-Za-z0-9\+\/\=]/g, ""); h < r.length;) n = _keyStr.indexOf(r.charAt(h++)), c = _keyStr.indexOf(r.charAt(h++)), a = _keyStr.indexOf(r.charAt(h++)), d = _keyStr.indexOf(r.charAt(h++)), e = n << 2 | c >> 4, t = (15 & c) << 4 | a >> 2, o = (3 & a) << 6 | d, f += String.fromCharCode(e), 64 != a && (f += String.fromCharCode(t)), 64 != d && (f += String.fromCharCode(o));
		return f = _utf8_decode(f)
	};var _utf8_encode = function(r) {
		r = r.replace(/\r\n/g, "\n");
		for (var e = "", t = 0; t < r.length; t++) {
			var o = r.charCodeAt(t);
			o < 128 ? e += String.fromCharCode(o) : o > 127 && o < 2048 ? (e += String.fromCharCode(o >> 6 | 192), e += String.fromCharCode(63 & o | 128)) : (e += String.fromCharCode(o >> 12 | 224), e += String.fromCharCode(o >> 6 & 63 | 128), e += String.fromCharCode(63 & o | 128))
		}
		return e
	};var _utf8_decode = function(r) {
		var c1,c2,c3;
		for (var e = "", t = 0, o = c1 = c2 = 0; t < r.length;) o = r.charCodeAt(t), o < 128 ? (e += String.fromCharCode(o), t++) : o > 191 && o < 224 ? (c2 = r.charCodeAt(t + 1), e += String.fromCharCode((31 & o) << 6 | 63 & c2), t += 2) : (c2 = r.charCodeAt(t + 1), c3 = r.charCodeAt(t + 2), e += String.fromCharCode((15 & o) << 12 | (63 & c2) << 6 | 63 & c3), t += 3);
		return e
	}
}! function(r) {
	var e = new Base64;
	r.BASE64 = {
		encode: function(r) {
			if (r) return e.encode(r)
		},
		decode: function(r) {
			if (r) return e.decode(r)
		}
	}
}(window);