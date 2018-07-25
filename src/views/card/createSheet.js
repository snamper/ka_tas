require('../../public.js');
require('../../assets/js/album.js');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		cardInfo:{//开卡信息
			phone:'00000000000',
			cityName:'未知',
			cityCode:'100',
			pretty:'1',
			phoneMoney:0,
			phoneLevel:0,
			discount:10000,
			slot:0,
			deviceType:1,
			belongType:0,
			iccid:''
		},
		orderInfo: {
            "phoneNum":"00000000000",
            "numberLevel":0,
            "cityName":"--",
            "createTime":"0",
            "cardMoney":"0",
            "orderStatusCode":"PACKAGE_SELECTION",
            "totalMoney":0,
            "limitSimilarity":0,
            "validTime":0,
            "sysOrderId":"00000000000000000",
            "prestoreMoney":0,
            "similarity":0,
            "images":[],
            "packageName":"--",
            "packageCode":"0"
        },
        windowHeight:600,
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'确认受理单',
				left:{
					icon:'back_white',
					value:'',
					callback:'headerLeftClick'
				},
				right:{
					icon:'',
					value:'',
					callback:''
				}
			});
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层
			
			let orderInfo=vm.getStore('ORDER_INFO'),
				cardInfo=vm.getStore('CARD_INFO');
			// orderInfo={
			// 	"idCardName":"王兴璐",
			// 	"images":[{"imageName":"https://192.168.10.98:6051/tas/tfcardorder/20180509/89860117841022193963/TF18050910231494863_accept.png"}],
			// 	"idCardNo":"511321198807295598","totalMoney":1,
			// 	"limitSimilarity":10,
			// 	"phoneNum":"17082880233",
			// 	"numberLevel":0,
			// 	"cityName":"四川成都",
			// 	"createTime":1516612416100,
			// 	"cardMoney":0,
			// 	"similarity":92,
			// 	"orderStatusCode":"CREATE_SHEET",
			// 	"validTime":1558651,
			// 	"sysOrderId":"TF18012217133648258",
			// 	"prestoreMoney":20000
			// };
			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				vm.set('cardInfo',cardInfo);
				Jsborya.getGuestInfo({
					slot:cardInfo.slot || '-1',
					complete:function(userInfo){
						vm.set('userInfo',userInfo);

						Jsborya.registerMethods('headerLeftClick',function(){
							vm.orderCancel(userInfo,orderInfo.sysOrderId);
						});
					}
				});
			}else{
				alert('本地订单信息丢失');
			}
		},
	    mounted:function(){
	    	setTimeout(function(){
	    		vm.callMethod('setPage');
	    	},300);
	    }
	},
	methods:{
		setPage:function(){
			var window_h=document.documentElement.clientHeight||window.innerHeight||document.body.clientHeight;//视图高度
			document.getElementById("albumBox").style.height=window_h-105+"px";//设置轮播盒子高度

			vm.set('windowHeight',window_h||600);
			Album.init();//相册模块初始化
		},
		setImgHeight:function(){
			return 'height:'+(parseInt(vm.get('windowHeight'))-105)+'px';
		},
		submitSheet:function(){
			Jsborya.pageJump({
				url:'cardWriting.html',
				stepCode:'999',
				depiction:'写卡',
				header:{
                    frontColor:'#ffffff',
                    backgroundColor:vm.getHeaderColor(vm.get('cardInfo').deviceType),
                }
			});
		},
	    phoneFormat:function(phone){
			return this.phoneFormat(phone);
		},
		filterLevel:function(level){
			return this.filterLevel(level);
	    },
	    getDateTime:function(timestamp){
	    	return this.getDateTime(timestamp);
	    }
	}
});

});