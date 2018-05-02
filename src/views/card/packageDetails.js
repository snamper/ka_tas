require('../../public.js');
require('../../assets/css/packageDetails.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			prestore:0,//选择的预存
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
                "prestoreMoney": "0"
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
					value:'',
					callback:''
				},
				right:{
					icon:'',
					value:'',
					callback:''
				}
			});
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			var code=vm.getUrlParam('code');
			var phoneLevel=vm.getUrlParam('phoneLevel');
			if(code&&phoneLevel){
				var selectPackage=vm.getStore('selectPackage');
				vm.set('selectPackage',selectPackage);
				Jsborya.getGuestInfo(function(userInfo){
					vm.set('userInfo',userInfo);
					vm.callMethod('getPackageInfo',[code,phoneLevel]);
				});
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
			vm.AJAX('/ka_tas/w/source/packageInfo',json,function(data){
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
				}
				
				vm.set('packageInfo',data.data);
			});
		},
		shiftSelPackage:function(e){
			var btn,index=parseInt(e.target.title);
			var selPackage=vm.get('packageInfo').selPackage[index];
			selPackage.init==2 ? btn=['关闭'] : e.target.className=='active' ? btn=['不选择','关闭'] : btn=['选择','关闭'];

			layer.open({
				content:'<div class="select-info f-scroll"><dl><dt>可选包名称</dt><dd class="b">'+selPackage.title+'</dd></dl><dl><dt>资费标准</dt><dd>'+selPackage.standard+'</dd></dl><dl><dt>资费说明</dt><dd>'+selPackage.feeDescribe+'</dd></dl></div>',
				btn:btn,
				style:'width:95%;max-width:540px;',
				type:1,
				yes:function(){
					selPackage.init!=2&&(e.target.className=='active' ? e.target.className='' : e.target.className='active');
					layer.closeAll();
				},
				no:function(){
					layer.closeAll();
				}
			})
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