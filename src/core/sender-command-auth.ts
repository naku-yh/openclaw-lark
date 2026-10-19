/**
 * Legacy sender command authorization, ported from the host's removed
 * `openclaw/plugin-sdk/command-auth` export (dropped in host 2026.10.x in
 * favor of channel ingress). This port keeps the fork's DM/group allowlist
 * flow byte-for-byte: the host now resolves command auth inside ingress, so
 * plugins composing it from allowlists must carry the logic themselves.
 *
 * Access-group expansion branches from the original are omitted on purpose:
 * this fork never passes a channel/accountId, so those branches were dead.
 */

import { resolveDmGroupAccessWithLists } from 'openclaw/plugin-sdk/channel-policy';

export interface ResolveSenderCommandAuthorizationParams<TCfg = Record<string, unknown>> {
  cfg: TCfg;
  rawBody: string;
  isGroup: boolean;
  dmPolicy: string;
  configuredAllowFrom: string[];
  configuredGroupAllowFrom?: string[];
  senderId: string;
  isSenderAllowed: (senderId: string, allowFrom: string[]) => boolean;
  readAllowFromStore: () => Promise<string[]>;
  shouldComputeCommandAuthorized: (rawBody: string, cfg: TCfg) => boolean;
  resolveCommandAuthorizedFromAuthorizers?: (params: {
    useAccessGroups: boolean;
    authorizers: Array<{ configured: boolean; allowed: boolean }>;
  }) => boolean;
}

export async function resolveSenderCommandAuthorization<TCfg>(params: ResolveSenderCommandAuthorizationParams<TCfg>) {
  const shouldComputeAuth = params.shouldComputeCommandAuthorized(params.rawBody, params.cfg);
  const storeAllowFrom =
    !params.isGroup && params.dmPolicy !== 'allowlist' && params.dmPolicy !== 'open'
      ? await params.readAllowFromStore().catch(() => [])
      : [];

  const access = resolveDmGroupAccessWithLists({
    isGroup: params.isGroup,
    dmPolicy: params.dmPolicy,
    groupPolicy: 'allowlist',
    allowFrom: params.configuredAllowFrom,
    groupAllowFrom: params.configuredGroupAllowFrom ?? [],
    storeAllowFrom,
    isSenderAllowed: (allowFrom) => params.isSenderAllowed(params.senderId, allowFrom),
  });
  const effectiveAllowFrom = access.effectiveAllowFrom;
  const effectiveGroupAllowFrom = access.effectiveGroupAllowFrom;

  const senderAllowedForCommands = params.isSenderAllowed(
    params.senderId,
    params.isGroup ? effectiveGroupAllowFrom : effectiveAllowFrom,
  );
  const ownerAllowedForCommands = params.isSenderAllowed(params.senderId, effectiveAllowFrom);
  const groupAllowedForCommands = params.isSenderAllowed(params.senderId, effectiveGroupAllowFrom);

  return {
    shouldComputeAuth,
    effectiveAllowFrom,
    effectiveGroupAllowFrom,
    senderAllowedForCommands,
    commandAuthorized: shouldComputeAuth
      ? params.resolveCommandAuthorizedFromAuthorizers?.({
          useAccessGroups: true,
          authorizers: [
            { configured: effectiveAllowFrom.length > 0, allowed: ownerAllowedForCommands },
            { configured: effectiveGroupAllowFrom.length > 0, allowed: groupAllowedForCommands },
          ],
        }) ?? senderAllowedForCommands
      : undefined,
  };
}
