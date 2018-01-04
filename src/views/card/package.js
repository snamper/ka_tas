require('../../public.js');
require('../../assets/css/package.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{

		},
		totalPrice:0,//价格计算
		orderInfo:{
			phone:'00000000000',
			cityName:'未知',
			cityCode:'100',
			pretty:'1',
			phoneMoney:0,
			phoneLevel:0
		},
		selectPackage:{
			name:'',
			packageCode:'',
			selPackCode:'',
			prestore:'',
		},
		recommendList:[{name:'流量多',type:'liuliang'},{name:'语音多',type:'yuyin'},{name:'最省钱',type:'price'},{name:'全部套餐',type:'all'}],
		userInfo:'',//用户信息
	},
	hooks: {
	    init: function() {
	    	this.setStore('orderInfo',{phone:'17152689940',cityName:'成都',cityCode:'120',pretty:'1',phoneMoney:200,phoneLevel:0});
	    	//this.removeStore('orderInfo');
	    	//this.setStore('selectPackage',{name:'联通无限流量套餐',packageCode:'1002',selPackCode:'1254',prestore:'320',});
	    	//this.removeStore('selectPackage');
	    	vm=this;
	    	Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			let orderInfo=this.getStore('orderInfo'),
				selectPackage=this.getStore('selectPackage');
			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				if(selectPackage){
					vm.set('selectPackage',selectPackage);
					vm.set('totalPrice',(parseFloat(orderInfo.phoneMoney)/100+parseFloat(selectPackage.prestore)/100).toFixed(2));
				}
				Jsborya.getUserInfo(function(userInfo){
					vm.set('userInfo',userInfo);
				});
			}else{
				alert('页面URL参数错误');
			}
	    },
	},
	methods:{
		changePackage:function(){
			vm.callMethod('jumpToPackageList',['all']);
		},
		savePackage:function(){
			const json={
	  			params:{
	  				phoneNum:vm.get('orderInfo').phone,
	  				packageCode:vm.get('selectPackage').packageCode,
	  				selPackCode:vm.get('selectPackage').selPackCode,
	  				prestore:vm.get('selectPackage').prestore,
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('../../w/source/orderCreate',json,function(data){
				Jsborya.pageJump({
					url:'upload.html',
					stepCode:999
				});
			});
		},
		jumpToPackageList:function(type){
			Jsborya.pageJump({
				url:'packageList.html?type='+type,
				stepCode:999
			});
		},
		jumpToPackageDetails:function(){
			Jsborya.pageJump({
				url:'packageDetails.html?code='+vm.get('selectPackage').packageCode+'&phoneLevel='+vm.get('orderInfo').phoneLevel,
				stepCode:999
			});
		},
		phoneFormat:function(phone){
			return vm.phoneFormat(phone);
		},
		mathCentToYuan:function(money){
			return vm.mathCentToYuan(money);
		}
	}
});


});