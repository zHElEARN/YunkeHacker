// ==UserScript==
// @name         YunkeHacker
// @namespace    http://liuzeyun.tech/
// @version      0.1
// @description  云课堂工具箱
// @author       Zhe_Learn
// @match        *://*.yunke.com/*
// @grant        GM.setValue
// @grant        GM.getValue
// @require      https://code.jquery.com/jquery-3.4.0.min.js
// @require      https://cdn.bootcss.com/mdui/0.4.3/js/mdui.min.js
// ==/UserScript==

(function() {
	"use strict";

	$("li.tab-trigger.statistics.tab-trigger-chat.special_org_hide").css("display", "block!important");

	function getCookie(name) {
		var cookies = document.cookie;
		var list = cookies.split("; ");
		for (var i = 0; i < list.length; i++) {
			var arr = list[i].split("=");
			if (arr[0] == name) return decodeURIComponent(arr[1]);
		}
		return "";
	}

	GM.setValue("configured", false);

	var importFile = {
		css: function(path) {
			if (!path || path.length === 0) {
				throw new Error('参数"path"错误');
			}
			var head = document.getElementsByTagName("head")[0];
			var link = document.createElement("link");
			link.href = path;
			link.rel = "stylesheet";
			link.type = "text/css";
			head.appendChild(link);
		},
		js: function(path) {
			if (!path || path.length === 0) {
				throw new Error('参数"path"错误');
			}
			var head = document.getElementsByTagName("head")[0];
			var script = document.createElement("script");
			script.src = path;
			script.type = "text/javascript";
			head.appendChild(script);
		}
	};

	importFile.css("https://cdn.bootcss.com/mdui/0.4.3/css/mdui.min.css");

	let tab = $("#tabTriggers");
	tab.append(
		'<li class="tab-trigger" id="custom_tools"> \
        <i class="icon icon-tab-datum icon-normal"></i> \
        <i class="icon icon-tab-datum-active icon-active"></i> \
        <p>工具</p> \
    </li> \
    <li class="tab-trigger" id="send_message"> \
        <i class="icon icon-tab-datum icon-normal"></i> \
        <i class="icon icon-tab-datum-active icon-active"></i> \
        <p>发送</p> \
    </li>'
	);

	let config_data = () => {
		mdui.dialog({
			title: "配置信息",
			content:
				'<div> \
                    <div class="mdui-textfield mdui-textfield-floating-label"> \
                        <label class="mdui-textfield-label">用户Id</label> \
                        <input id="user_id" class="mdui-textfield-input" type="text"/> \
                    </div> \
                    <div class="mdui-textfield mdui-textfield-floating-label"> \
                        <label class="mdui-textfield-label">课程Id</label> \
                        <input id="plan_id" class="mdui-textfield-input" type="text"/> \
                    </div> \
                    <div class="mdui-textfield mdui-textfield-floating-label"> \
                        <label class="mdui-textfield-label">Token</label> \
                        <input id="user_token" class="mdui-textfield-input" type="text"/> \
                    </div> \
                </div>',
			buttons: [
				{
					text: "自动获取",
					close: false,
					onClick: function(inst) {
						$("#user_id").val(getCookie("uid"));
						$("#user_token").val(getCookie("token"));
						let plan_id = window.location.href.split("/")[4];
						if (plan_id.indexOf("mdui-dialog") != -1) {
							plan_id = plan_id.split("#")[0];
						}
						$("#plan_id").val(plan_id);
						mdui.updateTextFields(".mdui-textfield");
					}
				},
				{
					text: "取消"
				},
				{
					text: "确认",
					onClick: function(inst) {
						let el_user_id = $("#user_id");
						let el_plan_id = $("#plan_id");
						let el_user_token = $("#user_token");

						let b_error = false;
						let ws;

						try {
							ws = new WebSocket("wss://message.yunke.com/message.plan.ws?getOnlineUserSignal=0");

							ws.onopen = () => {
								let param = {
									MessageType: "get",
									PlanId: Number(el_plan_id.val()),
									UserFlagFrom: "13b2d",
									TextLimit: -50,
									StartGoodId: 0,
									StartTextId: 0,
									StartSignalId: 0,
									UserIdFrom: Number(el_user_id.val()),
									DeviceType: 10
								};

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
						} catch (error) {
							mdui.snackbar({
								message: "配置失败",
								position: "right-top"
							});
							console.log(error);
							b_error = true;
						}

						if (!b_error) {
							GM.setValue("user_id", Number(el_user_id.val()));
							GM.setValue("plan_id", Number(el_plan_id.val()));
							GM.setValue("user_token", el_user_token.val());
							GM.setValue("configured", true);

							unsafeWindow.user_ws = ws;

							mdui.snackbar({
								message: "配置完成",
								position: "right-bottom"
							});
						}
					}
				}
			]
		});
	};

	let send_message = async () => {
		let configured;
		configured = await GM.getValue("configured");

		if (!configured) {
			mdui.snackbar({
				message: "你还没有配置",
				position: "right-bottom"
			});
			return;
		}

		let user_id = await GM.getValue("user_id");
		let plan_id = await GM.getValue("plan_id");
		let user_token = await GM.getValue("user_token");
		let ws = unsafeWindow.user_ws;

		console.log(ws);

		let message = "";

		mdui.prompt(
			"请输入信息",
			function(value) {
				message = value;
				let messageParam = {
					plan_id: plan_id,
					user_from_id: user_id,
					user_from_token: user_token,
					message_type: "text",
					type: 1,
					device_type: 10,
					content: message,
					unique_id: Date.now()
				};

				ws.send(JSON.stringify(messageParam));
			},
			function(value) {},
			{
				type: "textarea"
			}
		);
	};

	$("#custom_tools").click(config_data);
	$("#send_message").click(send_message);
})();
