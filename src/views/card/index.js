require('../../public.js');
require('../../assets/css/index.css');

Jsborya.ready(function(){

var vm=new Moon({
	el:'#app',
	data:{
		off:{
			isRecommend:true,//第一次加载的标签
			openMoreLable:false,//展开标签
			showNoMore:false,//暂无更多
			showPullLoad:false,//上拉加载
			showOrderMsg:false,//是否有订单
		},
		deviceType:1,//1、手机卡；2、手表卡
		deviceStatus:1,//设备状态0,异常状态;1,正常状态
		cardBoxHeight:400,//号码容器高度
		inputValue:'',//搜索框value
		selectLabel:{type:0,name:'',tag:''},//选择的标签
		selectCity:{'cityName':'全国','cityCode':'100'},//选中的城市
		page:1,
		userInfo:'',//用户信息
		hotLabel:[{tag:'1166',name:'一举成名',type:'1'},{tag:'3322',name:'德望兼备',type:'1'},{tag:'5588',name:'富贵自来',type:'1'},{tag:'2266',name:'天时地利',type:'1'},{tag:'2288',name:'荣华富贵',type:'1'},{tag:'6111',name:'大吉大利晚上吃鸡',type:'1'},{tag:'9944',name:'旭日升天',type:'1'},{tag:'3344',name:'生生世世',type:'1'},{tag:'5201314',name:'我爱你一生一世',type:'1'},{tag:'1314920',name:'一生一世就爱你',type:'1'},{tag:'520',name:'我爱你',type:'1'},{tag:'6699',name:'顺顺利利',type:'1'},{tag:'3399',name:'长长久久',type:'1'},{tag:'20110',name:'爱你一亿年',type:'1'},{tag:'1314',name:'一生一世',type:'1'}],//标签数据
		cardData:{
			ytDbOneCount:'-1',
			list:[]
        },//号卡数据
        boxHt:'height:400px'
	},
	hooks: {
	    init: function() {
			vm=this;
			Jsborya.setHeader({
				title:'号码搜索',
				frontColor:'#ffffff',
                backgroundColor:'#4b3887',
				left:{
					icon:'back_white',
					value:'返回',
					callback:''
				},
				right:{
					icon:'card_green',
					value:'',
					callback:'headerRightClick'
				}
			});
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层
			
			const selectCity=vm.getStore('selectCity');
			if(selectCity)vm.set('selectCity',selectCity);

			vm.removeStore('ORDER_INFO');
			vm.removeStore('CARD_INFO');
			Jsborya.getGuestInfo(function(userInfo){
				vm.set('userInfo',userInfo);
				Jsborya.registerMethods('headerRightClick',function(){
					if(userInfo.iccid=='666666666666'){
						vm.toBuyHelpPage();
						return false;
					}
					let deviceType=vm.get('deviceType');
					if(deviceType==1){
						Jsborya.pageJump({
							url:"simInfo.html",
							stepCode:999,
							depiction:'SIM卡信息',
							destroyed:false,
							header:{
		                        frontColor:'#ffffff',
		                        backgroundColor:'#4b3887',
		                    }
						});
					}else if(deviceType==2){
						Jsborya.pageJump({
							url:'',
							stepCode:803,
							depiction:'设备管理',
							destroyed:false,
						});
					}
				});
				vm.callMethod('getLableList');
				vm.callMethod('readCardICCID');
				vm.callMethod('getCardList')
			});
	    },
	    mounted:function(){
	    	setTimeout(function(){
	    		vm.callMethod('setPage',[211]);
	    	},300);
	    }
	},
	methods:{
		setPage:function(otherHeight){
			const window_h=document.documentElement.clientHeight||window.innerHeight||document.body.clientHeight;
			let cardBox=document.getElementById("cardBox");

			vm.set('boxHt','height:'+(window_h-otherHeight)+'px')
			cardBox.scrollTop=0;
		},
		cityClick:function(){//城市切换
			vm.setStore('selectCity',vm.get('selectCity'));
			let selectCity=JSON.stringify();
			Jsborya.pageJump({
                url:'city.html',
                stepCode:'999',
                depiction:'选择城市',
                destroyed:false,
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
            });
		},
		inputKeyup:function(e){//键盘事件
			if(e.keyCode==13){
				vm.callMethod('inputSearchClick');
			}else if(e.keyCode==8){
				let len = vm.get('inputValue').length;
				len == 0 && !vm.get('selectLabel').type && vm.set('off.isRecommend',true);
			}
		},
		inputSearchClick:function(){//搜索按钮点击
			let value=vm.get('inputValue');
			if(!value&&!vm.get('selectLabel').type){
				layer.open({
                    content:'请输入或选择搜索条件',
                    skin: "msg",
                    time: 2
                });
                return false;
			}else if(!value.match(/^[0-9]*$/)){
				layer.open({
                    content:'输入姿势不正确',
                    skin: "msg",
                    time: 3
                });
                return false;
			}
			
			vm.set('selectLabel',{type:0,name:'',tag:''});
			vm.set('off.isRecommend',false);
			vm.callMethod('getCardList');

			if(vm.get('off').showOrderMsg){
				vm.callMethod('setPage',[126]);
			}else vm.callMethod('setPage',[103]);
		},
		inputClearClick:function(){//清除输入框
			vm.set('inputValue','');
			vm.callMethod('clearSelectLabel');
		},
		labelClick:function(e){//标签点击
			let hotLabel=vm.get('hotLabel'),
			index=e.target.title;
			vm.set('selectLabel',{name:hotLabel[index].name,type:hotLabel[index].type,tag:hotLabel[index].tag});
			vm.set('inputValue','');
			
			vm.set('off.isRecommend',false);
			vm.callMethod('getCardList');

			if(vm.get('off').showOrderMsg){
				vm.callMethod('setPage',[172]);
			}else vm.callMethod('setPage',[149]);
		},
		clearSelectLabel:function(){//清除选中标签
			vm.set('selectLabel',{type:0,name:'',tag:''});
		
			vm.set('off.isRecommend',true);
			vm.callMethod('getCardList');

			if(vm.get('off').showOrderMsg){
				vm.callMethod('setPage',[234]);
			}else vm.callMethod('setPage',[211]);
		},
		toOrderDetails:function(){
			Jsborya.pageJump({
                url:'orderInfo.html',
                stepCode:999,
                depiction:'订单详情',
                destroyed:false,
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
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
				phoneLevel:phoneData.numberLevel,
				deviceStatus:vm.get('deviceStatus'),
				deviceType:vm.get('deviceType'),
				discount:10000
			});
			vm.removeStore('selectPackage');
			Jsborya.pageJump({
                url:'package.html',
                stepCode:'999',
                depiction:'选择套餐',
                destroyed:false,
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
            });
		},
		readCardICCID:function(){
			let userInfo=vm.get('userInfo');
			if(userInfo.iccid=='666666666666'){
				Jsborya.setHeader({
					title:'号码搜索',
					frontColor:'#ffffff',
					backgroundColor:'#4b3887',
					left:{
						icon:'back_white',
						value:'返回',
						callback:''
					},
					right:{
						icon:'',
						value:'购卡指引',
						callback:'headerRightClick'
					}
				});
			}else Jsborya.readCardIMSI(function(data){
				if(data.status==1){
					vm.callMethod("iccidCheck",[data.imsi||'',data.smsp||'']);
				}else{
					vm.set('deviceStatus',0);
				}
			});
		},
		iccidCheck:function(imsi,smsp){
			const json={
	  			params:{
	  				imsi:imsi||'',
	  				smsp:smsp||'',
	  				scanIccid:''
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('/ka_tas/w/source/iccidCheck',json,function(data){
				if(data.data.status==2){
					vm.set('off.showOrderMsg',true);
					vm.callMethod('setPage',[234]);
					data.data.orderInfo.iccid=vm.get('userInfo').iccid;
					vm.setStore('ORDER_INFO',data.data.orderInfo);
				}else if(data.data.status==4){
					vm.set('deviceStatus',0);
				}

				let deviceType=data.data.deviceType,icon='';
				vm.set('deviceType',deviceType);
				if(deviceType==1){
					if(data.data.status==1){
						icon='card_green';
					}else icon='card_red';
					
				}else if(deviceType==2){
					if(data.data.status==1){
						icon='wcard_green';
					}else icon='wcard_red';
					
				}
				Jsborya.setHeader({
					title:'号码搜索',
					frontColor:'#ffffff',
					backgroundColor:'#4b3887',
					left:{
						icon:'back_white',
						value:'返回',
						callback:''
					},
					right:{
						icon:icon,
						value:'',
						callback:'headerRightClick'
					}
				});
			});
		},
		getLableList:function(){
			vm.AJAX('/ka_tas/w/source/tagList',{
	  			params:'',
	  			userInfo:vm.get('userInfo')
	  		},function(data){
				vm.set('hotLabel',data.data.list);
			});
		},
		getCardList:function(page,closeLoad){//获取数据
			const json={
	  			params:{
	  				phoneExam:vm.get('inputValue'),
	  				cityCode:vm.get('selectCity').cityCode,
	  				ytDbOneCount:vm.get('cardData').ytDbOneCount,
	  				page:page||1,
	  				pageSize:12,
	  				type:vm.get('selectLabel').type,
	  				tag:vm.get('selectLabel').tag,
	  				typeRandStatus:vm.get('off').isRecommend ? 1 : 0,
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
	  		if(!page)vm.set('cardData',{ytDbOneCount:'-1',list:[]});

	  		vm.set('off.showNoMore',false);
			vm.AJAX('/ka_tas/w/source/phoneList',json,function(data){
				vm.set('page',json.params.page);
				if(closeLoad){//上拉
					vm.set('off.showPullLoad',false);
					vm.set('cardData.list',vm.get('cardData').list.concat(data.data.list));
				}else{
					vm.set('cardData',data.data);
				}
				if(data.data.list.length==0)vm.set('off.showNoMore',true);
			},closeLoad);
		},
		pullLoad:function(e){//上拉执行
			var vm=this;
			e.preventDefault();
	    	let page=vm.get('page'),obj=document.getElementById('cardBox');
	    	if(!vm.get('off').showPullLoad&&!vm.get('off').showNoMore&&obj.scrollHeight<=(obj.scrollTop+obj.offsetHeight)){
	    		page++;
	    		vm.set('off.showPullLoad',true);
	    		vm.callMethod('getCardList',[page,true]);
	    	}
		},
		filterNumber:function(number){
			//未知BUG：inputValue和selectLabel的值改变会触发此函数
			var inputValue=vm.get('inputValue'),
				selectLabel=vm.get('selectLabel'),
				keyWord='';

			if(inputValue){
				keyWord=inputValue;
			}else if(selectLabel){
				keyWord=selectLabel.tag;
			}
			
			const nodeToString=function( node ) {  
			   var tmpNode=document.createElement("div");
			   tmpNode.appendChild(node.cloneNode(true));  
			   var str=tmpNode.innerHTML;  
			   tmpNode=node=null;
			   return str;
			};
			var keyWordStartIndex=-1;
		    if (number.lastIndexOf(keyWord)>-1){
		        keyWordStartIndex=number.lastIndexOf(keyWord);
		    }

		    var keyWordEndIndex=keyWordStartIndex+keyWord.length;

		    var newNumbersElement=document.createElement("div");

		    for (let i = 0, len=number.length; i<len;i++){
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