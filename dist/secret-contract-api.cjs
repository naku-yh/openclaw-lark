Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
require("./monitor-DQXz0h9T.cjs");
let openclaw_plugin_sdk_channel_secret_basic_runtime = require("openclaw/plugin-sdk/channel-secret-basic-runtime");
//#region secret-contract-api.ts
/**
* Copyright (c) 2026 ByteDance Ltd. and/or its affiliates
* SPDX-License-Identifier: MIT
*
* Feishu channel secret-contract registration. Declares which fields are
* SecretRef-shaped so OpenClaw's runtime resolves them at startup.
*/
const SECRET_FIELDS = [
	"appSecret",
	"encryptKey",
	"verificationToken"
];
/** Fields the Lark SDK only consumes when an account is in webhook mode. */
const WEBHOOK_ONLY_FIELDS = ["encryptKey", "verificationToken"];
const secretTargetRegistryEntries = SECRET_FIELDS.flatMap((field) => {
	const acctPath = `channels.feishu.accounts.*.${field}`;
	const topPath = `channels.feishu.${field}`;
	return [{
		id: acctPath,
		targetType: acctPath,
		configFile: "openclaw.json",
		pathPattern: acctPath,
		secretShape: "secret_input",
		expectedResolvedValue: "string",
		includeInPlan: true,
		includeInConfigure: true,
		includeInAudit: true
	}, {
		id: topPath,
		targetType: topPath,
		configFile: "openclaw.json",
		pathPattern: topPath,
		secretShape: "secret_input",
		expectedResolvedValue: "string",
		includeInPlan: true,
		includeInConfigure: true,
		includeInAudit: true
	}];
});
function collectRuntimeConfigAssignments(params) {
	const resolved = (0, openclaw_plugin_sdk_channel_secret_basic_runtime.getChannelSurface)(params.config, "feishu");
	if (!resolved) return;
	const { channel, surface } = resolved;
	(0, openclaw_plugin_sdk_channel_secret_basic_runtime.collectSimpleChannelFieldAssignments)({
		channelKey: "feishu",
		field: "appSecret",
		channel,
		surface,
		defaults: params.defaults,
		context: params.context,
		topInactiveReason: "no enabled Feishu account inherits this top-level appSecret.",
		accountInactiveReason: "Feishu account is disabled."
	});
	const baseConnectionMode = (0, openclaw_plugin_sdk_channel_secret_basic_runtime.normalizeSecretStringValue)(channel.connectionMode) === "webhook" ? "webhook" : "websocket";
	const resolveAccountMode = (account) => (0, openclaw_plugin_sdk_channel_secret_basic_runtime.hasOwnProperty)(account, "connectionMode") ? (0, openclaw_plugin_sdk_channel_secret_basic_runtime.normalizeSecretStringValue)(account.connectionMode) : baseConnectionMode;
	for (const field of WEBHOOK_ONLY_FIELDS) (0, openclaw_plugin_sdk_channel_secret_basic_runtime.collectConditionalChannelFieldAssignments)({
		channelKey: "feishu",
		field,
		channel,
		surface,
		defaults: params.defaults,
		context: params.context,
		topLevelActiveWithoutAccounts: baseConnectionMode === "webhook",
		topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !(0, openclaw_plugin_sdk_channel_secret_basic_runtime.hasOwnProperty)(account, field) && resolveAccountMode(account) === "webhook",
		accountActive: ({ account, enabled }) => enabled && resolveAccountMode(account) === "webhook",
		topInactiveReason: `no enabled Feishu webhook-mode surface inherits this top-level ${field}.`,
		accountInactiveReason: "Feishu account is disabled or not running in webhook mode."
	});
}
//#endregion
exports.collectRuntimeConfigAssignments = collectRuntimeConfigAssignments;
exports.secretTargetRegistryEntries = secretTargetRegistryEntries;
