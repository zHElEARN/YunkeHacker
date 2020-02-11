let ws;

let user_id; // 你的用户Id
let plan_id; // 你的课程Id
let user_token; // 你的Token
let url = "wss://message.yunke.com/message.plan.ws?getOnlineUserSignal=0"; // 直播发送信息API

// 获得当前时间戳
let get_time = () => {
	return Date.now();
};

// 开始爆破
let crack = () => {
	ws = new WebSocket(url);

	ws.onopen = () => {
		let param = { MessageType: "get", PlanId: plan_id, UserFlagFrom: "13b2d", TextLimit: -50, StartGoodId: 0, StartTextId: 0, StartSignalId: 0, UserIdFrom: user_id, DeviceType: 10 };

		ws.send(JSON.stringify(param));
	};

	ws.onmessage = event => {
		let data = event.data;
		console.log("获得数据: " + data);
	};

	setInterval(() => {
		let param = {};
		ws.send(JSON.stringify(param));
	}, 11000);
};

// 发送自己的信息
let send_message = message => {
	let time = get_time();

	let messageParam = {
		plan_id: plan_id,
		user_from_id: user_id,
		user_from_token: user_token,
		message_type: "text",
		type: 1,
		device_type: 10,
		content: message,
		unique_id: time
	};

	ws.send(JSON.stringify(messageParam));
};
