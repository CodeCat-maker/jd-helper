var JD_HOST = "https://api.m.jd.com/client.action?";

var function_map = {
	threeMealInit:  getThreeMealReward, //三餐
	signInit:  getSignReward, //每日签到
	firstFeedInit:  firstFeedInit, //首次喂食
	browseSingleShopInit:  getSingleShopReward, //浏览店铺
	browseShopsInit:  getBrowseShopsReward, //浏览店铺s, 目前只有一个店铺
	feedReachInit:  feedReachInit, //喂食10次任务
	
	inviteFriendsInit:  inviteFriendsInit, //邀请好友, 暂未处理
};

async function taskEntrance() {
	console.log('entrance');
	console.log('任务开始');

	let task = await taskInit();
	let task_list = task.taskList;
	
	for (let task_name of task_list) {
		if (!task[task_name].finished) {
			console.log('任务' + task_name + '开始');
			await function_map[task_name](); 
		}else {
			console.log('任务' + task_name + '已完成');
		}
	}
	
	//任务列表中的完成后, 开始遛狗
	await petSport();
	await energyCollect();
	console.log('所有任务结束');
};

// 收取所有好感度
async function energyCollect() {
	let function_id = arguments.callee.name.toString();
	
	let response = await request(function_id);
	console.log(response.message);
	return;
}

// 首次投食 任务
async function firstFeedInit() {
	console.log('firstFeedInit');

	let response = await feedPets();
	console.log(response.message);
	return;
}

/**
 * 喂食10次 任务
 */
async function feedReachInit() {
	
	let function_id = arguments.callee.name.toString();
	for (var i = 0; i < 10; i++) {
		
		let task = await taskInit();
		if (task.feedReachInit.finished) {
			console.log('今天喂食10次任务已完成');
			break;
		}
		
		let response = await feedPets();
		
		if (response.code === '0' && response.message === "success" && response.resultCode === '0') { //单次浇水成功
			continue;
		}
		console.log('喂食10次任务已完成');
		break;
	}
	return;
}

//等待一下
function sleep(s) {
	console.log('歇口气儿~');
	return new Promise((resolve, reject) => {
		setTimeout(()=> {
			resolve();
		}, s * 1000);
	})
}

// 遛狗, 每天次数上限10次, 随机给狗粮, 每次遛狗结束需调用getSportReward领取奖励, 才能进行下一次遛狗
async function petSport() {
	console.log(arguments.callee.name.toString());

	var times = 0;
	while ((await request(arguments.callee.name.toString())).resultCode === '0' && times < 10){
		console.log('第'+times+'次遛狗完成');
		await getSportReward();
		times ++;
	}
	console.log('遛狗任务结束');
	
	return;
}

// 领取遛狗奖励
async function getSportReward() {
	
	console.log('领取遛狗奖励');
	let response = await request(arguments.callee.name.toString());
	console.log(response);
	return;
}

// 浏览店铺任务, 任务可能为多个? 目前只有一个
async function getBrowseShopsReward() {
	console.log(arguments.callee.name.toString());
	let response = await request(arguments.callee.name.toString());
	console.log('浏览店铺任务' + response.message);
	return;
}

// 浏览指定店铺 任务
async function getSingleShopReward() {
	console.log(arguments.callee.name.toString());
	let response = await request(arguments.callee.name.toString());
	console.log('浏览指定店铺' + response.message);
	return;
}

// 三餐签到, 每天三段签到时间
async function getThreeMealReward() {
	console.log(arguments.callee.name.toString());
	let response = await request(arguments.callee.name.toString());
	console.log('三餐签到' + response.message);
}

// 每日签到, 每天一次
async function getSignReward() {
	console.log(arguments.callee.name.toString());
	let response = await request(arguments.callee.name.toString());
	console.log('每日签到' + response.message);
}

// 投食
async function feedPets() {
	console.log(arguments.callee.name.toString());

	let response = await request(arguments.callee.name.toString());
	console.log(response);
	return response;
}

// 邀请好友
async function inviteFriendsInit() {
	console.log(arguments.callee.name.toString());
	console.log('该功能未完成');
	return false;
}

// 可查询任务完成情况
async function taskInit() {
	console.log(arguments.callee.name.toString());
	let response = await request(arguments.callee.name.toString());
	console.log(response);
	return response.result;
}

// 请求
async function request(function_id, body = {}){
	await sleep(2); //歇口气儿, 不然会报操作频繁
	return new Promise((resolve, reject) => {
		fetch(JD_HOST + 'functionId='+function_id+'&appid=wh5&loginWQBiz=pet-town&body=' + JSON.stringify(body), {
				credentials: "include",
			})
			.then(res => {
				return res.json();
			})
			.then((response)=> {
				resolve(response);
			});
	})
}
taskEntrance();