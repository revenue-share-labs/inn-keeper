import abi from 'human-standard-token-abi';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { ExplainTxResponse } from '@/background/service/openapi';

const hstInterface = new ethers.utils.Interface(abi);

export function getTokenData(data: string) {
  try {
    return hstInterface.parseTransaction({ data });
  } catch (error) {
    return undefined;
  }
}

export function getTokenAddressParam(
  tokenData: ethers.utils.TransactionDescription
): string {
  const value = tokenData?.args?._to || tokenData?.args?.[0];
  return value?.toString().toLowerCase();
}

export function calcTokenValue(value: string, decimals: number) {
  const multiplier = Math.pow(10, Number(decimals || 0));
  return new BigNumber(String(value)).times(multiplier);
}

export function getCustomTxParamsData(
  data,
  {
    customPermissionAmount,
    decimals,
  }: { customPermissionAmount: string; decimals: number }
) {
  const tokenData = getTokenData(data);

  if (!tokenData) {
    throw new Error('Invalid data');
  }
  let spender = getTokenAddressParam(tokenData);
  if (spender.startsWith('0x')) {
    spender = spender.substring(2);
  }
  const [signature, tokenValue] = data.split(spender);

  if (!signature || !tokenValue) {
    throw new Error('Invalid data');
  } else if (tokenValue.length !== 64) {
    throw new Error(
      'Invalid token value; should be exactly 64 hex digits long (u256)'
    );
  }

  let customPermissionValue = calcTokenValue(
    customPermissionAmount,
    decimals
  ).toString(16);

  if (customPermissionValue.length > 64) {
    throw new Error('Custom value is larger than u256');
  }

  customPermissionValue = customPermissionValue.padStart(
    tokenValue.length,
    '0'
  );
  const customTxParamsData = `${signature}${spender}${customPermissionValue}`;
  return customTxParamsData;
}

export function varyTxSignType(txDetail: ExplainTxResponse | null) {
  let isNFT = false;
  let isToken = false;
  let gaCategory: 'Security' | 'Send' = 'Send';
  let gaAction:
    | 'signTx'
    | 'signDeclineTokenApproval'
    | 'signDeclineNFTApproval'
    | 'signDeclineTokenAndNFTApproval' = 'signTx';

  if (
    txDetail?.type_deploy_contract ||
    txDetail?.type_cancel_tx ||
    txDetail?.type_call
  ) {
    // nothing to do
  }
  if (
    txDetail?.type_cancel_token_approval ||
    txDetail?.type_cancel_single_nft_approval ||
    txDetail?.type_cancel_nft_collection_approval
  ) {
    gaCategory = 'Security';
  } else {
    gaCategory = 'Send';
  }

  if (
    txDetail?.type_send ||
    txDetail?.type_cancel_token_approval ||
    txDetail?.type_token_approval
  ) {
    isToken = true;
  }

  if (
    txDetail?.type_cancel_single_nft_approval ||
    txDetail?.type_cancel_nft_collection_approval ||
    txDetail?.type_single_nft_approval ||
    txDetail?.type_nft_collection_approval ||
    txDetail?.type_nft_send
  ) {
    isNFT = true;
  }

  if (gaCategory === 'Security') {
    if (isToken && !isNFT) {
      gaAction = 'signDeclineTokenApproval';
    } else if (!isToken && isNFT) {
      gaAction = 'signDeclineNFTApproval';
    } else if (isToken && isNFT) {
      gaAction = 'signDeclineTokenAndNFTApproval';
    }
  }

  return {
    gaCategory,
    gaAction,
    isNFT,
    isToken,
  };
}