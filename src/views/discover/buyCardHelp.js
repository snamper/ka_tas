require('../../public.js');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层
			
			Jsborya.setHeader({
				title:'购卡指引',
				frontColor:'#ffffff',
                backgroundColor:'#4b3887',
				left:{
					icon:'back_white',
					value:'返回',
					callback:''
				},
				right:{
					icon:'',
					value:'分享',
					callback:'headerRightClick'
				}
			});
			Jsborya.registerMethods('headerRightClick',function(){
				Jsborya.pageJump({
					url:'',
					stepCode:804,
					depiction:'分享',
					destroyed:false,
					data:{
						url:window.location.href
					}
				});
			});
		}
	},
	methods:{
		jumpToQQ(){
			Jsborya.pageJump({
				url:'',
				stepCode:805,
				depiction:'打开QQ',
				destroyed:false,
				data:{
					packageName:'com.tencent.mobileqq',
					schema:'mqqwpa://im/chat?chat_type=wpa&uin=2885509595&version=1&src_type=web&web_src=oicqzone.com',
					subUrl:'http://wpa.qq.com/msgrd?v=3&uin=2885509595&site=qq&menu=yes'
				}
			});
		},
		jumpToJD(){
			Jsborya.pageJump({
				url:'',
				stepCode:805,
				depiction:'打开京东',
				destroyed:false,
				data:{
					packageName:'com.jingdong.app.mall',
					schema:'openapp.jdmobile://virtual?params=%7B%22sourceValue%22:%220_productDetail_97%22,%22des%22:%22productDetail%22,%22skuId%22:%27343092739%22,%22category%22:%22jump%22,%22sourceType%22:%22PCUBE_CHANNEL%22%7D',
					subUrl:'https://item.m.jd.com/product/27343092739.html'
				}
			});
		},

	}
});
});