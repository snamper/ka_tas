require('../../public.js');
require('../../assets/css/createSheet.css');
require('../../assets/js/slider.js');
// var img_1=require("../assets/img/IDphoto01.jpg");
// var img_2=require("../assets/img/IDphoto02.jpg");
// var img_3=require("../assets/img/IDphoto03.jpg");

//var SmartPhoto=require('smartphoto');
Jsborya.ready(function(){


var app=new Moon({
	el:'#app',
	data:{
		orderInfo: {//订单信息
			"sysOrderId":"00000000000000000",
			"createTime":"0",
			"phone": "00000000000",
	        "numberLevel":"0",
	        "cityName": "--",
			"totalMoney":"0.00",//总价格
			"cardMoney":0,//号码占用费
			"prestoreMoney":0,//预存价格   
	    },
		sheetImg:[],
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'确认受理单',
				frontColor:'#ffffff',
				backgroundColor:'#4b3887',
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

			var window_h=document.documentElement.clientHeight;//视图高度
			document.getElementById("slider-box").style.height=window_h-105+"px";//设置轮播盒子高度

			let orderInfo=this.getStore('ORDER_INFO');
			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				Jsborya.getGuestInfo(function(userInfo){
					vm.set('userInfo',userInfo);

					Jsborya.registerMethods('headerLeftClick',function(){
						vm.orderCancel(userInfo,orderInfo.sysOrderId);
					});
					vm.callMethod("getAcceptance");
				});
			}else{
				alert('本地订单信息丢失');
			}
		}
	},
	methods:{
		getAcceptance:function(){
			vm.AJAX('../../w/business/acceptance',{//获取受理单图片
				userInfo:vm.get('userInfo'),
				params:{
					sysOrderId:vm.get('orderInfo').sysOrderId,
				}
			},function(data){
				var imgArray=data.data.images;
				for(let i =0;i<imgArray.length;i++){
					imgArray[i].imageName=imgArray[i].imageName.replace(/\\/g,"/");
				}
				vm.set('sheetImg',imgArray);

				Slider.init({
					index:data.data.images.length
				});

				setTimeout(function(){
					var imgItems=document.getElementsByClassName("imgItem");//img 对象
					for(let i=0;i<imgItems.length;i++){
						if(imgItems[i].nodeType==1)imgItems[i].style.height=window_h-105+"px";
					}
					new SmartPhoto(".slider",{
						resizeStyle: 'fit',
						arrows:false,
						nav:false
					});
				},200);
				
			});
		},
		submitSheet:function(){
			Jsborya.pageJump({
				url:'cardWriting.html',
				stepCode:999,
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