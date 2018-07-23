require('../../public.js');
require('../../assets/css/index.css');

Jsborya.ready(function(){

var vm=new Moon({
	el:'#app',
	data:{
		off:{
			showNoMore:false,//暂无更多
			showPullLoad:false,//上拉加载
			showBtmEntry:true,//显示底部入口
		},
		cardInfo:{//卡槽信息
			slot:'-2',
			deviceType:1,
			iccid:'',
			hasPriPhone:1,//是否有专营号，1是2否 
		},
		inputValue:'',//搜索框value
		selectLabel:{type:0,name:'',tag:''},//选择的标签
		selectCity:{'cityName':'全国','cityCode':'100'},//选中的城市
		page:1,
		pageSize:15,
		userInfo:'',//用户信息
		hotLabel:[{tag:'1166',name:'一举成名',type:'1'},{tag:'3322',name:'德望兼备',type:'1'},{tag:'5588',name:'富贵自来',type:'1'},{tag:'2266',name:'天时地利',type:'1'},{tag:'2288',name:'荣华富贵',type:'1'},{tag:'6111',name:'大吉大利晚上吃鸡',type:'1'},{tag:'9944',name:'旭日升天',type:'1'},{tag:'3344',name:'生生世世',type:'1'},{tag:'5201314',name:'我爱你一生一世',type:'1'},{tag:'1314920',name:'一生一世就爱你',type:'1'},{tag:'520',name:'我爱你',type:'1'},{tag:'6699',name:'顺顺利利',type:'1'},{tag:'3399',name:'长长久久',type:'1'},{tag:'20110',name:'爱你一亿年',type:'1'},{tag:'1314',name:'一生一世',type:'1'}],//标签数据
		cardData:{
			ytDbOneCount:'-1',
			priDbOneCount:'-1',
			list:[]
        },//号卡数据
        windowHeight:600,//屏幕高度
        otherHeight:140,//除去号码容器的高度
        boxHt:'height:400px',
        hotWide:'width:1000px',
	},
	hooks: {
	    init: function() {
			vm=this;
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层


			let cardInfo = vm.getStore('CARD_INFO'),
				selectCity=vm.getStore('selectCity');

			if(cardInfo) vm.set('cardInfo',cardInfo);
			if(selectCity) vm.set('selectCity',selectCity);

			Jsborya.getGuestInfo({
				slot:cardInfo ? cardInfo.slot : '-2',
				complete:function(userInfo){
					vm.set('userInfo',userInfo);

					if(userInfo.iccid=='666666666666'){
						vm.set('off.showBtmEntry',false);
						Jsborya.setHeader({
							title:'随心搜',
							left:{
								icon:'back_white',
								value:'返回',
								callback:''
							},
							right:{
								icon:'',
								value:'去购卡',
								callback:'headerRightClick'
							}
						});
					}

					Jsborya.registerMethods('headerRightClick',function(){
						if(userInfo.iccid=='666666666666'){//无卡找号
							vm.toBuyHelpPage();
							return false;
						}
					});

					vm.callMethod('setPage');
					vm.callMethod('getCardList');
					vm.callMethod('getLableList');
				}
			});
	    },
	    mounted:function(){
	    	
	    }
	},
	methods:{
		setPage:function(){
			setTimeout(function(){
	    		let window_h=document.documentElement.clientHeight||window.innerHeight||document.body.clientHeight;
				let window_w=document.documentElement.clientWidth||window.innerWidth||document.body.clientWidth;

				let otherHeight = 60 + 50 + 30,
					btmImgH = window_w * 323/1242,
					showBtmEntry = vm.get('off').showBtmEntry;
				if(showBtmEntry)otherHeight += btmImgH;
				
				otherHeight = parseInt(otherHeight);
				
		    	vm.set('boxHt',`height:${ window_h - otherHeight - 1 }px`);
				vm.set('otherHeight',otherHeight);
				vm.set('windowHeight',window_h);
				// vm.set('pageSize',Math.floor( (window_h - otherHeight) / 40) );
		    },300);
	    	
		},
		getLableList:function(){
			vm.AJAX('/tas/w/source/tagList',{
	  			params:'',
	  			userInfo:vm.get('userInfo')
	  		},function(data){
				vm.set('hotLabel',data.data.list);
				let w = 0;
				data.data.list.forEach((val)=>{
					w+=val.name.length;
				});
				
				vm.set('hotWide',`width:${ w * 13 + data.data.list.length * (20+10)}px`);
			},true);
		},
		getCardList:function(page,closeLoad){//获取数据
			const json={
	  			params:{
	  				phoneExam:'',
	  				cityCode:vm.get('selectCity').cityCode,
	  				ytDbOneCount:vm.get('cardData').ytDbOneCount,
	  				priDbOneCount:'-1',
	  				page:page||1,
	  				pageSize:vm.get('pageSize'),
	  				belongType:0,
	  				type:vm.get('selectLabel').type,
	  				tag:vm.get('selectLabel').tag,
	  				typeRandStatus:1,
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
	  		if(!page){
	  			//vm.set('cardData',{ytDbOneCount:'-1', priDbOneCount:'-1', list:[]});
	  			document.getElementById("cardBox").scrollTop=0;
	  		}

	  		vm.set('off.showNoMore',false);
			vm.AJAX('/tas/w/source/phoneList',json,function(data){
				vm.set('page',json.params.page);
				vm.set('cardData.ytDbOneCount',data.data.ytDbOneCount);

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
		cityClick:function(){//城市切换
			vm.setStore('selectCity',vm.get('selectCity'));

			Jsborya.pageJump({
                url:'city.html?back=index',
                stepCode:'999',
                depiction:'选择城市',
                destroyed:false,
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:vm.getHeaderColor(vm.get('cardInfo').deviceType),
                }
            });
		},
		inputKeyup:function(e){//键盘事件
			if(e.keyCode==13){
				vm.callMethod('inputSearchClick');
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
			
			setTimeout(function(){
				Jsborya.pageJump({
	                url:'search.html?inputValue='+value,
	                stepCode:'999',
	                depiction:'号码搜索',
	                destroyed:false,
	                header:{
	                    frontColor:'#ffffff',
	                    backgroundColor:vm.getHeaderColor(vm.get('cardInfo').deviceType),
	                }
	            });
	            vm.callMethod('inputClearClick')

			},300);
		},
		inputClearClick:function(){//清除输入框
			vm.set('inputValue','');
		},

		labelClick:function(e){//标签点击
			let hotLabel=vm.get('hotLabel'),
				index=e.target.title;

			if(hotLabel[index].name == vm.get('selectLabel').name){
				vm.set('selectLabel',{name:hotLabel[0].name,type:hotLabel[0].type,tag:hotLabel[0].tag});
			}else{
				vm.set('selectLabel',{name:hotLabel[index].name,type:hotLabel[index].type,tag:hotLabel[index].tag});
			}
			vm.set('inputValue','');

			vm.callMethod('getCardList');
		},
		jumpPackage:function(index){
			let phoneData=vm.get('cardData').list[parseInt(index)];
			vm.setStore('CARD_INFO',Object.assign(vm.get('cardInfo'),{
				phone:phoneData.phoneNum,
				cityName:phoneData.cityName,
				cityCode:phoneData.cityCode,
				pretty:phoneData.pretty,
				phoneMoney:phoneData.cardMoney,
				phoneLevel:phoneData.numberLevel,
				discount:10000,
				belongType:phoneData.belongType,
			}));

			vm.removeStore('selectPackage');

			if(phoneData.belongType == 1){
				Jsborya.pageJump({
	                url:'packageDevoted.html',
	                stepCode:'999',
	                depiction:'选择套餐',
	                destroyed:false,
	                header:{
	                    frontColor:'#ffffff',
	                    backgroundColor:vm.getHeaderColor(vm.get('cardInfo').deviceType),
	                }
	            });
			}else{
				Jsborya.pageJump({
	                url:'package.html',
	                stepCode:'999',
	                depiction:'选择套餐',
	                destroyed:false,
	                header:{
	                    frontColor:'#ffffff',
	                    backgroundColor:vm.getHeaderColor(vm.get('cardInfo').deviceType),
	                }
	            });
			}
			
		},
		jumpSearch(){
			Jsborya.pageJump({
                url:'search.html',
                stepCode:'999',
                depiction:'号码搜索',
                destroyed:false,
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:vm.getHeaderColor(vm.get('cardInfo').deviceType),
                }
            });
		},
		jumpDevoted(){
			// Jsborya.pageJump({
   //              url:'search.html?type=devoted',
   //              stepCode:'999',
   //              depiction:'专营号码',
   //              destroyed:false,
   //              header:{
   //                  frontColor:'#ffffff',
   //                  backgroundColor:vm.getHeaderColor(vm.get('cardInfo').deviceType),
   //              }
   //          });
   			Jsborya.pageJump({
				url:'',
				stepCode:801,
				depiction:'登录',
				data:{
					phone:''
				}
			});
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
		     
		},
		mathCentToYuan:function(phone){
			return this.mathCentToYuan(phone);
		},
	}
});

});