require('../../public.js');
require('../../assets/css/header.css');
require('../../assets/css/number.css');
require('../../assets/css/drag-up.css');
require('../../assets/css/order-prompt.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		isPullLoad:true,//上拉加载开关
		isHaveMore:0,//是否还有更多号码
		firstLoad:true,
		showCardList:true,//首页列表开关
		showOrderTips:0,//未完成订单开关
		orderInfo:'',//订单信息
		pageSize:12,
		page:1,//当前页数
		userInfo:'',//用户信息
		cardList:{'list': [],},//号码列表
		searchValue:'',//输入框值
		cardInfo:{
            iccid:'',
            sourceOrder:'',
            phone:'',
            belongType:'0',//0,大众号1,预售号2,专营号
            bizType:'4',
            faceMoney:'0',
        },
		boxHeight:'height:500px',//号码盒子高度
	},
	hooks:{
        init:function(){
        	vm=this;
        	Jsborya.webviewLoading({isLoad:false});//关闭app加载层
			
			let cardInfo = vm.getStore('CARD_INFO'),
				userInfo = vm.getStore("USER_INFO");
            if(cardInfo)vm.set('cardInfo',cardInfo);
            if(userInfo)vm.set('userInfo',userInfo);

			vm.callMethod('initPage');
		}
	},
	methods:{
		initPage:function(){
			const vm=this;

			let window_h=document.documentElement.clientHeight||window.innerHeight||document.body.clientHeight;
			let window_w=document.documentElement.clientWidth||window.innerWidth||document.body.clientWidth;
			//设置页面展现
			
			vm.set('boxHeight',`height:${window_h-58}px`);
			var row=Math.ceil((window_h-58)/50),//行数
			    col=window_w<=469 ? 2 : window_w<=719 ? 3 : 4;//列数
			vm.set('pageSize',row*col);//号码数量

			vm.callMethod('getCardList');
			
		},
		getCardList:function(page,closeLoad){//获取首屏号卡数据
			var vm=this;
			var json={
	  			'params':{
	  				'phoneTitle':vm.get('cardInfo').phone,
	  				'segment':vm.get('searchValue'),
	  				'belongType':vm.get('cardInfo').belongType,
	  				'page':page||1,
	  				'pageSize':vm.get('pageSize'),
	  			},
	  			'userInfo':vm.get('userInfo')
	  		};
	  		vm.set('isHaveMore',false);
	  		var pull=function(data){//上拉时，合并数据列表
				vm.set('cardList.list',vm.get('cardList').list.concat(data));
			};
			if(json.params.page==1){
				document.getElementById('cardBox').scrollTop=0;
			}
			vm.AJAX('/tas/w/active/phoneList',json,function(data){
				vm.set('firstLoad',false);
				vm.set('isPullLoad',true);
				vm.set('page',json.params.page);
				
				closeLoad ? pull(data.data.list) : vm.set('cardList.list',data.data.list);
				if(json.params.page!=1&&data.data.list.length==0)vm.set('isHaveMore',true);
			},closeLoad);
		},
		searchInputChange:function(){//输入内容改变
			vm.set('isClear',value);
		},
		searchKeydown(e){

			if(e.keyCode == 13){
				vm.callMethod('getCardList');
			}

		},
		clearClick:function(){//清除输入内容
			vm.set('searchValue','');
		},
		searchClick:function(){//搜索按钮触发
			let value=vm.get('searchValue');

			if(value && !value.match(/^[0-9]*$/)){
				layer.open({
                    content:'请输入数字',
                    skin: "msg",
                    msgSkin:'error',
                    time: 2
                });
                return false;
            }
			  

			vm.callMethod('getCardList');
		},
		pullLoad:function(e){//上拉执行
	    	e.preventDefault();
	    	var page=vm.vm.get('page'),obj=document.getElementById('cardBox');
	    	
	    	if(vm.get('isPullLoad')&&obj.scrollHeight<=(obj.scrollTop+obj.offsetHeight)&&!vm.get('isHaveMore')){
	    		vm.set('isPullLoad',false);
	    		page++;
	    		vm.callMethod('getCardList',[page,true]);
	    	}else{
	    		vm.set('isHaveMore',false);
	    	}
	    },
		phoneClick:function({phoneNum,cityName,faceMoney}){//点击号码生成订单
			vm.AJAX('/tas/w/searchcard/getOrder',{'userInfo':vm.userInfo},function(data){
				if(data.data){
					vm.set('orderInfo',data.data);
					vm.callMethod('countDown');
					vm.set('showOrderTips',true);
					vm.set('showCardList',false);
				}else{
					let cardInfo = vm.get('cardInfo');
					cardInfo.phone = phoneNum;
					cardInfo.faceMoney = faceMoney;
					vm.setStore('CARD_INFO',cardInfo);

					vm.removeStore('CHANGE_PACKAGE_INFO');

					Jsborya.pageJump({
						url:cardInfo.belongType == 0 ? 'publicWhitePackage.html' : 'devotedWhitePackage.html',
						stepCode:'1000',
						depiction:"开白卡",
						destroyed:false,
						header:{
		                    frontColor:'#ffffff',
		                    backgroundColor:'#4b3887',
		                }
					});
				}
			});
			
		},
		continueOrder:function(){//继续完成订单-按钮

			vm.AJAX('/tas/w/searchcard/getOrder',{'userInfo':vm.userInfo},function(data){
				if(data.data){
					window.localStorage.setItem('ORDER_INFO',JSON.stringify(vm.get('orderInfo')));
					
					Jsborya.pageJump({
						url:'',
						stepCode:vm.orderInfo.orderStatusCode,
						depiction:'开白卡',
						data:vm.orderInfo
					});
				}else{
					vm.backHome();
				}
			});
		},
		abandon:function(sysOrderId){//放弃订单-按钮
			layer.open({
				title:'提示',
				content:'您要放弃未完成的订单的后续操作么？',
				btn:['放弃','取消'],
				yes:function(){
					let json={
			  			'params':{
			  				'sysOrderId':sysOrderId,
			  			},
			  			'userInfo':vm.get('userInfo')
			  		};
					vm.AJAX('/tas/w/searchcard/orderCancel',json,function(data){
						vm.callMethod('backHome');
						layer.open({
							title:'操作成功',
							content:'订单已取消，若已支付，支付货款将退回至您的账户',
							btn:['确定'],
						});
					});
				}
			});
		},
		countDown:function(){//倒计时
	    	var time=parseInt(vm.get('orderInfo').validTime);
	    	vm.set('orderInfo.validTime','00:00');
	    	clearInterval(window.Timer);
	    	var timeFormat=function(t){
	    		var t_s=t%60,t_m=Math.floor(t/60);
	    		t_s<=9&&(t_s='0'+t_s);
	    		t_m<=9&&(t_m='0'+t_m);
	    		return t_m+':'+t_s;
	    	}
	    	window.Timer=setInterval(function(){
	    		time--;
	    		if(!time){
	    			vm.set('orderInfo.validTime','00:00');
	    			clearInterval(window.Timer);
	    			window.location.reload();
	    		}else{
	    			vm.set('orderInfo.validTime',timeFormat(time));
	    		}
	    	},1000);
	    },
		backHome:function(){//返回号码列表
			vm.callMethod('getCardList');
			vm.set('showCardList',true);
			vm.set('showOrderTips',false);
		},
		mathCentToYuan:function(value){
	    	return this.mathCentToYuan(value);
	    },
	    phoneFormat:function(phone){
			return this.phoneFormat(phone);
		},
	}
});


});