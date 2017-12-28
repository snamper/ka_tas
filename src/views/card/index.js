require('../../public.js');
require('../../assets/css/index.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			showLabel:false,
			showCardList:true,
		},
		inputValue:'',
		cardList:{},
	},
	hooks: {
	    init: function() {
	      Jsborya.webviewLoading({isLoad:false});//关闭app加载层
	      // layer.open({
	      // 	content:'目前仅剩220胶囊碎片，不足以制作该胶囊。',
	      // 	title:'胶囊碎片不足',
	      // 	btn:['好','点击购买']
	      // });
	    }
	},
	methods:{
			
	}
});


});