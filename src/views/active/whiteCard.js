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
		pageSize:12,
		page:1,//当前页数
		userInfo:'',//用户信息
		cardList:{'list':[]},//号码列表
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
			setTimeout(function(){
				let window_h=document.documentElement.clientHeight||window.innerHeight||document.body.clientHeight;
				let window_w=document.documentElement.clientWidth||window.innerWidth||document.body.clientWidth;
				//设置页面展现
				vm.set('boxHeight',`height:${window_h-58}px`);
				var row=Math.ceil((window_h-58)/50),//行数
				    col=window_w<=469 ? 2 : window_w<=719 ? 3 : 4;//列数
				vm.set('pageSize',row*col);//号码数量

				//vm.callMethod('getCardList');
			},0)
		},
		getCardList:function(page,closeLoad){//获取首屏号卡数据
			var vm=this;
			var json={
	  			'params':{
	  				'phoneTitle':vm.get('cardInfo').phone,
	  				'sourceOrder':vm.get('cardInfo').sourceOrder,
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