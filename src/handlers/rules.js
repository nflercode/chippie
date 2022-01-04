import { PLAYER_ACTIONS } from '../constants/player-actions.js';

const NUM_BUY_IN_ROUNDS = 2;

function canICheck (roundActions, playerId) {
  if (roundActions.length < NUM_BUY_IN_ROUNDS) {
    return [false, undefined];
  }

  const [myLastAction, previousBettorAction] = getMyLastActionAndPreviousBettorAction(
    roundActions,
    playerId
  );

  if (!previousBettorAction) {
    console.log('Previous bettor is undefined. All participants might have folded. Can\'t check.');
    return [false, undefined];
  }

  if ((myLastAction?.totalBettedValue || 0) === previousBettorAction.totalBettedValue) {
    return [true, (myLastAction?.totalBettedValue || 0)];
  }

  return [false, undefined];
}

function canICall (roundActions, playerId, bettingValue) {
  if (roundActions.length < NUM_BUY_IN_ROUNDS) {
    console.log('No actions has been performed');
    return [false, undefined];
  }

  const [myLastAction, previousBettorAction] = getMyLastActionAndPreviousBettorAction(
    roundActions,
    playerId
  );

  if (!previousBettorAction) {
    console.log('Previous bettor is undefined. All participants might have folded. Can\'t call.');
    return false;
  }

  const subTotalBettingValue = (myLastAction?.totalBettedValue || 0) + bettingValue;
  if (subTotalBettingValue === previousBettorAction.totalBettedValue) {
    return [true, subTotalBettingValue];
  }

  console.log(`betted amount '${bettingValue}', total '${subTotalBettingValue}'
    is not equal to ${previousBettorAction.totalBettedValue}`);

  return [false, undefined];
}

function canIRaise (roundActions, playerId, bettingValue) {
  if (roundActions.length < NUM_BUY_IN_ROUNDS) {
    return [false, bettingValue];
  }

  const [myLastAction, previousBettorAction] = getMyLastActionAndPreviousBettorAction(
    roundActions,
    playerId
  );

  if (!previousBettorAction) {
    console.log('Previous bettor is undefined. All participants might have folded. Can\'t raise.');
    return [false, undefined];
  }

  const subTotalBettingValue = (myLastAction?.totalBettedValue || 0) + bettingValue;
  if (subTotalBettingValue > previousBettorAction.totalBettedValue) {
    return [true, subTotalBettingValue];
  }

  console.log(`betted amount '${bettingValue}', total '${subTotalBettingValue}'
  is not larger than ${previousBettorAction.totalBettedValue}`);

  return [false, undefined];
}

function canIFold (roundActions, playerId) {
  if (roundActions.length < NUM_BUY_IN_ROUNDS) {
    return [false, undefined];
  }

  const [myLastAction, previousBettorAction] = getMyLastActionAndPreviousBettorAction(
    roundActions,
    playerId
  );

  if (!previousBettorAction) {
    console.log(`Previous bettor action is undefined.
      All participants might have folded. Can't fold.`);
    return [false, undefined];
  }

  return [true, (myLastAction?.totalBettedValue || 0)];
}

function getMyLastActionAndPreviousBettorAction (roundActions, playerId) {
  roundActions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const playerIndex = roundActions.findIndex(action => action.playerId === playerId);
  const endIndex = playerIndex === -1 ? roundActions.length : playerIndex;

  const validRoundActionsFromPlayerLastTurn =
    roundActions
      .slice(0, endIndex)
      .filter(x => x.actionType !== PLAYER_ACTIONS.FOLD);

  return [
    roundActions[playerIndex],
    validRoundActionsFromPlayerLastTurn[0]
  ];
}

const rules = { canICheck, canICall, canIFold, canIRaise };
export default rules;
