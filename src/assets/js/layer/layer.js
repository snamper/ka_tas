! function(e) {
	"use strict";
	var t = document,
		n = "querySelectorAll",
		i = "getElementsByClassName",
		s = function(e) {
			return t[n](e)
		},
		a = {
			type: 0,
			shade: !0,
			shadeClose: !0,
			fixed: !0,
			anim: "scale"
		},
		l = {
			extend: function(e) {
				var t = JSON.parse(JSON.stringify(a));
				for (var n in e) t[n] = e[n];
				return t
			},
			timer: {},
			end: {}
		};
	l.touch = function(e, t) {
		e.addEventListener("click", function(e) {
			t.call(this, e)
		}, !1)
	};
	var r = 0,
		o = ["layui-m-layer"],
		d = function(e) {
			var t = this;
			t.config = l.extend(e), t.view()
		};
	d.prototype.view = function() {
		var e = this,
			n = e.config,
			a = t.createElement("div");
		e.id = a.id = o[0] + r, a.setAttribute("class", o[0] + " " + o[0] + (n.type || 0)), a.setAttribute("index", r);
		var l = function() {
				var e = "object" == typeof n.title;
				return n.title ? '<h3 style="' + (e ? n.title[1] : "") + '">' + (e ? n.title[0] : n.title) + "</h3>" : ""
			}(),
			d = function() {
				"string" == typeof n.btn && (n.btn = [n.btn]);
				var e, t = (n.btn || []).length;
				return 0 !== t && n.btn ? (e = '<span yes type="1">' + n.btn[0] + "</span>", 2 === t && (e = '<span no type="0">' + n.btn[1] + "</span>" + e), '<div class="layui-m-layerbtn">' + e + "</div>") : ""
			}();
		if (n.fixed || (n.top = n.hasOwnProperty("top") ? n.top : 100, n.style = n.style || "", n.style += " top:" + (t.body.scrollTop + n.top) + "px"), 2 === n.type && (n.content = '<section class="m-loading-ka"></section>'), n.skin && (n.anim = "up"), "msg" === n.skin && (n.shade = !1), a.innerHTML = (n.shade ? "<div " + ("string" == typeof n.shade ? 'style="' + n.shade + '"' : "") + ' class="layui-m-layershade"></div>' : "") + '<div class="layui-m-layermain" ' + (n.fixed ? "" : 'style="position:static;"') + '><div class="layui-m-layersection"><div class="layui-m-layerchild ' + (n.skin ? "layui-m-layer-" + n.skin + " " : "") + (n.className ? n.className : "") + " " + (n.anim&&n.type!=1 ? "layui-m-anim-" + n.anim : "") + '" ' + (n.style ? 'style="' + n.style + '"' : "") + ">" + l + '<div class="layui-m-layercont">' + n.content + "</div>" + d + "</div></div></div>", !n.type || 2 === n.type) {
			var c = t[i](o[0] + n.type),
				y = c.length;
			y >= 1 && layer.close(c[0].getAttribute("index"))
		}
		document.body.appendChild(a);
		var shadedom=s('.layui-m-layershade')[0];
		shadedom&&shadedom.addEventListener('touchmove',function(e){
			e.preventDefault();
		})
		var u = e.elem = s("#" + e.id)[0];
		n.success && n.success(u), e.index = r++, e.action(n, u)
	}, d.prototype.action = function(e, t) {
		var n = this;
		e.time && (l.timer[n.index] = setTimeout(function() {
			layer.close(n.index)
		}, 1e3 * e.time));
		var s = function() {
			var t = this.getAttribute("type");
			0 == t ? (e.no && e.no(), layer.close(n.index)) : e.yes ? e.yes(n.index) : layer.close(n.index)
		};
		if (e.btn)
			for (var a = t[i]("layui-m-layerbtn")[0].children, r = a.length, o = 0; r > o; o++) l.touch(a[o], s);
		if (e.shade && e.shadeClose) {
			var d = t[i]("layui-m-layershade")[0];
			l.touch(d, function() {
				layer.close(n.index, e.end)
			})
		}
		e.end && (l.end[n.index] = e.end)
	}, e.layer = {
		v: "2.0",
		index: r,
		open: function(e) {
			var t = new d(e || {});
			return t.index
		},
		close: function(e) {
			var n = s("#" + o[0] + e)[0];
			n && (n.innerHTML = "", document.body.removeChild(n), clearTimeout(l.timer[e]), delete l.timer[e], "function" == typeof l.end[e] && l.end[e](), delete l.end[e])
		},
		closeAll: function() {
			for (var e = t[i](o[0]), n = 0, s = e.length; s > n; n++) layer.close(0 | e[0].getAttribute("index"))
		}
	}, "function" == typeof define ? define(function() {
		return layer
	}) : void 0;
	// function() {
	// 	var e = document.scripts,
	// 		n = e[e.length - 1],
	// 		i = n.src,
	// 		s = i.substring(0, i.lastIndexOf("/") + 1);
	// 	n.getAttribute("merge") || document.head.appendChild(function() {
	// 		var e = t.createElement("link");
	// 		return e.href = s + "need/layer.css?2.0", e.type = "text/css", e.rel = "styleSheet", e.id = "layermcss", e
	// 	}())
	// }()
}(window);