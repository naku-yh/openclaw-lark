import { OpenClawConfig } from "openclaw/plugin-sdk";
import { ResolverContext, SecretDefaults, SecretTargetRegistryEntry } from "openclaw/plugin-sdk/channel-secret-basic-runtime";

//#region secret-contract-api.d.ts
declare const secretTargetRegistryEntries: readonly SecretTargetRegistryEntry[];
declare function collectRuntimeConfigAssignments(params: {
  config: OpenClawConfig;
  defaults: SecretDefaults | undefined;
  context: ResolverContext;
}): void;
//#endregion
export { collectRuntimeConfigAssignments, secretTargetRegistryEntries };