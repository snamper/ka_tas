require('../../public.js');
require('./css/packageDetails.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			prestore:0,//选择的预存
		},
		cardInfo:{//卡槽信息
			slot:0,
			deviceType:1,
			iccid:''
		},
		selectPackage:{
			name:'',
			packageCode:0,
			selPackCode:0,
			prestore:0,
		},
		packageInfo: {
	        "standard": "--",
	        "feeDescribe": "--",//资费说明
	        "code": "0",
	        "title": "--",
	        "info": {//资费标准
	            "answer": "--",
	            "voiceDialing": "0",
	            "beyondFee": "--",
	            "lowConsumption": "0",
	            "callerID": "--",
	            "message": "0",
	            "flowZero": "--",
	            "monthlyFee": "0",
	            "flow": "0",
	            "remarks": "--",
	            "voiceZero": "--"
	        },
	        "selPackage": [{//可选包
                "standard": "--",//资费标准
                "init": "0",
                "feeDescribe": "--",//资费说明
                "code": "0",
                "title": "--"
            }],
	        "prestoreMoneyList": [{//预存
                "init": "0",
                "prestoreMoney": "0",
                "discount":10000
            }],
	    },
		userInfo:'',//用户信息
	},
	hooks: {
	    init: function() {
			vm=this;
			Jsborya.setHeader({
				title:'套餐详情',
				left:{
					icon:'back_white',
					value:'返回',
					callback:''
				},
				right:{
					icon:'',
					value:'',
					callback:''
				}
			});
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			let code=vm.getUrlParam('code'),
				phoneLevel=vm.getUrlParam('phoneLevel'),
				cardInfo=vm.getStore('CARD_INFO');
				
			if(code&&phoneLevel){
				var selectPackage=vm.getStore('selectPackage');
				vm.set('selectPackage',selectPackage);

				let userInfo = vm.getStore("USER_INFO");
				if(userInfo){
					vm.set('userInfo',userInfo);
					vm.callMethod('getPackageInfo',[code,phoneLevel]);
				}
			}else{
				alert('页面URL参数错误');
			}
	    },
	},
	methods:{
		getPackageInfo:function(code,phoneLevel){//
			const json={
	  			params:{
	  				packageCode:code,
	  				numberLevel:phoneLevel
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('/tas/w/source/packageInfo',json,function(data){
				let selectPackage=vm.get('selectPackage'),
					prestoreMoneyList=data.data.prestoreMoneyList,
					selPackage=data.data.selPackage;

				if(selectPackage.packageCode==data.data.code){
					for(let i=0,len=prestoreMoneyList.length;i<len;i++){
						if(prestoreMoneyList[i].prestoreMoney==selectPackage.prestore){
							data.data.prestoreMoneyList[i].init=1;
							vm.set('off.prestore',i);
						}else data.data.prestoreMoneyList[i].init=0;
					}
					let selCodeArr=[];
					if(selectPackage.selPackCode)selCodeArr=selectPackage.selPackCode.split('|');//选中的可选包code
					for(let i=0,len=selPackage.length;i<len;i++){
						if(selCodeArr.length){
							for(let j=0,lenj=selCodeArr.length;j<lenj;j++){
								if(selPackage[i].code==selCodeArr[j]){
									if(selPackage[i].init==0)data.data.selPackage[i].init=1;//默认未选中更改为选中
									break;
								}else data.data.selPackage[i].init=0;
							}
						}else data.data.selPackage[i].init=0;//未选中任何可选包
					}
				}else{
					prestoreMoneyList.forEach((item,index)=>{
						if(item.init==1) vm.set('off.prestore',index);
					});
				}
				
				vm.set('packageInfo',data.data);
			});
		},
		shiftSelPackage:function(e){
			var btn, index = parseInt(e.target.title), isSelect;
			var selPackage = vm.get('packageInfo').selPackage[index];
			//selPackage.init==2 ? btn=['关闭'] : e.target.className=='active' ? btn=['不选择','关闭'] : btn=['选择','关闭'];

			if(selPackage.init==2){
				var result={type:'NOT_OPTIONAL'};
			}else{
				if(e.target.className=='active'){
					isSelect=true;
				}else{
					isSelect=false;
				}
				var result=vm.callMethod('filerSelectInfo',[index,isSelect]);
			}

			if(result.type=='SELECT'){
				btn=['选择','关闭'];
			}else if(result.type=='NOT_SELECT'){
				btn=['不选择','关闭'];
			}else if(result.type=='NOT_OPTIONAL'){
				btn=['关闭'];
			}else btn=['选择','关闭'];

			layer.open({
				content:'<div class="select-info f-scroll"><dl><dt>可选包名称</dt><dd class="b">'+selPackage.title+'</dd></dl><dl><dt>资费标准</dt><dd>'+selPackage.standard+'</dd></dl><dl><dt>资费说明</dt><dd>'+selPackage.feeDescribe+'</dd></dl></div>',
				btn:btn,
				style:'width:95%;max-width:540px;',
				type:1,
				yes:function(){
					if(result.type=='SELECT'){
						e.target.className='active';
					}else if(result.type=='NOT_SELECT'){
						e.target.className='';
					}
					if(typeof result.callback=='function')result.callback();

					//selPackage.init!=2&&(e.target.className=='active' ? e.target.className='' : e.target.className='active');
					layer.closeAll();
				},
				no:function(){
					layer.closeAll();
				}
			})
		},
		filerSelectInfo:function(clickIndex,isSelect){//判断当前可选包选择状态
			let selPackage = vm.get('packageInfo').selPackage;//当前所在的可选包组
			let bagUl=document.getElementById('selPackageUl');
			let selectedArr=[];//当前已选中的所有可选包
			let ruleSelected=[];//规则内已选
			let ruleNoSelect=[];//规则内未选

			if(selPackage[clickIndex].relevantList[0]){
				var ruleStr=selPackage[clickIndex].relevantList[0].relevantOptPacks+','+selPackage[clickIndex].code;//组装规则
			}else if(isSelect){
				return {type:'NOT_SELECT'};
			}else return {type:'SELECT'};

			let ruleCodeArr=ruleStr.split(',');//规则内的code
			let min=parseInt(selPackage[clickIndex].relevantList[0].minNums);//最小可选数
			let max=parseInt(selPackage[clickIndex].relevantList[0].maxNums);//最大可选数

			//获取已选中的所有可选包
			for(let i=0;i<bagUl.childNodes.length;i++){
				if(bagUl.childNodes[i].nodeType===1&&bagUl.childNodes[i].className!=''){
					let index=bagUl.childNodes[i].title;
					selectedArr.push({code:selPackage[index].code,key:index});
				}
			}
			//获取规则内已选和未选

			ruleCodeArr.forEach((val_i,i)=>{
				// let c=selectedArr.findIndex((val_j,j)=>{兼容问题放弃此写法
				// 	return val_i==val_j.code;
				// });
				let c = -1;
				for(let j = 0,len = selectedArr.length;j<len;j++){
					if(val_i==selectedArr[j].code){
						c = j;
						break;
					}
				}
				
				if(c!=-1){
					ruleSelected.push(selectedArr[c]);
				}else{
					ruleNoSelect.push({code:ruleCodeArr[i]});
				}
			});

			//获取规则内未选的key
			selPackage.forEach((val_i,i)=>{
				ruleNoSelect.forEach((val_j,j)=>{
					if(val_j==val_i)ruleNoSelect[j].key=i;
				});
			});
			//console.log(ruleSelected,ruleNoSelect,ruleCodeArr);
			let selectNums=ruleSelected.length;//已选中数

			if(min==0){
				if(isSelect){
					return {type:'NOT_SELECT'};
				}else{
					if(selectNums>=max){
						return {type:'NOT_OPTIONAL'};
					}else return {type:'SELECT'};
				}
			}else if(min==max){
				if(isSelect){
					if(selectNums>=max){
						return {type:'NOT_OPTIONAL'};
					}else return {
						type:'NOT_SELECT',
						callback:function(){
							for(let i=0;i<max;i++){
								vm.callMethod('setClass',[ruleNoSelect[i].key,1]);
							}
						}
					}
					
				}else return {
						type:'SELECT',
						callback:function(){
							vm.callMethod('setClass',[ruleSelected[0].key,2]);
						}
					}
			}else if(max>min){
				if(selectNums==min){
					if(isSelect){
						return {type:'NOT_OPTIONAL'};
					}else return {type:'SELECT'};
				}else if(selectNums>min&&selectNums<max){
					if(isSelect){
						return {type:'NOT_SELECT'};
					}else return {type:'SELECT'};
				}else if(selectNums==max){
					if(isSelect){
						return {type:'NOT_SELECT'};
					}else return {
							type:'SELECT',
							callback:function(){
								vm.callMethod('setClass',[ruleSelected[0].key,2]);
							}
						}
				}else return {type:'NOT_OPTIONAL'};
			}
		},
		setClass:function(index,type){//设置在index位置的元素,type:1,新增class;2,移除class
			let bagUl=document.getElementById('selPackageUl');

			for(let i=0;i<bagUl.childNodes.length;i++){
				if(bagUl.childNodes[i].nodeType===1&&index==i){
					if(type==1)bagUl.childNodes[i].className='active';
					if(type==2)bagUl.childNodes[i].className='';
				}
			}
		},
		makeSure:function(){
			if(vm.get('packageInfo').code=="0")return false;
			var pack=vm.get('packageInfo');

			const getSelPackageCode=function(){//获取选中的可以选包code
				let ret='',selPackage=pack.selPackage,selPackageUl=document.getElementById('selPackageUl');
				for(let i=0;i<selPackageUl.childNodes.length;i++){
					if(selPackageUl.childNodes[i].nodeType===1&&selPackageUl.childNodes[i].className!=''){
						ret+=selPackage[selPackageUl.childNodes[i].title].code+'|';
					}
				}
				return ret.substring(0,ret.length-1);
			};
			vm.setStore('selectPackage',{
				name:pack.title,
				packageCode:pack.code,
				selPackCode:getSelPackageCode(),
				prestore:pack.prestoreMoneyList[vm.get('off').prestore].prestoreMoney,
				discount:parseInt(pack.prestoreMoneyList[vm.get('off').prestore].discount)
			});

			Jsborya.pageBack({
				url:'package.html',
				isLoad:true
			});
		},
		shiftPrestore:function(e){
			vm.set('off.prestore',parseInt(e.target.title));
			vm.callMethod('siblingC',[e.target]);
		},
		siblingC:function(e){//同级元素，class切换
			var parent=e.parentNode;
			for(var i=0;i<parent.childNodes.length;i++){
				if(parent.childNodes[i].nodeType===1)parent.childNodes[i].className='';
			}
			e.className='active';
		},
		phoneFormat:function(phone){
			return this.phoneFormat(phone);
		},
		mathCentToYuan:function(value){
	    	return parseInt(value)/100;
	    },
		mathDiscount:function(money,discount){
			return vm.mathDiscount(money,discount);
		},
		filterBr:function(str){
			return str?str.split('<br>'):str=[];
		},
	}
});


});