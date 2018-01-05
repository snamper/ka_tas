require('../../public.js');
require('../../assets/css/pay.css');

Jsborya.ready(function(){


var app=new Moon({
	el:'#app',
	data:{
		
	},
	hooks:{
		init:function(){
			
		}
	},
	methods:{
		payClick(){
			window.open("https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=wx201711231652040f4f7127830845813300&package=1343856840");
		}
	}
});


});