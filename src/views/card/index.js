require('../../public.js');
require('../../assets/css/index.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			showFirstLabel:true,//第一次加载的标签
			openMoreLable:false,//展开标签
			showMoreLabel:false,//更多标签
			showNoMore:false,//暂无更多
			showPullLoad:false,//上拉加载
			showOrderMsg:false//是否有订单
		},
		inputValue:'',//搜索框value
		selectLabel:'',//选择的标签
		selectCity:{'cityName':'全国','cityCode':'100'},//选中的城市
		page:1,
		pageSize:10,//显示条数
		userInfo:'',//用户信息
		hotLabel:[{type:'1166',name:'一举成名'},{type:'3322',name:'德望兼备'},{type:'5588',name:'富贵自来'},{type:'2266',name:'天时地利'},{type:'2288',name:'荣华富贵'},{type:'6111',name:'大吉大利晚上吃鸡'},{type:'9944',name:'旭日升天'},{type:'3344',name:'生生世世'},{type:'5201314',name:'我爱你一生一世'},{type:'1314920',name:'一生一世就爱你'},{type:'520',name:'我爱你'},{type:'6699',name:'顺顺利利'},{type:'3399',name:'长长久久'},{type:'20110',name:'爱你一亿年'},{type:'1314',name:'一生一世'}],//标签数据
		orderInfo:{status:'1'},//订单信息
		cardData:{
			ytDbOneCount:'-1',
			list:[]
        },//号卡数据
	},
	hooks: {
	    init: function() {
			vm=this;
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			const window_h=document.documentElement.clientHeight;
			document.getElementById("cardBox").style.height=window_h-173+'px';

			const data=vm.getUrlParam('data');
			if(data){
				vm.set('selectCity',JSON.parse(BASE64.decode(data)));
			}
			vm.removeStore('ORDER_INFO');
			Jsborya.getGuestInfo(function(userInfo){
				vm.set('userInfo',userInfo);
				vm.callMethod('readCardICCID');
			});
	    }
	},
	methods:{
		cityClick:function(){//城市切换
			let selectCity=JSON.stringify(vm.get('selectCity'));
			Jsborya.pageJump({
                url:'city.html?data='+BASE64.encode(selectCity),
                stepCode:'999'
            });
		},
		inputKeyup:function(e){//键盘事件
			if(e.keyCode==13){
				vm.callMethod('getCardList');
			}else if(e.keyCode==8){//删除
				vm.callMethod("clearSelectLabel");
			}
		},
		inputSearchClick:function(){//搜索按钮点击
			if(!vm.get('inputValue')){
				layer.open({
                    content:'请输入搜索条件',
                    skin: "msg",
                    time: 3
                });
                return false;
			}
			vm.callMethod('getCardList');
		},
		inputClearClick:function(){//清除输入框
			vm.set('inputValue','');
		},
		labelClick:function(e){//标签点击
			vm.set('selectLabel',{name:vm.get('hotLabel')[e.target.title].name,type:vm.get('hotLabel')[e.target.title].type});
			const dom_searchInput=document.getElementById("searchInput");
			dom_searchInput.style.paddingLeft=30+e.target.offsetWidth+'px';
			dom_searchInput.setAttribute('placeholder','');

			vm.callMethod('inputClearClick');
			vm.callMethod('getCardList');
		},
		clearSelectLabel:function(){//清除选中标签
			vm.set('selectLabel','');
			const dom_searchInput=document.getElementById("searchInput");
			dom_searchInput.style.paddingLeft=15+'px';
			dom_searchInput.setAttribute('placeholder','输入您的生日或幸运数字试试运气');
		},
		moreLabelClick:function(e){//更多标签-点击
			let dom;
			if(e.target.nodeName=='I'){
				dom=e.target.parentNode;
			}else{
				dom=e.target;
			}
			vm.callMethod('closeMoreLabel');
			const top=dom.getBoundingClientRect().top,dom_moreLabel=document.getElementById('m-more-label');
			const window_h=document.documentElement.clientHeight;
			dom_moreLabel.style.height=window_h-(top+27)+'px';
			dom_moreLabel.style.top=(top+27)+'px';
		},
		moreLabelSelect:function(e){//更多标签-标签选中
			vm.callMethod('labelClick',[e]);
			vm.callMethod('closeMoreLabel');
		},
		closeMoreLabel:function(){//关闭更多标签
			let off=vm.get('off').showMoreLabel;
			vm.set('off.showMoreLabel',!off);
		},
		toOrderDetails:function(){
			Jsborya.pageJump({
                url:'orderDetails.html',
                stepCode:999
            });
		},
		toPackage:function(index){
			let phoneData=vm.get('cardData').list[parseInt(index)];
			vm.setStore('CARD_INFO',{
				phone:phoneData.phoneNum,
				cityName:phoneData.cityName,
				cityCode:phoneData.cityCode,
				pretty:phoneData.pretty,
				phoneMoney:phoneData.cardMoney,
				phoneLevel:phoneData.numberLevel
			});
			Jsborya.pageJump({
                url:'package.html',
                stepCode:'999'
            });
		},
		readCardICCID:function(){
			Jsborya.readCardIMSI(function(data){
				if(data.status==1){
					if(data.imsi=='FFFFFFFFFFFFFFF')data.imsi='';
					vm.callMethod("getOrderInfo",[data.imsi,data.smsp]);
				}
			});
		},
		getOrderInfo:function(imsi,smsp){//获取订单信息
			const json={
	  			params:{
	  				imsi:imsi||'',
	  				smsp:smsp||'',
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('../../w/source/iccidCheck',json,function(data){
				if(data.data.status==2){
					vm.set('off.showOrderMsg',true);
					vm.setStore('ORDER_INFO',{//订单信息
						"sysOrderId":data.data.orderInfo.sysOrderId,
						"createTime":data.data.orderInfo.createTime,
						"phone": data.data.orderInfo.phoneNum,
				        "numberLevel":data.data.orderInfo.numberLevel,
				        "cityName":data.data.orderInfo.cityName,
						"totalMoney":data.data.orderInfo.totalMoney,//总价格
						"cardMoney":data.data.orderInfo.cardMoney,//号码占用费
						"prestoreMoney":data.data.orderInfo.prestoreMoney,//预存价格
						"similarity":data.data.orderInfo.similarity,
						"limitSimilarity":data.data.orderInfo.limitSimilarity
				    });
				}
			});
		},
		getCardList:function(page,closeLoad){//获取数据
			const json={
	  			params:{
	  				phoneExam:vm.get('inputValue')||vm.get('selectLabel').type,
	  				cityCode:vm.get('selectCity').cityCode,
	  				ytDbOneCount:vm.get('cardData').ytDbOneCount,
	  				page:page||1,
	  				pageSize:vm.get('pageSize'),
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
	  		vm.set('off.showFirstLabel',false);
	  		vm.set('off.showNoMore',false);
			vm.AJAX('../../w/source/phoneList',json,function(data){
				if(closeLoad){
					vm.set('cardData.list',vm.get('cardData').list.concat(data.data.list));
				}else{
					vm.set('cardData',data.data);
				}
				
				if(data.data.list.length==0)vm.set('off.showNoMore',true);

			},closeLoad);
		},
		pullLoad:function(e){//上拉执行
			e.preventDefault();
	    	let page=vm.get('page'),obj=document.getElementById('cardBox');
	    	
	    	if(vm.get('off.showPullLoad')&&vm.get('off.showNoMore')&&obj.scrollHeight<=(obj.scrollTop+obj.offsetHeight)){
	    		page++;
	    		vm.set('showPullLoad',false);
	    		vm.set('page',page);
	    		vm.callMethod('getCardList',[page,true]);
	    	}
		},
		filterNumber:function(number){
			let keyWord=this.get('inputValue').toString();
			const nodeToString=function( node ) {  
			   var tmpNode=document.createElement("div");  
			   tmpNode.appendChild(node.cloneNode(true));  
			   var str=tmpNode.innerHTML;  
			   tmpNode=node=null;
			   return str;  
			};
			var keyWordStartIndex=-1;
		    if (number.indexOf(keyWord)>0){
		        keyWordStartIndex=number.indexOf(keyWord);
		    }

		    var keyWordEndIndex=keyWordStartIndex+keyWord.length;

		    var newNumbersElement=document.createElement("div");

		    for (let i = 0, ii=number.length; i<ii;i++){
		        var numberElement=document.createElement('span');
		        if (keyWordStartIndex>=0&&keyWordStartIndex<=i&&keyWordEndIndex>i) {
		            numberElement.className+="red ";
		        }
		        if (i===2||i===6){
		            numberElement.className+="space ";
		        }
		        numberElement.innerText=number[i];
		        newNumbersElement.appendChild(numberElement);
		    }
		    return nodeToString( newNumbersElement ).replace( "<" , "<" ).replace( ">" , ">");
		     
		}
	}
});


});